"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createComment } from "@/lib/supabase/queries/contractComments";
import { formatRelativeTime } from "@/lib/utils";
import { Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
}

interface CommentThreadProps {
  contractId: string;
  sectionId?: string;
  comments: Comment[];
  onCommentAdded?: () => void;
}

export default function CommentThread({
  contractId,
  sectionId,
  comments,
  onCommentAdded,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const supabase = createClient();
    await createComment(supabase, {
      contractId,
      sectionId,
      content: newComment.trim(),
    });
    setNewComment("");
    onCommentAdded?.();
  };

  return (
    <div>
      <div className="space-y-3 mb-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted-2 text-center py-4">
            No comments yet
          </p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-grid-300/50 rounded-lg p-3"
          >
            <p className="text-sm text-foreground">{comment.content}</p>
            <p className="text-xs text-muted-2 mt-1">
              {formatRelativeTime(new Date(comment.created_at).getTime())}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 text-sm border border-grid-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="btn-primary-gradient p-2 rounded-lg disabled:opacity-50 text-foreground"
        >
          <Send className="h-4 w-4 relative z-10" />
        </button>
      </form>
    </div>
  );
}
