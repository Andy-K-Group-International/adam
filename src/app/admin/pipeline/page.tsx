import PipelineBoard from "@/components/admin/PipelineBoard";

export default function PipelinePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-semibold text-foreground">Pipeline</h1>
        <p className="text-muted text-sm mt-1">
          Drag cards between columns to move clients and leads through stages.
        </p>
      </div>
      <PipelineBoard />
    </div>
  );
}
