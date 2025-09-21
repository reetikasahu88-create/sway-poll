// src/components/PollerApp.tsx
import { useState, useEffect } from "react";
import Header from "./Header";
import HomePage from "./HomePage";
import CreatePoll from "./CreatePoll";
import PollVoting from "./PollVoting";
import LiveResults from "./LiveResults";
import BrowsePolls from "./BrowsePolls";
import { toast } from "@/hooks/use-toast";

interface PollSummary {
  id: string;
  title: string;
  status: string;
}

const API_BASE = "http://localhost:3000"; // adjust if deployed

const PollerApp = () => {
  const [currentView, setCurrentView] = useState("home");
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<PollSummary[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch lightweight poll summaries (used in Home & Browse)
  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/polls/summaries`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
      });

      if (res.status === 401) {
        toast({
          title: "Unauthorized",
          description: "Please login to view polls.",
          variant: "destructive",
        });
        setSummaries([]);
        return;
      }

      const data = await res.json();
      if (data.isSuccess) {
        setSummaries(data.polls || []);
      } else {
        console.error("Failed to fetch summaries", data);
      }
    } catch (err) {
      console.error("Error fetching summaries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleNavigate = (view: string, pollId?: string) => {
    setCurrentView(view);
    setSelectedPollId(pollId || null);
  };

  // Called when poll is created in <CreatePoll />
  const handlePollCreated = (poll: PollSummary) => {
    setSummaries((prev) => [poll, ...prev]);
    toast({ title: "Poll Created", description: "Your poll is live!" });
    handleNavigate("results", poll.id); // ✅ go directly to live results
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "home":
        return <HomePage polls={summaries} onNavigate={handleNavigate} />;

      case "create":
        return (
          <CreatePoll
            onPollCreated={handlePollCreated}
            onNavigate={handleNavigate}
          />
        );

      case "browse":
        return (
          <BrowsePolls
            polls={summaries}
            onNavigate={handleNavigate}
            loading={loading}
          />
        );

      case "poll":
        if (!selectedPollId) {
          return <div className="p-6 text-center">Poll Not Found</div>;
        }
        return (
          <PollVoting pollId={selectedPollId} onNavigate={handleNavigate} />
        );

      case "results":
        if (!selectedPollId) {
          return <div className="p-6 text-center">Poll Not Found</div>;
        }
        return (
          <LiveResults pollId={selectedPollId} onNavigate={handleNavigate} />
        );

      default:
        return <HomePage polls={summaries} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      <main>{renderCurrentView()}</main>
    </div>
  );
};

export default PollerApp;
