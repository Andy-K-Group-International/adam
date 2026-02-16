"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatRelativeTime } from "@/lib/utils";
import { Send } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface Comment {
  _id: string;
  content: string;
  authorId: string;
  createdAt: number;
}

interface CommentThreadProps {
  contractId: Id<"contracts">;
  sectionId?: string;
  comments: Comment[];
}

export default function CommentThread({
  contractId,
  sectionId,
  comments,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");
  const addComment = useMutation(api.contractComments.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment({
      contractId,
      sectionId,
      content: newComment.trim(),
    });
    setNewComment("");
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
            key={comment._id}
            className="bg-grid-300/50 rounded-lg p-3"
          >
            <p className="text-sm text-foreground">{comment.content}</p>
            <p className="text-xs text-muted-2 mt-1">
              {formatRelativeTime(comment.createdAt)}
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
          className="btn-primary-gradient p-2 rounded-lg disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
