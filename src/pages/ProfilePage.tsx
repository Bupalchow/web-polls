import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import PollList from '../components/PollList';
import { Poll } from '../types';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userPolls, setUserPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const pollsRef = collection(db, 'polls');
    const q = query(
      pollsRef,
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const polls = snapshot.docs.map(doc => ({
          id: doc.id,
          question: doc.data().question,
          options: doc.data().options,
          totalVotes: doc.data().totalVotes || 0,
          authorId: doc.data().authorId,
          createdAt: doc.data().createdAt,
          // Ensure all required fields are included
          ...doc.data()
        })) as Poll[];
        setUserPolls(polls);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching polls:', error);
        setError('Error loading polls. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (!user) return <Navigate to="/" />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Polls</h1>
      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : userPolls.length === 0 ? (
        <p className="text-center text-gray-500">You haven't created any polls yet</p>
      ) : (
        <PollList 
          polls={userPolls} 
          onPollSelect={(poll) => {
            console.log('Navigating to poll:', poll.id); // Debug log
            navigate(`/polls/${poll.id}`);
          }} 
        />
      )}
    </div>
  );
}
