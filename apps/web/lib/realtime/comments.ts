import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Comment {
  id: string;
  projectId: string;
  entityType: string;
  entityId: string;
  parentId?: string;
  body: string;
  authorId: string;
  isEdited: boolean;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  comment: Comment;
  old?: Comment;
}

export class RealtimeCommentsManager {
  private channel: RealtimeChannel | null = null;
  private projectId: string;
  private listeners: Array<(event: CommentEvent) => void> = [];

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  /**
   * Subscribe to comment changes
   */
  async subscribe(): Promise<void> {
    if (this.channel) {
      await this.unsubscribe();
    }

    this.channel = supabase.channel(`comments:project_${this.projectId}`);

    // Listen for comment changes
    this.channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${this.projectId}`,
        },
        (payload) => {
          this.handleCommentEvent({
            type: 'INSERT',
            comment: this.transformComment(payload.new),
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${this.projectId}`,
        },
        (payload) => {
          this.handleCommentEvent({
            type: 'UPDATE',
            comment: this.transformComment(payload.new),
            old: payload.old ? this.transformComment(payload.old) : undefined,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${this.projectId}`,
        },
        (payload) => {
          this.handleCommentEvent({
            type: 'DELETE',
            comment: this.transformComment(payload.old),
          });
        }
      );

    await this.channel.subscribe();
  }

  /**
   * Unsubscribe from comment changes
   */
  async unsubscribe(): Promise<void> {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
  }

  /**
   * Add event listener
   */
  addListener(listener: (event: CommentEvent) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: (event: CommentEvent) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Handle comment event
   */
  private handleCommentEvent(event: CommentEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in comment event listener:', error);
      }
    });
  }

  /**
   * Transform database row to Comment interface
   */
  private transformComment(row: any): Comment {
    return {
      id: row.id,
      projectId: row.project_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      parentId: row.parent_id,
      body: row.body,
      authorId: row.author_id,
      isEdited: row.is_edited,
      isResolved: row.is_resolved,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

/**
 * React hook for realtime comments
 */
export function useRealtimeComments(
  projectId: string,
  entityType?: string,
  entityId?: string
) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [manager] = React.useState(() => new RealtimeCommentsManager(projectId));

  React.useEffect(() => {
    const handleCommentEvent = (event: CommentEvent) => {
      setComments(prevComments => {
        switch (event.type) {
          case 'INSERT':
            // Only add if it matches our entity filter
            if (
              !entityType ||
              !entityId ||
              (event.comment.entityType === entityType && event.comment.entityId === entityId)
            ) {
              // Check if comment already exists (avoid duplicates)
              if (!prevComments.find(c => c.id === event.comment.id)) {
                return [...prevComments, event.comment].sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
              }
            }
            return prevComments;

          case 'UPDATE':
            return prevComments.map(comment =>
              comment.id === event.comment.id ? event.comment : comment
            );

          case 'DELETE':
            return prevComments.filter(comment => comment.id !== event.comment.id);

          default:
            return prevComments;
        }
      });
    };

    manager.addListener(handleCommentEvent);
    manager.subscribe();

    return () => {
      manager.removeListener(handleCommentEvent);
      manager.unsubscribe();
    };
  }, [manager, entityType, entityId]);

  const addOptimisticComment = React.useCallback((comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const optimisticComment: Comment = {
      ...comment,
      id: `optimistic-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, optimisticComment]);

    return optimisticComment.id;
  }, []);

  const removeOptimisticComment = React.useCallback((optimisticId: string) => {
    setComments(prev => prev.filter(c => c.id !== optimisticId));
  }, []);

  const updateOptimisticComment = React.useCallback((optimisticId: string, realComment: Comment) => {
    setComments(prev =>
      prev.map(c => (c.id === optimisticId ? realComment : c))
    );
  }, []);

  return {
    comments,
    addOptimisticComment,
    removeOptimisticComment,
    updateOptimisticComment,
  };
}

// Import React for the hook
import React from 'react';
