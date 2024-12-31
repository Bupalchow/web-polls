
import { useState } from 'react';

import { doc, updateDoc } from 'firebase/firestore';

import { db } from '../config/firebase';

import toast from 'react-hot-toast';



interface PollVotingProps {

  poll: {

    id: string;

    question: string;

    options: Array<{

      id: string;

      text: string;

      votes: number;

      voters: string[];

    }>;

  };

  pollId: string;

}



export default function PollVoting({ poll, pollId }: PollVotingProps) {

  const [selectedOption, setSelectedOption] = useState<string | null>(null);



  const handleVote = async () => {

    if (!selectedOption) {

      toast.error('Please select an option');

      return;

    }



    try {

      const pollRef = doc(db, 'polls', pollId);

      const optionIndex = poll.options.findIndex(opt => opt.id === selectedOption);

      

      if (optionIndex === -1) return;



      const updatedOptions = [...poll.options];

      updatedOptions[optionIndex] = {

        ...updatedOptions[optionIndex],

        votes: updatedOptions[optionIndex].votes + 1,

      };



      await updateDoc(pollRef, {

        options: updatedOptions

      });



      toast.success('Vote recorded successfully!');

    } catch (error) {

      toast.error('Failed to record vote');

      console.error('Error voting:', error);

    }

  };



  return (

    <div className="space-y-4">

      {poll.options.map((option) => (

        <div

          key={option.id}

          className="flex items-center space-x-2"

        >

          <input

            type="radio"

            id={option.id}

            name="poll-option"

            value={option.id}

            checked={selectedOption === option.id}

            onChange={(e) => setSelectedOption(e.target.value)}

            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"

          />

          <label htmlFor={option.id} className="text-gray-700 dark:text-gray-300">

            {option.text} ({option.votes} votes)

          </label>

        </div>

      ))}

      <button

        onClick={handleVote}

        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"

      >

        Vote

      </button>

    </div>

  );

}
