'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Reply,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  CheckCircle,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CommentComposer } from './CommentComposer';

export interface Comment {
  id: string;
  projectId: string;
  entityType: string;
  entityId: string;
  parentId?: string;
  body: string;
  bodyHtml?: string;
  links?: Record<string, any>;
  authorId: string;
  isEdited: boolean;
  editedAt?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  mentions?: Array<{ userId: string; mentionType: string }>;
  mentionCount?: number;
}

interface CommentThreadProps {
  projectId: string;
  entityType: string;
  entityId: string;
  comments: Comment[];
  currentUserId?: string;
  onCommentCreate?: (comment: Comment) => void;
  onCommentUpdate?: (comment: Comment) => void;
  onCommentDelete?: (commentId: string) => void;
  onPromoteToMicrostep?: (comment: Comment) => void;
  className?: string;
}

export function CommentThread({
  projectId,
  entityType,
  entityId,
  comments,
  currentUserId,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  onPromoteToMicrostep,
  className = '',
}: CommentThreadProps) {
  const [showComposer, setShowComposer] = useState(false);
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);

  // Organize comments into threads
  const rootComments = comments.filter(c => !c.parentId);
  const commentReplies = comments.filter(c => c.parentId);

  const getReplies = (commentId: string) => {
    return commentReplies.filter(c => c.parentId === commentId);
  };

  const handleCommentSubmit = async (body: string, links?: Record<string, any>) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId || 'mock-user',
        },
        body: JSON.stringify({
          project_id: projectId,
          entity_type: entityType,
          entity_id: entityId,
          parent_id: replyToComment,
          body,
          links,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      const newComment = await response.json();
      onCommentCreate?.(newComment);
      setShowComposer(false);
      setReplyToComment(null);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleCommentEdit = async (commentId: string, body: string, links?: Record<string, any>) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId || 'mock-user',
        },
        body: JSON.stringify({
          body,
          links,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const updatedComment = await response.json();
      onCommentUpdate?.(updatedComment);
      setEditingComment(null);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUserId || 'mock-user',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      onCommentDelete?.(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isAuthor = comment.authorId === currentUserId;
    const replies = getReplies(comment.id);

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mt-4'}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {/* Comment Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  {comment.authorId.replace('user_', '')}
                </span>
                {comment.isEdited && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    edited
                  </Badge>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatTimeAgo(comment.createdAt)}
              </span>
              {comment.mentionCount && comment.mentionCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {comment.mentionCount} mention{comment.mentionCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {comment.isResolved && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comment Body */}
          {editingComment === comment.id ? (
            <CommentComposer
              initialValue={comment.body}
              onSubmit={(body, links) => handleCommentEdit(comment.id, body, links)}
              onCancel={() => setEditingComment(null)}
              placeholder="Edit your comment..."
              submitLabel="Save"
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{comment.body}</p>
            </div>
          )}

          {/* Comment Links */}
          {comment.links && Object.keys(comment.links).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(comment.links).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
          )}

          {/* Comment Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyToComment(comment.id)}
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>

              {isAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingComment(comment.id)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}

              {(isAuthor || currentUserId === 'admin') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCommentDelete(comment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onPromoteToMicrostep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPromoteToMicrostep(comment)}
                >
                  Promote to Microstep
                </Button>
              )}

              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Reply Composer */}
        {replyToComment === comment.id && (
          <div className="ml-8 mt-3">
            <CommentComposer
              onSubmit={handleCommentSubmit}
              onCancel={() => setReplyToComment(null)}
              placeholder={`Reply to ${comment.authorId.replace('user_', '')}...`}
              submitLabel="Reply"
            />
          </div>
        )}

        {/* Replies */}
        {replies.map(reply => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Thread Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-900">
            Comments ({comments.length})
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComposer(!showComposer)}
        >
          Add Comment
        </Button>
      </div>

      {/* New Comment Composer */}
      {showComposer && (
        <CommentComposer
          onSubmit={handleCommentSubmit}
          onCancel={() => setShowComposer(false)}
          placeholder="Add a comment..."
          submitLabel="Comment"
        />
      )}

      {/* Comments */}
      {rootComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rootComments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
