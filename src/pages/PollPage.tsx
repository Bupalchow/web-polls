import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Poll } from '../types';
import ChatRoom from '../components/ChatRoom';

export default function PollPage() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoll = async () => {
      if (!pollId) {
        setError('Poll not found');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching poll with ID:', pollId); 
        const pollRef = doc(db, 'polls', pollId);
        const pollDoc = await getDoc(pollRef);
        
        console.log('Poll doc exists:', pollDoc.exists()); 
        
        if (!pollDoc.exists()) {
          setError('Poll not found');
          setLoading(false);
          return;
        }

        const pollData = pollDoc.data();
        console.log('Poll data:', pollData); 

        setPoll({
          id: pollDoc.id,
          question: pollData.question,
          options: pollData.options,
          totalVotes: pollData.totalVotes || 0,
          authorId: pollData.authorId,
          createdAt: pollData.createdAt,
          ...pollData
        } as Poll);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching poll:', err);
        setError('Failed to load poll');
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Poll not found'}</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{poll.question}</h1>
      <div className="space-y-4">
        {poll.options.map((option, index) => (
          <button
            key={index}
            className="w-full p-4 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {option.text}
          </button>
        ))}
      </div>
      
      <ChatRoom pollId={pollId!} />
    </div>
  );
}
