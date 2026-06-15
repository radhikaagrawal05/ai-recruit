import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobService } from "../services/jobService";
import type { Job } from "../types";
import { Plus, Search, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [form, setForm] = useState({ title: "", department: "", description: "", requiredSkills: "", experienceLevel: "", location: "" });
  const [creating, setCreating] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await jobService.getAll();
      if (res.data) setJobs(res.data);
    } catch {
      toast.error("Failed to load jobs");
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await jobService.create({
        ...form,
        requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setShowCreate(false);
      setForm({ title: "", department: "", description: "", requiredSkills: "", experienceLevel: "", location: "" });
      toast.success("Job created successfully!");
      fetchJobs();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create job";
      const errors = err.response?.data?.errors;
      if (errors && Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0] as string[];
        toast.error(firstError[0] || msg);
      } else {
        toast.error(msg);
      }
    }
    finally { setCreating(false); }
  };

  const filtered = jobs.filter(
    (j) =>
      (j.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (j.department || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === "OPEN") return "bg-emerald-500/10 text-emerald-400";
    if (status === "PAUSED") return "bg-amber-500/10 text-amber-400";
    return "bg-zinc-500/10 text-zinc-400";
  };

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-medium">Jobs</h1>
          <span className="text-[12px] bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground">
            {jobs.length}
          </span>
        </div>
        {user?.role === "HR" && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            New job
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs..."
          className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-muted-foreground/30 transition-colors"
        />
      </div>

      {/* Job List */}
      <div className="space-y-3">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}

        {!loading && filtered.map((job) => (
          <div
            key={job.id}
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="bg-secondary/50 border border-border rounded-xl p-5 cursor-pointer hover:border-muted-foreground/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[15px] font-medium group-hover:text-foreground transition-colors">{job.title}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{job.department}{job.location ? ` · ${job.location}` : ""}</div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded ${statusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground line-clamp-2 mb-3">{job.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {job.requiredSkills?.slice(0, 5).map((skill) => (
                <span key={skill} className="text-[11px] bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground">
                  {skill}
                </span>
              ))}
              {job.requiredSkills?.length > 5 && (
                <span className="text-[11px] text-muted-foreground/50">+{job.requiredSkills.length - 5}</span>
              )}
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-[13px] text-muted-foreground">No jobs found</div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowCreate(false)}>
          <div className="bg-background border border-border rounded-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-medium">Create job posting</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-muted-foreground">Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-muted-foreground">Department</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40 resize-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground">Required skills (comma-separated)</label>
                <input value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} placeholder="React, Node.js, TypeScript" required className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-muted-foreground">Experience level</label>
                  <input value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} placeholder="Senior" className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-muted-foreground">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote" className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
                </div>
              </div>

              <button type="submit" disabled={creating} className="bg-foreground text-background rounded-lg py-2.5 font-medium text-[13px] hover:opacity-90 disabled:opacity-50 mt-2">
                {creating ? "Creating..." : "Create job"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}