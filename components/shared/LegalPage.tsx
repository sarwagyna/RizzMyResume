import { PageContainer } from "@/components/shared/PageContainer";

interface LegalPageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <PageContainer size="sm" className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
          Legal
        </p>
        <h1 className="display-md mb-2">{title}</h1>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      <div className="prose-policy space-y-4 text-sm leading-relaxed text-body">
        {children}
      </div>
    </PageContainer>
  );
}
