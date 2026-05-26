import PipelineBoard from "@/components/admin/PipelineBoard";
import ContextualHelp from "@/components/ui/ContextualHelp";

export default function PipelinePage() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-serif font-semibold text-foreground">Pipeline</h1>
          <ContextualHelp
            id="admin-pipeline"
            title="Pipeline"
            description="The pipeline shows every lead and client at their current implementation stage. Drag cards to update stage."
            position="right"
          />
        </div>
        <p className="text-muted text-sm mt-1">
          Drag cards between columns to move clients and leads through stages.
        </p>
      </div>
      <PipelineBoard />
    </div>
  );
}
