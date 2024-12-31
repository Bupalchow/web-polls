import React, { useState, useEffect, useCallback } from 'react';
import { ref, set, onValue, update, get, DatabaseReference } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { ThumbsUp, ThumbsDown, MessageCircle, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  text: string;
  createdAt: number;
  uid: string;
  displayName: string;
  photoURL: string | null;
  likes: { [key: string]: boolean };
  dislikes: { [key: string]: boolean };
  parentId: string | null;
  replyCount: number;
}

interface ChatRoomProps {
  pollId: string;
}

export default function ChatRoom({ pollId }: ChatRoomProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Changed path to match the exact structure
    const commentsRef = ref(realtimeDb, 'comments/' + pollId);
    
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        console.log('Raw data:', data); // Debug log
        
        if (data) {
          const commentList = Object.entries(data).map(([commentId, commentData]: [string, any]) => ({
            id: commentId,
            text: commentData.text || '',
            createdAt: commentData.createdAt || Date.now(),
            uid: commentData.uid || '',
            displayName: commentData.displayName || 'Anonymous',
            photoURL: commentData.photoURL || null,
            likes: commentData.likes || {},
            dislikes: commentData.dislikes || {},
            parentId: commentData.parentId || null,
            replyCount: commentData.replyCount || 0
          }));
          
          // Sort by latest first
          commentList.sort((a, b) => b.createdAt - a.createdAt);
          
          setComments(commentList);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error('Error processing comments:', error);
        setComments([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [pollId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    try {
      const timestamp = Date.now();
      const commentId = `comment_${timestamp}`;
      
      // Structure the comment data exactly as specified
      const commentData = {
        text: comment.trim(),
        createdAt: timestamp,
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL,
        likes: {},
        dislikes: {},
        parentId: replyTo || null,
        replyCount: 0
      };

      // Use the exact path structure
      const commentRef = ref(realtimeDb, `comments/${pollId}/${commentId}`);
      await set(commentRef, commentData);

      // Update reply count if this is a reply
      if (replyTo) {
        const parentRef = ref(realtimeDb, `comments/${pollId}/${replyTo}`);
        const snapshot = await get(parentRef);
        const parentData = snapshot.val();
        if (parentData) {
          await update(parentRef, {
            replyCount: (parentData.replyCount || 0) + 1
          });
        }
      }

      setComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const handleVote = async (commentId: string, voteType: 'likes' | 'dislikes') => {
    if (!user) return;
    
    try {
      const commentRef = ref(realtimeDb, `comments/${pollId}/${commentId}`);
      const snapshot = await get(commentRef);
      const commentData = snapshot.val();
      
      if (!commentData) return;

      const updates: { [key: string]: any } = {};
      const votes = commentData[voteType] || {};
      
      if (votes[user.uid]) {
        // Remove vote
        updates[`${voteType}/${user.uid}`] = null;
      } else {
        // Add vote and remove opposite vote
        updates[`${voteType}/${user.uid}`] = true;
        updates[`${voteType === 'likes' ? 'dislikes' : 'likes'}/${user.uid}`] = null;
      }

      await update(commentRef, updates);
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  const CommentItem = useCallback(({ comment }: { comment: Comment }) => (
    <div 
      id={comment.id}
      className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 mb-4 animate-fade-in"
    >
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium dark:text-white">{comment.displayName}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(comment.createdAt)} ago
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote(comment.id, 'likes')}
              className={`p-1 rounded ${
                comment.likes[user?.uid || ''] ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              <ThumbsUp size={16} />
              <span className="ml-1">{Object.keys(comment.likes || {}).length}</span>
            </button>
            <button
              onClick={() => handleVote(comment.id, 'dislikes')}
              className={`p-1 rounded ${
                comment.dislikes[user?.uid || ''] ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <ThumbsDown size={16} />
              <span className="ml-1">{Object.keys(comment.dislikes || {}).length}</span>
            </button>
          </div>
        </div>
        <p className="text-gray-800 dark:text-gray-200">{comment.text}</p>
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={() => setReplyTo(comment.id)}
            className="text-sm text-gray-500 hover:text-blue-500 flex items-center gap-1"
          >
            <Reply size={14} /> Reply
          </button>
          {comment.replyCount > 0 && (
            <button
              onClick={() => setExpandedReplies(prev => {
                const next = new Set(prev);
                if (next.has(comment.id)) {
                  next.delete(comment.id);
                } else {
                  next.add(comment.id);
                }
                return next;
              })}
              className="text-sm text-gray-500 hover:text-blue-500"
            >
              {expandedReplies.has(comment.id) ? 'Hide' : 'Show'} {comment.replyCount} replies
            </button>
          )}
        </div>
      </div>
      {expandedReplies.has(comment.id) && (
        <div className="ml-4 mt-2">
          {comments
            .filter(reply => reply.parentId === comment.id)
            .map(reply => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
        </div>
      )}
    </div>
  ), [user, handleVote, setReplyTo, expandedReplies, setExpandedReplies]);

  return (
    <div className="mt-6 pt-6 border-t dark:border-gray-700">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Poll Discussion
          </h3>
        </div>

        <div className="p-4">
          {user ? (
            <form onSubmit={handleSubmit} className="mb-6">
              {replyTo && (
                <div className="mb-2 text-sm text-gray-500 flex items-center justify-between">
                  <span>Replying to comment</span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-blue-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 mb-6">
              Please sign in to join the discussion
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Be the first to share your thoughts about this poll!
            </p>
          ) : (
            <div className="space-y-4">
              {comments
                .filter(comment => !comment.parentId)
                .map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}