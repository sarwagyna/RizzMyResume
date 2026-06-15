import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  jsonResponse,
  errorResponse,
  getAuthUser,
} from "../_shared/utils.ts";
import {
  createRazorpayOrder,
  getRazorpayConfig,
  verifyRazorpaySignature,
} from "../_shared/razorpay.ts";

const AMOUNT_PAISE = 5000;

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "create";

  const user = await getAuthUser(req);
  if (!user?.id) return errorResponse("Unauthorized", 401);

  let razorpayKeyId: string;
  try {
    razorpayKeyId = getRazorpayConfig().keyId;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Razorpay not configured";
    return errorResponse(message, 503);
  }

  const supabase = getServiceClient();

  if (action === "create" && req.method === "POST") {
    const { input_id, generation_id } = await req.json();
    if (!input_id) return errorResponse("input_id required");

    const { data: input, error: inputError } = await supabase
      .from("resume_inputs")
      .select("id")
      .eq("id", input_id)
      .eq("user_id", user.id)
      .single();

    if (inputError || !input) return errorResponse("Input not found", 404);

    if (generation_id) {
      const { data: generation, error: genError } = await supabase
        .from("generations")
        .select("id, input_id, payment_id, status")
        .eq("id", generation_id)
        .eq("user_id", user.id)
        .single();

      if (genError || !generation) {
        return errorResponse("Generation not found", 404);
      }

      if (generation.input_id !== input_id) {
        return errorResponse("Generation does not match this resume", 400);
      }

      if (generation.payment_id) {
        return errorResponse("This resume is already paid", 400);
      }

      if (generation.status !== "completed") {
        return errorResponse("Preview is not ready for payment yet", 400);
      }
    }

    const receipt = `rizzme_${input_id.slice(0, 8)}_${Date.now()}`;
    const order = await createRazorpayOrder(AMOUNT_PAISE, receipt, {
      input_id,
      user_id: user.id,
      ...(generation_id ? { generation_id } : {}),
    });

    const { data: payment, error: payError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        input_id,
        amount_paise: AMOUNT_PAISE,
        razorpay_order_id: order.id,
        status: "created",
      })
      .select("id")
      .single();

    if (payError) return errorResponse(payError.message, 500);

    return jsonResponse({
      order_id: order.id,
      amount: order.amount,
      currency: "INR",
      key: razorpayKeyId,
      payment_id: payment.id,
    });
  }

  if (action === "verify" && req.method === "POST") {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse("Missing payment verification fields");
    }

    const { keySecret } = getRazorpayConfig();
    const valid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!valid) return errorResponse("Invalid payment signature", 403);

    const { data: payment, error: updateError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "verified",
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (updateError || !payment) {
      return errorResponse("Payment record not found", 404);
    }

    return jsonResponse({ verified: true, payment_id: payment.id });
  }

  return errorResponse("Not found", 404);
});
