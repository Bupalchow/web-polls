import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import PollVoting from '../components/PollVoting';
import toast from 'react-hot-toast';
import { isValidPollId } from '../utils/helpers';

interface PollData {
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
    voters: string[];
  }>;
  visibility: 'private' | 'public';
  shareId: string | null;
}

export default function PrivatePoll() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoll = async () => {
      if (!id || !isValidPollId(id)) {
        toast.error('Invalid poll ID');
        navigate('/');
        return;
      }

      try {
        const pollDoc = await getDoc(doc(db, 'polls', id));
        if (!pollDoc.exists()) {
          toast.error('Poll not found');
          navigate('/');
          return;
        }

        const pollData = pollDoc.data() as PollData;
        if (pollData.visibility === 'public') {
          navigate(`/polls/${id}`);
          return;
        }

        setPoll(pollData);
      } catch (error) {
        toast.error('Error loading poll');
        console.error('Error fetching poll:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id, navigate]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/private/${id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('Poll link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{poll.question}</h1>
        <button
          onClick={handleShare}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Share Poll
        </button>
      </div>
      <PollVoting 
        poll={{
          ...poll,
          id: id!
        }} 
        pollId={id!} 
      />
    </div>
  );
}
