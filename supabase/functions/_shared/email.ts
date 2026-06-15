export async function sendResumeEmail(
  to: string,
  fullName: string,
  pdfBytes: Uint8Array,
  downloadUrl: string
): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return;
  }

  const base64Pdf = btoa(String.fromCharCode(...pdfBytes));

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Rizz My Resume <noreply@sarwagyna.com>",
      to: [to],
      subject: "Your Rizz My Resume resume is ready",
      html: `
        <p>Hi ${fullName},</p>
        <p>Your ATS-optimised resume is ready to download.</p>
        <p><a href="${downloadUrl}">Download your resume</a> (link valid for 24 hours)</p>
        <p>We've also attached the PDF to this email as a backup.</p>
        <p>— Team Rizz My Resume</p>
      `,
      attachments: [
        {
          filename: "resume.pdf",
          content: base64Pdf,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Resend email failed:", err);
  }
}
