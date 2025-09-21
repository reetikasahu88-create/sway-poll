import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Users, Tag, CheckCircle2 } from 'lucide-react';

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

interface BrowsePollsProps {
  polls: Poll[];
  votedPollIds: Set<string>;
  onNavigate: (view: string, pollId?: string) => void;
}

const BrowsePolls = ({ polls, votedPollIds, onNavigate }: BrowsePollsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['All', ...Array.from(new Set(polls.map(poll => poll.category)))];

  const filteredPolls = useMemo(() => {
    let filtered = polls.filter(poll => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poll.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poll.options.some(option => option.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'All' || poll.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-votes':
          const aVotes = a.votes.reduce((sum, votes) => sum + votes, 0);
          const bVotes = b.votes.reduce((sum, votes) => sum + votes, 0);
          return bVotes - aVotes;
        case 'least-votes':
          const aVotesLeast = a.votes.reduce((sum, votes) => sum + votes, 0);
          const bVotesLeast = b.votes.reduce((sum, votes) => sum + votes, 0);
          return aVotesLeast - bVotesLeast;
        default:
          return 0;
      }
    });

    return filtered;
  }, [polls, searchQuery, selectedCategory, sortBy]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getTotalVotes = (poll: Poll) => {
    return poll.votes.reduce((sum, votes) => sum + votes, 0);
  };

  const isExpired = (poll: Poll) => {
    return poll.deadline && new Date() > poll.deadline;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-muted/10 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-poller-black mb-4">
            Browse Polls
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and participate in polls from the community
          </p>
        </div>

        {/* Filters */}
        <div className="result-card mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input pl-10 appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-votes">Most Votes</option>
              <option value="least-votes">Least Votes</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredPolls.length} poll{filteredPolls.length !== 1 ? 's' : ''} found
          </p>
          
          <button
            onClick={() => onNavigate('create')}
            className="btn-hero text-sm"
          >
            Create New Poll
          </button>
        </div>

        {/* Polls Grid */}
        {filteredPolls.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No polls found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'All' 
                ? "Try adjusting your search or filters" 
                : "Be the first to create a poll!"
              }
            </p>
            <button
              onClick={() => onNavigate('create')}
              className="btn-hero"
            >
              Create First Poll
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll, index) => {
              const totalVotes = getTotalVotes(poll);
              const hasVoted = votedPollIds.has(poll.id);
              const expired = isExpired(poll);
              
              return (
                <div
                  key={poll.id}
                  className="poll-card animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => onNavigate('poll', poll.id)}
                >
                  {/* Poll Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-poller-black mb-2 line-clamp-2">
                        {poll.title}
                      </h3>
                      {poll.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {poll.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Status Badges */}
                    <div className="flex flex-col gap-2 ml-3">
                      {hasVoted && (
                        <div className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Voted
                        </div>
                      )}
                      {expired && (
                        <div className="bg-destructive/10 text-destructive px-2 py-1 rounded-full text-xs font-medium">
                          Expired
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Poll Options Preview */}
                  <div className="space-y-2 mb-4">
                    {poll.options.slice(0, 3).map((option, optionIndex) => (
                      <div key={optionIndex} className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700">
                        {option}
                      </div>
                    ))}
                    {poll.options.length > 3 && (
                      <div className="text-xs text-gray-500 pl-3">
                        +{poll.options.length - 3} more option{poll.options.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Poll Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{poll.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{totalVotes}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(poll.createdAt)}</span>
                    </div>
                  </div>

                  {/* Poll Type Indicator */}
                  {poll.multipleChoice && (
                    <div className="mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Multiple Choice
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePolls;