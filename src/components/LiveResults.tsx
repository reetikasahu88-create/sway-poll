// src/components/LiveResults.tsx
import { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart,
  ArrowLeft,
  TrendingUp,
  Users,
  Brain,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "@/hooks/use-toast";

const API_BASE = "http://localhost:3000";

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  status?: string;
  expiresAt?: string;
  createdAt?: string;
}

interface LiveResultsProps {
  pollId: string;
  onNavigate: (view: string, pollId?: string) => void;
}

const LiveResults = ({ pollId, onNavigate }: LiveResultsProps) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [viewType, setViewType] = useState<"bar" | "pie">("bar");
  const [loading, setLoading] = useState(true);

  const chartColors = [
    "#60A5FA",
    "#34D399",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
    "#06B6D4",
    "#84CC16",
    "#EC4899",
    "#6B7280",
  ];

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        const [resultsRes, analyticsRes] = await Promise.all([
          fetch(`${API_BASE}/polls/${pollId}/results`, {
            headers: {
              Authorization: `Bearer ${
                localStorage.getItem("authToken") || ""
              }`,
            },
          }),
          fetch(`${API_BASE}/polls/${pollId}/analytics`, {
            headers: {
              Authorization: `Bearer ${
                localStorage.getItem("authToken") || ""
              }`,
            },
          }),
        ]);

        if (!resultsRes.ok) throw new Error("Failed to fetch results");
        if (!analyticsRes.ok) throw new Error("Failed to fetch analytics");

        const resultsData = await resultsRes.json();
        const analyticsData = await analyticsRes.json();
        console.log("Results:", resultsData);
        console.log("Analytics:", analyticsData);

        // ✅ normalize poll shape
        const pollInfo = resultsData.poll || resultsData.results?.poll || {}; // fallback if poll isn't included

        setPoll({
          id: pollInfo.id || pollId,
          title: pollInfo.title || "Untitled Poll",
          description: pollInfo.description || "No description provided",
          status: pollInfo.status,
          createdAt: pollInfo.createdAt,
          expiresAt: pollInfo.expiresAt,
          options: resultsData.results?.options || resultsData.options || [],
        });

        console.log("Analytics:", analyticsData.analytics);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Could not fetch live poll results.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [pollId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading live results...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Poll not found.</p>
      </div>
    );
  }

  const totalVotes = poll.options.reduce(
    (sum, opt) => sum + (opt.voteCount || 0),
    0
  );

  const chartData = poll.options
    .map((opt, index) => ({
      id: opt.id,
      name: opt.text,
      votes: opt.voteCount,
      percentage: totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0,
      color: chartColors[index % chartColors.length],
    }))
    .sort((a, b) => b.votes - a.votes);

  const insights = (() => {
    if (totalVotes === 0) return ["No votes have been cast yet."];

    const winner = chartData[0];
    const runnerUp = chartData[1];
    const list: string[] = [];

    if (winner.percentage > 50) {
      list.push(
        `${winner.name} is the clear winner with ${winner.percentage.toFixed(
          1
        )}% of votes`
      );
    } else if (winner.percentage > 30) {
      list.push(`${winner.name} leads with ${winner.percentage.toFixed(1)}%`);
    } else {
      list.push("The results are close with no clear winner.");
    }

    if (runnerUp && Math.abs(winner.percentage - runnerUp.percentage) < 5) {
      list.push(
        `It's a tight race between "${winner.name}" and "${runnerUp.name}"`
      );
    }

    if (totalVotes > 50) {
      list.push(`Strong engagement with ${totalVotes} total votes`);
    }

    return list;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-muted/10 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate("poll", poll.id)}
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
                onClick={() => setViewType("bar")}
                className={`px-3 py-2 rounded-md text-sm ${
                  viewType === "bar"
                    ? "bg-background text-primary shadow-sm"
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-1" />
                Bar
              </button>
              <button
                onClick={() => setViewType("pie")}
                className={`px-3 py-2 rounded-md text-sm ${
                  viewType === "pie"
                    ? "bg-background text-primary shadow-sm"
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                <PieChart className="w-4 h-4 inline mr-1" />
                Pie
              </button>
            </div>
          </div>
        </div>

        {/* Results + Insights */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 result-card">
            <h2 className="text-2xl font-bold mb-4">{poll.title}</h2>
            <p className="text-gray-600 mb-6">{poll.description}</p>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {viewType === "pie" ? (
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      dataKey="votes"
                      nameKey="name"
                      outerRadius={100}
                      label={({ name, percentage }) =>
                        `${name}: ${percentage.toFixed(1)}%`
                      }
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} votes`, "Votes"]} />
                    <Legend />
                  </RechartsPieChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v) => [`${v} votes`, "Votes"]} />
                    <Bar dataKey="votes">
                      {chartData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="text-center py-4">
              <Users className="w-5 h-5 inline mr-1" />
              <span className="font-semibold">{totalVotes} total votes</span>
            </div>
          </div>

          {/* Insights */}
          <div className="result-card space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Brain className="w-5 h-5 text-primary" /> AI Insights
            </h3>
            {insights.map((txt, i) => (
              <div key={i} className="flex gap-2 text-sm text-gray-700">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
                {txt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveResults;
