import { useState } from 'react';
import { Clock, Users, Tag, CheckCircle } from 'lucide-react';
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

interface PollVotingProps {
  poll: Poll;
  hasVoted: boolean;
  onVote: (pollId: string, optionIndexes: number[]) => void;
  onNavigate: (view: string, pollId?: string) => void;
}

const PollVoting = ({ poll, hasVoted, onVote, onNavigate }: PollVotingProps) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isExpired = poll.deadline && new Date() > poll.deadline;
  const totalVotes = poll.votes.reduce((sum, votes) => sum + votes, 0);

  const handleOptionClick = (index: number) => {
    if (hasVoted || isExpired) return;

    if (poll.multipleChoice) {
      setSelectedOptions(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedOptions([index]);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one option.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      onVote(poll.id, selectedOptions);
      
      toast({
        title: "Vote Recorded!",
        description: "Thank you for participating in this poll.",
      });

      // Navigate to results after voting
      setTimeout(() => {
        onNavigate('results', poll.id);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-muted/10 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('browse')}
          className="btn-ghost mb-6"
        >
          ← Back to Browse
        </button>

        <div className="result-card animate-fade-in-up">
          {/* Poll Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-poller-black mb-4">
              {poll.title}
            </h1>
            {poll.description && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {poll.description}
              </p>
            )}
          </div>

          {/* Poll Meta */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{poll.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{totalVotes} votes</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Created {formatDate(poll.createdAt)}</span>
            </div>
            {poll.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className={isExpired ? 'text-destructive' : 'text-warning'}>
                  {isExpired ? 'Expired' : 'Ends'} {formatDate(poll.deadline)}
                </span>
              </div>
            )}
          </div>

          {/* Voting Status */}
          {(hasVoted || isExpired) && (
            <div className="mb-8">
              {hasVoted && (
                <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-success font-medium">You have already voted in this poll</p>
                </div>
              )}
              {isExpired && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-destructive mx-auto mb-2" />
                  <p className="text-destructive font-medium">This poll has expired</p>
                </div>
              )}
            </div>
          )}

          {/* Poll Options */}
          <div className="space-y-4 mb-8">
            {poll.options.map((option, index) => {
              const isSelected = selectedOptions.includes(index);
              const canClick = !hasVoted && !isExpired;
              
              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  disabled={!canClick}
                  className={`
                    w-full p-6 rounded-xl border-2 text-left transition-all duration-200 transform
                    ${canClick ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-not-allowed opacity-60'}
                    ${isSelected 
                      ? 'border-primary bg-primary-muted shadow-lg' 
                      : 'border-border bg-background hover:border-primary/50 hover:bg-primary-muted/30'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-poller-black flex-1">
                      {option}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-6 h-6 text-primary ml-4" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Voting Instructions */}
          {!hasVoted && !isExpired && (
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-4">
                {poll.multipleChoice 
                  ? "Select one or more options and click vote" 
                  : "Select one option and click vote"
                }
              </p>
              {selectedOptions.length > 0 && (
                <p className="text-primary font-medium">
                  {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!hasVoted && !isExpired ? (
              <>
                <button
                  onClick={handleVote}
                  disabled={selectedOptions.length === 0 || isSubmitting}
                  className="btn-hero disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                </button>
                
                {!poll.hideResults && totalVotes > 0 && (
                  <button
                    onClick={() => onNavigate('results', poll.id)}
                    className="btn-secondary"
                  >
                    View Current Results
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => onNavigate('results', poll.id)}
                className="btn-hero"
              >
                View Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollVoting;