import { useState, useEffect } from 'react';
import Header from './Header';
import HomePage from './HomePage';
import CreatePoll from './CreatePoll';
import PollVoting from './PollVoting';
import LiveResults from './LiveResults';
import BrowsePolls from './BrowsePolls';
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

const PollerApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votedPollIds, setVotedPollIds] = useState<Set<string>>(new Set());

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPolls = localStorage.getItem('poller-polls');
    const savedVotedIds = localStorage.getItem('poller-voted-ids');

    if (savedPolls) {
      try {
        const parsedPolls = JSON.parse(savedPolls);
        // Convert date strings back to Date objects
        const pollsWithDates = parsedPolls.map((poll: any) => ({
          ...poll,
          createdAt: new Date(poll.createdAt),
          deadline: poll.deadline ? new Date(poll.deadline) : undefined,
        }));
        setPolls(pollsWithDates);
      } catch (error) {
        console.error('Failed to load polls:', error);
      }
    }

    if (savedVotedIds) {
      try {
        const parsedVotedIds = JSON.parse(savedVotedIds);
        setVotedPollIds(new Set(parsedVotedIds));
      } catch (error) {
        console.error('Failed to load voted IDs:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('poller-polls', JSON.stringify(polls));
  }, [polls]);

  useEffect(() => {
    localStorage.setItem('poller-voted-ids', JSON.stringify(Array.from(votedPollIds)));
  }, [votedPollIds]);

  const handleNavigate = (view: string, pollId?: string) => {
    setCurrentView(view);
    setSelectedPollId(pollId || null);
  };

  const handlePollCreated = (poll: Poll) => {
    setPolls(prev => [poll, ...prev]);
  };

  const handleVote = (pollId: string, optionIndexes: number[]) => {
    // Check if user has already voted
    if (votedPollIds.has(pollId)) {
      toast({
        title: "Already Voted",
        description: "You have already voted in this poll.",
        variant: "destructive",
      });
      return;
    }

    // Update poll votes
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const newVotes = [...poll.votes];
        optionIndexes.forEach(index => {
          if (index >= 0 && index < newVotes.length) {
            newVotes[index]++;
          }
        });
        return { ...poll, votes: newVotes };
      }
      return poll;
    }));

    // Mark as voted
    setVotedPollIds(prev => new Set([...prev, pollId]));

    // Show success message
    toast({
      title: "Vote Recorded!",
      description: "Thank you for participating in this poll.",
    });
  };

  const selectedPoll = selectedPollId ? polls.find(poll => poll.id === selectedPollId) : null;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      
      case 'create':
        return (
          <CreatePoll 
            onPollCreated={handlePollCreated} 
            onNavigate={handleNavigate}
          />
        );
      
      case 'browse':
        return (
          <BrowsePolls 
            polls={polls} 
            votedPollIds={votedPollIds}
            onNavigate={handleNavigate}
          />
        );
      
      case 'poll':
        if (!selectedPoll) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-poller-black mb-4">Poll Not Found</h2>
                <p className="text-gray-600 mb-6">The poll you're looking for doesn't exist.</p>
                <button 
                  onClick={() => handleNavigate('browse')}
                  className="btn-hero"
                >
                  Browse Polls
                </button>
              </div>
            </div>
          );
        }
        return (
          <PollVoting 
            poll={selectedPoll}
            hasVoted={votedPollIds.has(selectedPoll.id)}
            onVote={handleVote}
            onNavigate={handleNavigate}
          />
        );
      
      case 'results':
        if (!selectedPoll) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-poller-black mb-4">Poll Not Found</h2>
                <p className="text-gray-600 mb-6">The poll results you're looking for don't exist.</p>
                <button 
                  onClick={() => handleNavigate('browse')}
                  className="btn-hero"
                >
                  Browse Polls
                </button>
              </div>
            </div>
          );
        }
        return (
          <LiveResults 
            poll={selectedPoll}
            onNavigate={handleNavigate}
          />
        );
      
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate} 
      />
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default PollerApp;