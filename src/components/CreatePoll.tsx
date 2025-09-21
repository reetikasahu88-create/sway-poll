import { useState } from 'react';
import { Plus, Trash2, Settings, Calendar, Tag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  votes: number[];
  multipleChoice: boolean;
  hideResults: boolean;
  category: string;
  deadline?: Date;
  createdAt: Date;
}

interface CreatePollProps {
  onPollCreated: (poll: Poll) => void;
  onNavigate: (view: string, pollId?: string) => void;
}

const CreatePoll = ({ onPollCreated, onNavigate }: CreatePollProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [hideResults, setHideResults] = useState(false);
  const [category, setCategory] = useState('General');
  const [deadline, setDeadline] = useState('');

  const categories = [
    'General', 'Technology', 'Sports', 'Politics', 'Entertainment', 
    'Education', 'Business', 'Science', 'Health', 'Travel'
  ];

  const addOption = () => {
    if (options.length < 30) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createPoll = () => {
    // Validation
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a poll title.",
        variant: "destructive",
      });
      return;
    }

    if (title.length > 200) {
      toast({
        title: "Title Too Long",
        description: "Poll title must be under 200 characters.",
        variant: "destructive",
      });
      return;
    }

    if (description.length > 500) {
      toast({
        title: "Description Too Long",
        description: "Poll description must be under 500 characters.",
        variant: "destructive",
      });
      return;
    }

    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      toast({
        title: "Need More Options",
        description: "Please provide at least 2 poll options.",
        variant: "destructive",
      });
      return;
    }

    const pollDeadline = deadline ? new Date(deadline) : undefined;
    if (pollDeadline && pollDeadline <= new Date()) {
      toast({
        title: "Invalid Deadline",
        description: "Deadline must be in the future.",
        variant: "destructive",
      });
      return;
    }

    const newPoll: Poll = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      options: validOptions,
      votes: new Array(validOptions.length).fill(0),
      multipleChoice,
      hideResults,
      category,
      deadline: pollDeadline,
      createdAt: new Date(),
    };

    onPollCreated(newPoll);
    
    toast({
      title: "Poll Created!",
      description: "Your poll has been created successfully.",
    });

    // Navigate to the poll
    onNavigate('poll', newPoll.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-muted/10 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="result-card animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-poller-black mb-4">Create New Poll</h1>
            <p className="text-gray-600">Design your poll and start gathering insights</p>
          </div>

          {/* Poll Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-poller-black mb-2">
              Poll Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your poll question?"
              className="form-input"
              maxLength={200}
            />
            <div className="text-sm text-gray-500 mt-1">
              {title.length}/200 characters
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-poller-black mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context to your poll..."
              className="form-textarea h-24"
              maxLength={500}
            />
            <div className="text-sm text-gray-500 mt-1">
              {description.length}/500 characters
            </div>
          </div>

          {/* Poll Options */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-poller-black mb-4">
              Poll Options *
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="form-input flex-1"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                    className="p-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={addOption}
              disabled={options.length >= 30}
              className="mt-3 flex items-center gap-2 text-primary hover:bg-primary-muted px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
            <div className="text-sm text-gray-500 mt-1">
              {options.length}/30 options
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="mb-8">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-primary hover:bg-primary-muted px-4 py-2 rounded-lg transition-colors mb-4"
            >
              <Settings className="w-4 h-4" />
              Advanced Settings
            </button>
            
            {showAdvanced && (
              <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-poller-black mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Multiple Choice */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="multipleChoice"
                    checked={multipleChoice}
                    onChange={(e) => setMultipleChoice(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="multipleChoice" className="text-sm font-medium text-poller-black">
                    Allow multiple selections
                  </label>
                </div>

                {/* Hide Results */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hideResults"
                    checked={hideResults}
                    onChange={(e) => setHideResults(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="hideResults" className="text-sm font-medium text-poller-black">
                    Hide results until voting ends
                  </label>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-semibold text-poller-black mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Deadline (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('home')}
              className="btn-ghost px-8 py-4"
            >
              Cancel
            </button>
            <button
              onClick={createPoll}
              className="btn-hero"
            >
              Create Poll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;