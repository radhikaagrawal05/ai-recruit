import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { interviewService } from "../services/interviewService";
import { candidateService } from "../services/candidateService";
import type { InterviewRound, Candidate } from "../types";
import { ArrowLeft, Sparkles, Upload, Send, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

export default function InterviewPanel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [round, setRound] = useState<InterviewRound | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  // Feedback form
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [recommendNext, setRecommendNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Code upload
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [uploading, setUploading] = useState(false);

  // Regenerating questions
  const [regenerating, setRegenerating] = useState(false);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await interviewService.getById(id);
        if (res.data) {
          setRound(res.data);
          const candRes = await candidateService.getById(res.data.candidateId);
          if (candRes.data) setCandidate(candRes.data);
        }
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleSubmitFeedback = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await interviewService.submitFeedback(id, { feedback, rating, recommendNextRound: recommendNext });
      if (res.data) setRound(res.data);
      toast.success("Feedback submitted!");
    } catch {
      toast.error("Failed to submit feedback");
    }
    finally { setSubmitting(false); }
  };

  const handleUploadCode = async () => {
    if (!id || !codeFile) return;
    setUploading(true);
    try {
      const res = await interviewService.uploadCode(id, codeFile, codeLanguage);
      if (res.data) setRound(res.data);
      toast.success("Code analyzed successfully!");
    } catch {
      toast.error("Failed to upload/analyze code");
    }
    finally { setUploading(false); }
  };

  const handleRegenerate = async () => {
    if (!id) return;
    setRegenerating(true);
    try {
      const res = await interviewService.generateQuestions(id);
      if (res.data && round) {
        setRound({ ...round, suggestedQuestions: res.data });
      }
      toast.success("Questions generated!");
    } catch {
      toast.error("Failed to generate questions");
    }
    finally { setRegenerating(false); }
  };

  const difficultyColor = (d: string) => {
    if (d === "easy") return "text-emerald-400";
    if (d === "medium") return "text-amber-400";
    return "text-rose-400";
  };

  if (loading) return <div className="p-8"><div className="skeleton h-60 rounded-xl" /></div>;
  if (!round) return <div className="p-8 text-muted-foreground">Interview not found</div>;

  return (
    <div className="p-8 max-w-6xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-lg font-medium">Round {round.roundNumber}</h1>
        <span className={`text-[11px] px-2 py-0.5 rounded ${round.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" : "bg-sky-500/10 text-sky-400"}`}>
          {round.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Candidate info */}
        <div className="space-y-4">
          {candidate && (
            <div className="bg-secondary/50 border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-[14px] text-muted-foreground font-medium">
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[14px] font-medium">{candidate.name}</div>
                  <div className="text-[12px] text-muted-foreground">{candidate.email}</div>
                </div>
              </div>
              {candidate.aiSummary && (
                <p className="text-[12px] text-muted-foreground leading-relaxed mt-2">{candidate.aiSummary}</p>
              )}
              {candidate.aiGrade && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">AI Grade:</span>
                  <span className={`text-[12px] font-medium px-2 py-0.5 rounded border ${
                    { A: "grade-a", B: "grade-b", C: "grade-c", D: "grade-d", F: "grade-f" }[candidate.aiGrade] || ""
                  }`}>{candidate.aiGrade}</span>
                </div>
              )}
            </div>
          )}

          {/* Code analysis */}
          {round.codeAnalysis && round.codeAnalysis.summary && (
            <div className="bg-secondary/50 border border-border rounded-xl p-5">
              <h3 className="text-[13px] font-medium mb-3">Code Analysis</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] text-muted-foreground">Quality:</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${round.codeAnalysis.quality >= 70 ? "bg-emerald-500" : round.codeAnalysis.quality >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${round.codeAnalysis.quality}%` }}
                  />
                </div>
                <span className="text-[12px]">{round.codeAnalysis.quality}%</span>
              </div>
              <p className="text-[12px] text-muted-foreground mb-2">{round.codeAnalysis.summary}</p>
            </div>
          )}
        </div>

        {/* Center — Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-medium">Suggested questions</h2>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-muted-foreground/30 disabled:opacity-50 transition-all"
            >
              <Sparkles size={12} />
              {regenerating ? "Generating..." : "Regenerate"}
            </button>
          </div>

          <div className="space-y-6">
            {["easy", "medium", "hard"].map((difficulty) => {
              const questions = round.suggestedQuestions.filter(q => q.difficulty === difficulty);
              if (questions.length === 0) return null;
              
              return (
                <div key={difficulty} className="space-y-2">
                  <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground ml-1">
                    {difficulty} Questions
                  </h3>
                  {questions.map((q) => {
                    const globalIndex = round.suggestedQuestions.indexOf(q);
                    return (
                      <div key={globalIndex} className="bg-secondary/50 border border-border rounded-lg p-4 hover:border-muted-foreground/30 transition-all">
                        <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpandedQ(expandedQ === globalIndex ? null : globalIndex)}>
                          <div className="flex-1">
                            <p className="text-[13px] leading-relaxed">{q.question}</p>
                          </div>
                          {expandedQ === globalIndex ? <ChevronUp size={14} className="text-muted-foreground mt-0.5" /> : <ChevronDown size={14} className="text-muted-foreground mt-0.5" />}
                        </div>
                        {expandedQ === globalIndex && (
                          <div className="mt-3 pt-3 border-t border-border flex items-center gap-3">
                            <span className="text-[11px] bg-secondary px-2 py-0.5 rounded text-muted-foreground">{q.category}</span>
                            <span className={`text-[11px] ${difficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                            <span className="text-[11px] text-muted-foreground/60">{q.intent}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {round.suggestedQuestions.length === 0 && (
              <div className="text-center py-8 text-[13px] text-muted-foreground">
                No questions generated yet.
                <button onClick={handleRegenerate} className="text-foreground hover:underline ml-1">Generate now</button>
              </div>
            )}
          </div>
        </div>

        {/* Right — Feedback form */}
        <div className="space-y-4">
          {round.status !== "COMPLETED" ? (
            <>
              {/* Code upload */}
              <div className="bg-secondary/50 border border-border rounded-xl p-5">
                <h3 className="text-[13px] font-medium mb-3">Code submission</h3>
                <div className="space-y-3">
                  <select value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-[12px] outline-none">
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                  </select>
                  <label className="flex items-center gap-2 px-3 py-3 bg-secondary border border-dashed border-border rounded-lg cursor-pointer hover:border-muted-foreground/40">
                    <Upload size={14} className="text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground">{codeFile ? codeFile.name : "Upload code file..."}</span>
                    <input type="file" onChange={(e) => setCodeFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  {codeFile && (
                    <button
                      onClick={handleUploadCode}
                      disabled={uploading}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-[12px] hover:border-muted-foreground/30 disabled:opacity-50"
                    >
                      {uploading ? "Uploading & analyzing..." : "Upload & analyze"}
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-secondary/50 border border-border rounded-xl p-5">
                <h3 className="text-[13px] font-medium mb-3">Interview feedback</h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-muted-foreground">Rating (1-10)</label>
                    <input type="number" min={1} max={10} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none w-20" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-muted-foreground">Detailed feedback</label>
                    <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={5} placeholder="How did the candidate perform? Areas of strength and improvement..." className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none resize-none" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={recommendNext} onChange={(e) => setRecommendNext(e.target.checked)} className="rounded" />
                    <span className="text-[12px] text-muted-foreground">Recommend next round</span>
                  </label>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submitting || feedback.length < 10}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      <Send size={14} />
                      {submitting ? "Submitting..." : "Submit feedback"}
                    </button>
                    {feedback.length > 0 && feedback.length < 10 && (
                      <span className="text-[11px] text-rose-500 text-center">Feedback must be at least 10 characters</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-secondary/50 border border-border rounded-xl p-5">
              <h3 className="text-[13px] font-medium mb-3">Feedback</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Rating:</span>
                  <span className="text-[14px] font-medium">{round.interviewerRating}/10</span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{round.interviewerFeedback}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${round.recommendNextRound ? "text-emerald-400" : "text-rose-400"}`}>
                    {round.recommendNextRound ? "✓ Recommended for next round" : "✗ Not recommended for next round"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
