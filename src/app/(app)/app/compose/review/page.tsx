import { AiHomeReview } from "@/components/home/ai-home-review";
import { requireActiveWorkspace } from "@/lib/workspace-context";
import { listPlots } from "@/lib/services/plots";

type Props = {
  searchParams: Promise<{ draft?: string }>;
};

export default async function AiComposeReviewPage({ searchParams }: Props) {
  const ctx = await requireActiveWorkspace();
  const plots = await listPlots(ctx.workspaceId);
  const params = await searchParams;

  return (
    <AiHomeReview
      workspaceId={ctx.workspaceId}
      draftId={params.draft}
      plots={plots.map((plot) => ({ id: plot.id, name: plot.name }))}
    />
  );
}
