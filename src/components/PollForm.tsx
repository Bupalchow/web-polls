import { useState } from 'react';
import { PlusCircle, MinusCircle, Wand2 } from 'lucide-react';
import { generatePollSuggestions } from '../config/mistral';
import toast from 'react-hot-toast';

interface PollFormProps {
  onSubmit: (question: string, options: string[], isPublic: boolean) => void;
}

export default function PollForm({ onSubmit }: PollFormProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && options.every(opt => opt.trim())) {
      onSubmit(question, options.map(opt => opt.trim()), isPublic);
      setQuestion('');
      setOptions(['', '']);
    }
  };

  const generateOptions = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question first');
      return;
    }

    setIsGenerating(true);
    try {
      const suggestions = await generatePollSuggestions(question);
      setOptions(suggestions);
      toast.success('Options generated successfully!');
    } catch (error) {
      toast.error('Failed to generate options');
      console.error('Error generating options:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What would you like to ask?"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Options</label>
          <button
            type="button"
            onClick={generateOptions}
            disabled={isGenerating}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Wand2 size={16} />
            <span>{isGenerating ? 'Generating...' : 'Generate Options'}</span>
          </button>
        </div>
        
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Option ${index + 1}`}
              required
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <MinusCircle size={24} />
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <PlusCircle size={24} />
          <span>Add Option</span>
        </button>
      </div>

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>Make poll public</span>
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
      >
        Create Poll
      </button>
    </form>
  );
}