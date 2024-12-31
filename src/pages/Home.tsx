import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PollList from '../components/PollList';
import PollForm from '../components/PollForm';
import { usePolls } from '../hooks/usePolls';
import { useAuth } from '../hooks/useAuth';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';
import { generateId } from '../utils/helpers';

export default function Home() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { polls, isLoading } = usePolls();

  const handleCreatePoll = async (question: string, options: string[], isPublic: boolean) => {
    if (!user) {
      toast.error('Please sign in to create a poll');
      return;
    }

    const shareId = isPublic ? null : generateId();
    const newPoll = {
      question,
      options: options.map((text, index) => ({
        id: `${Date.now()}-${index}`,
        text,
        votes: 0,
        voters: []
      })),
      createdAt: new Date().toISOString(),
      totalVotes: 0,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      visibility: isPublic ? 'public' : 'private',
      shareId
    };

    try {
      const docRef = await addDoc(collection(db, 'polls'), newPoll);
      setShowCreateForm(false);
      toast.success('Poll created successfully!');
      
      if (!isPublic) {
        navigate(`/private/${docRef.id}`);
      } else {
        navigate(`/polls/${docRef.id}`);
      }
    } catch (error) {
      toast.error('Failed to create poll');
      console.error('Error creating poll:', error);
    }
  };

  return (
    <div>
      {showCreateForm ? (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Poll</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
          <PollForm onSubmit={handleCreatePoll} />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Open Polls</h2>
            {user && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Create Poll
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <PollList
              polls={polls}
              onPollSelect={(poll) => navigate(`/polls/${poll.id}`)}
            />
          )}
        </div>
      )}
    </div>
  );
}
