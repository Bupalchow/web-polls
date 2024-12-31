import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Poll, PollOption } from '../types';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import ChatRoom from './ChatRoom';

interface PollViewProps {
  poll: Poll;
  onPollUpdate: (updatedPoll: Poll) => void;
}

export default function PollView({ poll, onPollUpdate }: PollViewProps) {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const hasVoted = user && poll.options.some(opt => opt.voters.includes(user.uid));

  const handleVote = async () => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }
    if (!selectedOption || isVoting || hasVoted) return;

    setIsVoting(true);
    try {
      const updatedOptions = poll.options.map(opt => ({
        ...opt,
        votes: opt.id === selectedOption ? opt.votes + 1 : opt.votes,
        voters: opt.id === selectedOption ? [...opt.voters, user.uid] : opt.voters
      }));

      const updatedPoll = {
        ...poll,
        options: updatedOptions,
        totalVotes: poll.totalVotes + 1
      };

      await updateDoc(doc(db, 'polls', poll.id), updatedPoll);
      onPollUpdate(updatedPoll);
      toast.success('Vote recorded!');
    } catch (error) {
      toast.error('Failed to record vote');
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const calculatePercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{poll.question}</h2>
      
      <div className="space-y-4">
        {poll.options.map((option: PollOption) => {
          const percentage = calculatePercentage(option.votes);
          return (
            <div
              key={option.id}
              className={`relative ${
                hasVoted ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
              } p-4 rounded-lg border ${
                selectedOption === option.id ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => !hasVoted && setSelectedOption(option.id)}
            >
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  {!hasVoted && (
                    <input
                      type="radio"
                      checked={selectedOption === option.id}
                      onChange={() => setSelectedOption(option.id)}
                      className="text-blue-500 focus:ring-blue-500"
                    />
                  )}
                  <span className="text-gray-700 dark:text-gray-200">{option.text}</span>
                </div>
                {hasVoted && (
                  <span className="text-gray-500 dark:text-gray-400">{percentage}%</span>
                )}
              </div>
              {hasVoted && (
                <div
                  className="absolute left-0 top-0 h-full bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-all"
                  style={{ width: `${percentage}%`, opacity: 0.3 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {!hasVoted && (
        <button
          onClick={handleVote}
          disabled={!selectedOption || isVoting}
          className="mt-6 w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isVoting ? 'Recording vote...' : 'Vote'}
        </button>
      )}

      <div className="mt-6 pt-6 border-t dark:border-gray-700">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Total votes: {poll.totalVotes}</span>
          <span>Created by: {poll.authorName}</span>
        </div>
      </div>

      <ChatRoom pollId={poll.id} />
    </div>
  );
}