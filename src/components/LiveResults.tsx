import { useState } from 'react';
import { BarChart3, PieChart, ArrowLeft, TrendingUp, Users, Brain } from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface LiveResultsProps {
  poll: Poll;
  onNavigate: (view: string, pollId?: string) => void;
}

const LiveResults = ({ poll, onNavigate }: LiveResultsProps) => {
  const [viewType, setViewType] = useState<'bar' | 'pie'>('bar');
  
  const totalVotes = poll.votes.reduce((sum, votes) => sum + votes, 0);
  const maxVotes = Math.max(...poll.votes);
  
  // Chart colors
  const chartColors = [
    '#60A5FA', '#34D399', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
  ];

  // Prepare data for charts
  const chartData = poll.options.map((option, index) => ({
    name: option,
    votes: poll.votes[index],
    percentage: totalVotes > 0 ? ((poll.votes[index] / totalVotes) * 100) : 0,
    color: chartColors[index % chartColors.length]
  })).sort((a, b) => b.votes - a.votes); // Sort by vote count descending

  // Generate AI insights
  const generateInsights = () => {
    if (totalVotes === 0) return ["No votes have been cast yet."];
    
    const insights = [];
    const winner = chartData[0];
    const runnerUp = chartData[1];
    
    // Winner insight
    if (winner.percentage > 50) {
      insights.push(`${winner.name} is the clear winner with ${winner.percentage.toFixed(1)}% of votes`);
    } else if (winner.percentage > 30) {
      insights.push(`${winner.name} leads with ${winner.percentage.toFixed(1)}% of votes`);
    } else {
      insights.push("The results are very close with no clear winner");
    }
    
    // Competition insight
    if (runnerUp && Math.abs(winner.percentage - runnerUp.percentage) < 5) {
      insights.push(`It's a tight race between "${winner.name}" and "${runnerUp.name}"`);
    }
    
    // Participation insight
    if (totalVotes > 100) {
      insights.push(`High engagement with ${totalVotes.toLocaleString()} total votes`);
    } else if (totalVotes > 10) {
      insights.push(`Growing participation with ${totalVotes} votes so far`);
    }
    
    // Distribution insight
    const topTwoPercentage = chartData.slice(0, 2).reduce((sum, item) => sum + item.percentage, 0);
    if (topTwoPercentage > 80) {
      insights.push("Most voters prefer the top two options");
    }
    
    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-muted/10 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('poll', poll.id)}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Poll
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              Live Results
            </div>
            
            <div className="flex bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewType('bar')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'bar' 
                    ? 'bg-background text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Bar Chart
              </button>
              <button
                onClick={() => setViewType('pie')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'pie' 
                    ? 'bg-background text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                <PieChart className="w-4 h-4" />
                Pie Chart
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="result-card">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-poller-black mb-4">
                  Real-time Polling Results
                </h1>
                <h2 className="text-xl text-gray-700 mb-2">{poll.title}</h2>
                {poll.description && (
                  <p className="text-gray-600">{poll.description}</p>
                )}
              </div>

              {/* Bar Chart Results */}
              {viewType === 'bar' && (
                <div className="space-y-4 mb-8">
                  {chartData.map((item, index) => (
                    <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-poller-black">{item.name}</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {item.percentage.toFixed(1)}% ({item.votes.toLocaleString()} votes)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                            backgroundImage: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recharts Visualization */}
              {totalVotes > 0 && (
                <div className="h-80 mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    {viewType === 'pie' ? (
                      <RechartsPieChart>
                        <RechartsPieChart data={chartData}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </RechartsPieChart>
                        <Tooltip 
                          formatter={(value: any, name: any) => [`${value} votes`, name]}
                          labelFormatter={(label: any) => `${label}: ${((chartData.find(d => d.name === label)?.percentage || 0)).toFixed(1)}%`}
                        />
                      </RechartsPieChart>
                    ) : (
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [`${value} votes`, 'Votes']}
                          labelFormatter={(label: any) => `${label}`}
                        />
                        <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}

              {/* Total Votes */}
              <div className="text-center py-6 bg-primary-muted/30 rounded-xl">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-poller-black">
                  <Users className="w-6 h-6" />
                  {totalVotes.toLocaleString()} Total Votes
                </div>
              </div>
            </div>
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="result-card">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-poller-black">AI Insights</h3>
              </div>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="result-card">
              <h3 className="text-lg font-semibold text-poller-black mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Leading Option:</span>
                  <span className="font-medium text-poller-black">
                    {chartData[0]?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lead Margin:</span>
                  <span className="font-medium text-primary">
                    {chartData[0]?.percentage.toFixed(1) || '0'}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Options:</span>
                  <span className="font-medium text-poller-black">{poll.options.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Poll Type:</span>
                  <span className="font-medium text-poller-black">
                    {poll.multipleChoice ? 'Multiple Choice' : 'Single Choice'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="result-card">
              <div className="space-y-3">
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="w-full btn-secondary text-sm"
                >
                  Share Poll
                </button>
                <button
                  onClick={() => {
                    const data = {
                      poll: poll.title,
                      results: chartData,
                      totalVotes,
                      timestamp: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `poll-results-${poll.id}.json`;
                    a.click();
                  }}
                  className="w-full btn-ghost text-sm"
                >
                  Export Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveResults;