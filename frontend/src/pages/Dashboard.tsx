import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobService } from "../services/jobService";
import { candidateService } from "../services/candidateService";
import { Briefcase, Users, ClipboardCheck, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobStats, setJobStats] = useState({ total: 0, open: 0, closed: 0, paused: 0 });
  const [candidateStats, setCandidateStats] = useState({ total: 0, screening: 0, interview: 0, offered: 0, hired: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobs, candidates] = await Promise.all([
          jobService.getStats(),
          candidateService.getStats(),
        ]);
        if (jobs.data) setJobStats(jobs.data);
        if (candidates.data) setCandidateStats(candidates.data);
      } catch {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    { label: "Open jobs", value: jobStats.open, icon: Briefcase, onClick: () => navigate("/jobs"), color: "text-sky-400" },
    { label: "Total candidates", value: candidateStats.total, icon: Users, onClick: () => navigate("/candidates"), color: "text-violet-400" },
    { label: "In review", value: candidateStats.screening + candidateStats.interview, icon: ClipboardCheck, color: "text-amber-400" },
    { label: "Hired", value: candidateStats.hired, icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-lg font-medium">
          {greeting()}, {user?.name}
        </h1>
        <span className="text-[11px] bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground">
          {user?.role}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={stat.onClick}
            className={`bg-secondary/50 border border-border rounded-xl p-5 ${stat.onClick ? "cursor-pointer hover:border-muted-foreground/30" : ""} transition-all group`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-muted-foreground">{stat.label}</span>
              <stat.icon size={16} strokeWidth={1.5} className={`${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="text-2xl font-medium">
              {loading ? <div className="skeleton h-7 w-12 rounded" /> : stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline overview */}
        <div className="bg-secondary/50 border border-border rounded-xl p-5">
          <h2 className="text-[14px] font-medium mb-4">Pipeline overview</h2>
          <div className="space-y-3">
            {[
              { label: "Applied", count: candidateStats.total - candidateStats.screening - candidateStats.interview - candidateStats.offered - candidateStats.hired, color: "bg-zinc-500" },
              { label: "Screening", count: candidateStats.screening, color: "bg-sky-500" },
              { label: "Interview", count: candidateStats.interview, color: "bg-violet-500" },
              { label: "Offered", count: candidateStats.offered, color: "bg-amber-500" },
              { label: "Hired", count: candidateStats.hired, color: "bg-emerald-500" },
            ].map((stage) => (
              <div key={stage.label} className="flex items-center gap-3">
                <span className="text-[12px] text-muted-foreground w-20">{stage.label}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${candidateStats.total > 0 ? (stage.count / candidateStats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[12px] text-muted-foreground w-6 text-right">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-secondary/50 border border-border rounded-xl p-5">
          <h2 className="text-[14px] font-medium mb-4">Quick actions</h2>
          <div className="space-y-2">
            {user?.role === "HR" && (
              <button
                onClick={() => navigate("/jobs")}
                className="w-full text-left px-4 py-3 rounded-lg bg-secondary/50 border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all"
              >
                + Create a new job posting
              </button>
            )}
            {(user?.role === "HR" || user?.role === "RECRUITER") && (
              <button
                onClick={() => navigate("/candidates")}
                className="w-full text-left px-4 py-3 rounded-lg bg-secondary/50 border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all"
              >
                + Add a new candidate
              </button>
            )}
            <button
              onClick={() => navigate("/interviews")}
              className="w-full text-left px-4 py-3 rounded-lg bg-secondary/50 border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all"
            >
              View interviews
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}