import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { Poll } from '../types';
import PollList from '../components/PollList';
import { useNavigate } from 'react-router-dom';

export default function UserPolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const pollsRef = collection(db, 'polls');
    const q = query(
      pollsRef,
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pollsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Poll[];
      setPolls(pollsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Polls</h1>
      {polls.length === 0 ? (
        <p className="text-center text-gray-500">You haven't created any polls yet.</p>
      ) : (
        <PollList polls={polls} onPollSelect={(poll) => navigate(`/polls/${poll.id}`)} />
      )}
    </div>
  );
}
