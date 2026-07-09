import { ExternalLink } from "lucide-react";

// App-wide, not per-seller: every seller shares the same folder of pitch
// decks/one-pagers, so a single value here avoids having to set/update this
// on every seller invite individually and can't drift out of sync between
// sellers. Edit this one value to update the link — nothing else in this
// file needs to change.
const EXTERNAL_MATERIALS_URL = ""; // [PLACEHOLDER — Andy to add the Google Drive folder URL]

export default function ExternalMaterials() {
  if (!EXTERNAL_MATERIALS_URL) {
    return (
      <p className="text-sm text-muted-2">
        [PLACEHOLDER — Andy to add the Google Drive folder link with pitch decks and one-pagers.]
      </p>
    );
  }

  return (
    <a
      href={EXTERNAL_MATERIALS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm font-medium text-highlight hover:text-highlight/80 transition-colors"
    >
      Open shared materials folder
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
