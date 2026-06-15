import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { PageContainer } from "@/components/shared/PageContainer";

export default function NotFound() {
  return (
    <PageContainer size="sm">
      <Card className="space-y-4 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          404
        </p>
        <h1 className="display-sm">Page not found</h1>
        <p className="text-sm text-muted">
          The page you are looking for does not exist or was moved.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto">Go home</Button>
          </Link>
          <Link href="/generate">
            <Button variant="secondary" className="w-full sm:w-auto">
              Create resume
            </Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
}
