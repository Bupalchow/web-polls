import { Poll } from '../types';
import { BarChart } from 'lucide-react';

interface PollListProps {
  polls: Poll[];
  onPollSelect: (poll: Poll) => void;
}

export default function PollList({ polls, onPollSelect }: PollListProps) {
  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <div
          key={poll.id}
          onClick={() => onPollSelect(poll)}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{poll.question}</h3>
            <div className="flex items-center gap-2 text-gray-500">
              <BarChart size={20} />
              <span>{poll.totalVotes} votes</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {poll.options.slice(0, 2).map((option) => (
              <div key={option.id} className="text-gray-600">
                • {option.text}
              </div>
            ))}
            {poll.options.length > 2 && (
              <div className="text-gray-400">
                +{poll.options.length - 2} more options
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}