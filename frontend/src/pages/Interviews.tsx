import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { interviewService } from "../services/interviewService";
import type { InterviewRound } from "../types";
import { Search, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

type TabFilter = "ALL" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export default function Interviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabFilter>("ALL");

  useEffect(() => {
    const fetch = async () => {
      try {
        let res;
        if (user?.role === "INTERVIEWER") {
          res = await interviewService.getMyInterviews();
        } else {
          res = await interviewService.getAll();
        }
        if (res.data) setInterviews(res.data);
      } catch {
        toast.error("Failed to load interviews");
      }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const filtered = interviews.filter((round) => {
    if (tab !== "ALL" && round.status !== tab) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        `round ${round.roundNumber}`.includes(s) ||
        round.status.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const tabs: { label: string; value: TabFilter; count: number }[] = [
    { label: "All", value: "ALL", count: interviews.length },
    { label: "Scheduled", value: "SCHEDULED", count: interviews.filter((i) => i.status === "SCHEDULED").length },
    { label: "In progress", value: "IN_PROGRESS", count: interviews.filter((i) => i.status === "IN_PROGRESS").length },
    { label: "Completed", value: "COMPLETED", count: interviews.filter((i) => i.status === "COMPLETED").length },
  ];

  const statusStyle = (status: string) => {
    const map: Record<string, string> = {
      SCHEDULED: "bg-sky-500/10 text-sky-400",
      IN_PROGRESS: "bg-violet-500/10 text-violet-400",
      COMPLETED: "bg-emerald-500/10 text-emerald-400",
      CANCELLED: "bg-zinc-500/10 text-zinc-400",
    };
    return map[status] || "bg-secondary text-muted-foreground";
  };

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-lg font-medium">
          {user?.role === "INTERVIEWER" ? "My interviews" : "All interviews"}
        </h1>
        <span className="text-[12px] bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground">
          {interviews.length}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border pb-px">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-2 text-[12px] rounded-t-lg transition-all border-b-2 ${
              tab === t.value
                ? "text-foreground border-foreground"
                : "text-muted-foreground border-transparent hover:text-foreground/70"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search interviews..."
          className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-muted-foreground/30 transition-colors"
        />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((round, i) => (
            <div
              key={round.id}
              onClick={() => navigate(`/interviews/${round.id}`)}
              className="bg-secondary/50 border border-border rounded-xl p-5 cursor-pointer hover:border-muted-foreground/30 transition-all animate-stagger-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-medium">Round {round.roundNumber}</span>
                  {round.interviewerRating && (
                    <span className="text-[11px] text-muted-foreground">Rating: {round.interviewerRating}/10</span>
                  )}
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded ${statusStyle(round.status)}`}>
                  {round.status.replace("_", " ")}
                </span>
              </div>
              <div className="text-[12px] text-muted-foreground flex items-center gap-3">
                <span>{round.suggestedQuestions.length} questions</span>
                {round.scheduledAt && <span>· {new Date(round.scheduledAt).toLocaleDateString()}</span>}
                {round.codeAnalysis && <span>· Code: {round.codeAnalysis.quality}%</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-[14px] font-medium mb-1">
            {interviews.length === 0
              ? (user?.role === "INTERVIEWER" ? "No interviews assigned yet" : "No interviews created yet")
              : "No interviews match your filter"
            }
          </p>
          <p className="text-[12px] text-muted-foreground/60">
            {interviews.length === 0
              ? "Interviews will appear here once scheduled from candidate profiles"
              : "Try adjusting your search or filter"
            }
          </p>
        </div>
      )}
    </div>
  );
}
