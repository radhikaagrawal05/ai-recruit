import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { candidateService } from "../services/candidateService";
import type { Candidate } from "../types";
import { Search } from "lucide-react";

export default function Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await candidateService.getAll({
          status: statusFilter || undefined,
          aiGrade: gradeFilter || undefined,
        });
        if (res.data) setCandidates(res.data);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [statusFilter, gradeFilter]);

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <h1 className="text-lg font-medium mb-6">Candidates</h1>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-muted-foreground/30"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-secondary border border-border rounded-lg px-3 py-2 text-[12px] outline-none text-muted-foreground">
          <option value="">All statuses</option>
          <option value="APPLIED">Applied</option>
          <option value="SCREENING">Screening</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFERED">Offered</option>
          <option value="HIRED">Hired</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="bg-secondary border border-border rounded-lg px-3 py-2 text-[12px] outline-none text-muted-foreground">
          <option value="">All grades</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
          <option value="D">Grade D</option>
          <option value="F">Grade F</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50 border-b border-border">
              <th className="text-left px-5 py-3 text-[11px] text-muted-foreground font-medium tracking-wide">Name</th>
              <th className="text-left px-5 py-3 text-[11px] text-muted-foreground font-medium tracking-wide">Email</th>
              <th className="text-left px-5 py-3 text-[11px] text-muted-foreground font-medium tracking-wide">Grade</th>
              <th className="text-left px-5 py-3 text-[11px] text-muted-foreground font-medium tracking-wide">Score</th>
              <th className="text-left px-5 py-3 text-[11px] text-muted-foreground font-medium tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="skeleton h-5 rounded" /></td></tr>
            ))}
            {!loading && filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/candidates/${c.id}`)}
                className="border-b border-border last:border-b-0 cursor-pointer hover:bg-secondary/30 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[11px] text-muted-foreground font-medium">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[13px]">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{c.email}</td>
                <td className="px-5 py-3.5">
                  {c.aiGrade ? (
                    <span className={`text-[11px] px-2 py-0.5 rounded border ${gradeClass(c.aiGrade)}`}>
                      {c.aiGrade}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-[13px] text-muted-foreground">
                  {c.aiScores?.overall ? `${c.aiScores.overall}%` : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[12px] ${statusColor(c.status)}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-[13px] text-muted-foreground">No candidates found</div>
        )}
      </div>
    </div>
  );
}
