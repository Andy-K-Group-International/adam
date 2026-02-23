"use client";

interface InvestmentTableEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function InvestmentTableEditor({
  content,
  onChange,
}: InvestmentTableEditorProps) {
  return (
    <div>
      <label className="text-xs font-medium text-muted mb-1.5 block">
        Investment / Pricing Content
      </label>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        className="w-full text-sm border border-grid-500 rounded-lg px-3 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30 font-mono"
        placeholder="Enter investment and pricing details..."
      />
    </div>
  );
}
