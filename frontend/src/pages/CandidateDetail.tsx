import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { candidateService } from "../services/candidateService";
import { interviewService } from "../services/interviewService";
import type { Candidate, InterviewRound } from "../types";
import { ArrowLeft, Sparkles, Plus, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ui/ConfirmModal";

const STATUSES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFERED", "REJECTED", "HIRED"] as const;

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [candRes, roundsRes] = await Promise.all([
          candidateService.getById(id),
          interviewService.getByCandidateId(id),
        ]);
        if (candRes.data) setCandidate(candRes.data);
        if (roundsRes.data) setRounds(roundsRes.data);
      } catch {
        toast.error("Failed to load candidate");
      }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleEvaluate = async () => {
    if (!id) return;
    setEvaluating(true);
    const toastId = toast.loading("Evaluating resume with AI...");
    try {
      await candidateService.evaluateResume(id);
      const res = await candidateService.getById(id);
      if (res.data) setCandidate(res.data);
      toast.success("Resume evaluated!", { id: toastId });
    } catch {
      toast.error("AI evaluation failed", { id: toastId });
    }
    finally { setEvaluating(false); }
  };

  const handleScheduleInterview = async () => {
    if (!id || !candidate) return;
    setScheduling(true);
    try {
      await interviewService.create({ candidateId: id, jobId: candidate.jobId });
      const res = await interviewService.getByCandidateId(id);
      if (res.data) setRounds(res.data);
      toast.success("Interview scheduled!");
    } catch {
      toast.error("Failed to schedule interview");
    }
    finally { setScheduling(false); }
  };

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      const res = await candidateService.updateStatus(id, status);
      if (res.data) setCandidate(res.data);
      toast.success(`Status updated to ${status.toLowerCase().replace("_", " ")}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await candidateService.delete(id);
      toast.success("Candidate deleted");
      navigate(-1);
    } catch {
      toast.error("Failed to delete candidate");
    }
    finally { setDeleting(false); }
  };

  const gradeClass = (grade?: string) => {
    const map: Record<string, string> = { A: "grade-a", B: "grade-b", C: "grade-c", D: "grade-d", F: "grade-f" };
    return map[grade || ""] || "bg-secondary text-muted-foreground";
  };

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      APPLIED: "text-zinc-400", SCREENING: "text-sky-400", INTERVIEW: "text-violet-400",
      OFFERED: "text-amber-400", REJECTED: "text-rose-400", HIRED: "text-emerald-400",
    };
    return map[status] || "text-muted-foreground";
  };

  if (loading) return <div className="p-8"><div className="skeleton h-60 rounded-xl" /></div>;
  if (!candidate) return <div className="p-8 text-muted-foreground">Candidate not found</div>;

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Candidate info + AI analysis */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-secondary/50 border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-sky-500/20 border border-border flex items-center justify-center text-lg text-foreground/70 font-medium">
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-lg font-medium">{candidate.name}</h1>
                  <p className="text-[13px] text-muted-foreground">{candidate.email}{candidate.phone ? ` · ${candidate.phone}` : ""}</p>
                </div>
              </div>
              {candidate.aiGrade && (
                <span className={`text-lg font-semibold px-3 py-1 rounded border ${gradeClass(candidate.aiGrade)}`}>
                  {candidate.aiGrade}
                </span>
              )}
            </div>

            {candidate.aiSummary && (
              <p className="text-[13px] text-muted-foreground leading-relaxed">{candidate.aiSummary}</p>
            )}

            <div className="flex items-center gap-3 mt-4">
              {!candidate.aiGrade && (
                <button
                  onClick={handleEvaluate}
                  disabled={evaluating}
                  className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  {evaluating ? "Evaluating..." : "AI Evaluate Resume"}
                </button>
              )}

              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-[12px] text-muted-foreground border border-border rounded-lg hover:border-muted-foreground/30 hover:text-foreground transition-all"
                >
                  <Download size={12} /> Download resume
                </a>
              )}
            </div>
          </div>

          {/* AI Scores */}
          {candidate.aiScores && (
            <div className="bg-secondary/50 border border-border rounded-xl p-6">
              <h2 className="text-[14px] font-medium mb-4">AI Analysis</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(candidate.aiScores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="text-[12px] font-medium">{value}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${value >= 70 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4 mt-5">
                {candidate.aiStrengths && candidate.aiStrengths.length > 0 && (
                  <div>
                    <h3 className="text-[12px] text-emerald-400 mb-2">Strengths</h3>
                    <ul className="space-y-1">
                      {candidate.aiStrengths.map((s, i) => (
                        <li key={i} className="text-[12px] text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {candidate.aiWeaknesses && candidate.aiWeaknesses.length > 0 && (
                  <div>
                    <h3 className="text-[12px] text-rose-400 mb-2">Areas to probe</h3>
                    <ul className="space-y-1">
                      {candidate.aiWeaknesses.map((w, i) => (
                        <li key={i} className="text-[12px] text-muted-foreground">• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right — Status, Actions, Interview rounds */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-secondary/50 border border-border rounded-xl p-5">
            <div className="text-[11px] text-muted-foreground mb-2">Status</div>
            {(user?.role === "HR" || user?.role === "RECRUITER") ? (
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      candidate.status === s
                        ? `${statusColor(s)} bg-current/10 border-current/20 font-medium`
                        : "text-muted-foreground/50 border-border hover:border-muted-foreground/30 hover:text-muted-foreground"
                    }`}
                  >
                    {s.toLowerCase().replace("_", " ")}
                  </button>
                ))}
              </div>
            ) : (
              <div className={`text-[14px] font-medium capitalize ${statusColor(candidate.status)}`}>
                {candidate.status.toLowerCase().replace("_", " ")}
              </div>
            )}
          </div>

          {/* Actions */}
          {(user?.role === "HR" || user?.role === "RECRUITER") && (
            <div className="space-y-2">
              <button
                onClick={handleScheduleInterview}
                disabled={scheduling}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
              >
                <Plus size={14} />
                {scheduling ? "Creating..." : "Schedule Interview"}
              </button>

              <button
                onClick={() => setShowDelete(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all"
              >
                <Trash2 size={12} /> Delete candidate
              </button>
            </div>
          )}

          {/* Interview rounds */}
          <div className="bg-secondary/50 border border-border rounded-xl p-5">
            <h2 className="text-[14px] font-medium mb-4">Interview rounds</h2>
            {rounds.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No interviews scheduled</p>
            ) : (
              <div className="space-y-3">
                {rounds.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/interviews/${r.id}`)}
                    className="p-3 bg-secondary/50 border border-border rounded-lg cursor-pointer hover:border-muted-foreground/30 transition-all"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] font-medium">Round {r.roundNumber}</span>
                      <span className={`text-[11px] ${r.status === "COMPLETED" ? "text-emerald-400" : r.status === "SCHEDULED" ? "text-sky-400" : "text-muted-foreground"}`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.suggestedQuestions.length} questions
                      {r.interviewerRating ? ` · Rating: ${r.interviewerRating}/10` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDelete && (
        <ConfirmModal
          title="Delete this candidate?"
          message={`This will permanently delete "${candidate.name}" and all associated data. This action cannot be undone.`}
          confirmLabel="Delete candidate"
          confirmVariant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
