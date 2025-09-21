import { useState, useEffect } from "react";
import { Plus, Trash2, Settings, Calendar, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const API_BASE = "http://localhost:3000"; // 🔧 adjust if deployed

// ------------------ Types ------------------
interface Category {
  id: string;
  name: string;
}

// Shape for creating a poll (frontend → backend)
interface PollDraft {
  title: string;
  description?: string;
  categoryId?: string;
  options: { text: string }[];
  expiresAt?: string;
  allowMultipleVotes: boolean;
}

// Shape of poll returned by backend
interface Poll {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  options: { id: string; text: string; voteCount: number }[];
  status: "draft" | "active" | "expired";
  expiresAt?: string;
  createdAt: string;
}

interface CreatePollProps {
  onPollCreated: (poll: Poll) => void;
  onNavigate: (view: string, pollId?: string) => void;
}

// ------------------ Component ------------------
const CreatePoll = ({ onPollCreated, onNavigate }: CreatePollProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [hideResults, setHideResults] = useState(false); // frontend only
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();
        if (data.isSuccess) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategoryId(data.categories[0].id); // default select first category
          }
        }
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCategories();
  }, []);

  // ---------- Option handlers ----------
  const addOption = () => {
    if (options.length < 10) setOptions([...options, ""]);
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

  // ---------- Create poll ----------
  const createPoll = async () => {
    // validation
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
    if (description.length > 1000) {
      toast({
        title: "Description Too Long",
        description: "Max 1000 characters allowed.",
        variant: "destructive",
      });
      return;
    }

    const validOptions = options.filter((opt) => opt.trim().length > 0);
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

    // build request (🔥 ensure only text is sent in options)
    const draft: PollDraft = {
      title: title.trim(),
      description: description.trim(),
      options: validOptions.map((opt: any) => ({
        text: typeof opt === "string" ? opt : opt.text,
      })),
      categoryId: categoryId || undefined,
      expiresAt: pollDeadline?.toISOString(),
      allowMultipleVotes: multipleChoice,
    };

    console.log("Creating poll with body:", draft);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
        body: JSON.stringify(draft),
      });

      const data = await res.json();
      if (data.isSuccess) {
        const createdPoll: Poll = data.poll;
        onPollCreated(createdPoll);
        toast({
          title: "Poll Created!",
          description: "Your poll has been created successfully.",
        });
        onNavigate("results", createdPoll.id);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create poll",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error creating poll:", err);
      toast({
        title: "Network Error",
        description: "Could not reach the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-muted/10 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="result-card animate-fade-in-up">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-poller-black mb-4">
              Create New Poll
            </h1>
            <p className="text-gray-600">
              Design your poll and start gathering insights
            </p>
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
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 mt-1">
              {description.length}/1000 characters
            </div>
          </div>

          {/* Options */}
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
              disabled={options.length >= 10}
              className="mt-3 flex items-center gap-2 text-primary hover:bg-primary-muted px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
            <div className="text-sm text-gray-500 mt-1">
              {options.length}/10 options
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
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-input"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
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
                  <label
                    htmlFor="multipleChoice"
                    className="text-sm font-medium text-poller-black"
                  >
                    Allow multiple selections
                  </label>
                </div>

                {/* Hide Results (frontend only) */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hideResults"
                    checked={hideResults}
                    onChange={(e) => setHideResults(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label
                    htmlFor="hideResults"
                    className="text-sm font-medium text-poller-black"
                  >
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

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate("home")}
              className="btn-ghost px-8 py-4"
            >
              Cancel
            </button>
            <button
              onClick={createPoll}
              className="btn-hero"
              disabled={loading || categories.length === 0}
            >
              {loading ? "Creating..." : "Create Poll"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;
