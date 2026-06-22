import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobService } from "../services/jobService";
import { candidateService } from "../services/candidateService";
import type { Job, Candidate } from "../types";
import { ArrowLeft, Plus, Upload, Sparkles, Pencil, Trash2, X, Pause, Play, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ui/ConfirmModal";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [file, setFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);

  // Bulk upload
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploadingBulk, setUploadingBulk] = useState(false);

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", department: "", description: "", requiredSkills: "", experienceLevel: "", location: "" });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [jobRes, candRes] = await Promise.all([
          jobService.getById(id),
          candidateService.getAll({ jobId: id }),
        ]);
        if (jobRes.data) setJob(jobRes.data);
        if (candRes.data) setCandidates(candRes.data);
      } catch {
        toast.error("Failed to load job details");
      }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setAdding(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("jobId", id);
      if (file) formData.append("resume", file);
      const res = await candidateService.create(formData);
      if (res.data) {
        // If resume was uploaded, parse it
        if (file && res.data.id) {
          try {
            await candidateService.parseResume(res.data.id, file);
          } catch { }
        }
        setCandidates([res.data, ...candidates]);
      }
      setShowAdd(false);
      setForm({ name: "", email: "", phone: "" });
      setFile(null);
      toast.success("Candidate added successfully!");
    } catch {
      toast.error("Failed to add candidate");
    }
    finally { setAdding(false); }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !bulkFile) return;
    setUploadingBulk(true);
    try {
      const res = await jobService.uploadBulkCandidates(id, bulkFile);
      toast.success(`Bulk upload complete! Added: ${res.data.added}, Updated: ${res.data.updated}`);
      
      // Refresh candidates
      const candRes = await candidateService.getAll({ jobId: id });
      if (candRes.data) setCandidates(candRes.data);
      
      setShowBulkUpload(false);
      setBulkFile(null);
    } catch {
      toast.error("Failed to upload bulk candidates");
    } finally {
      setUploadingBulk(false);
    }
  };

  const handleEvaluate = async (candidateId: string) => {
    const toastId = toast.loading("Evaluating resume with AI...");
    try {
      await candidateService.evaluateResume(candidateId);
      // Refresh candidates
      if (id) {
        const res = await candidateService.getAll({ jobId: id });
        if (res.data) setCandidates(res.data);
      }
      toast.success("Resume evaluated!", { id: toastId });
    } catch {
      toast.error("AI evaluation failed", { id: toastId });
    }
  };

  // --- Edit job ---
  const openEdit = () => {
    if (!job) return;
    setEditForm({
      title: job.title,
      department: job.department,
      description: job.description || "",
      requiredSkills: (job.requiredSkills || []).join(", "),
      experienceLevel: job.experienceLevel || "",
      location: job.location || "",
    });
    setShowEdit(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const res = await jobService.update(id, {
        ...editForm,
        requiredSkills: editForm.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      } as any);
      if (res.data) setJob(res.data);
      setShowEdit(false);
      toast.success("Job updated!");
    } catch {
      toast.error("Failed to update job");
    }
    finally { setSaving(false); }
  };

  // --- Status toggle ---
  const handleStatusChange = async (status: "OPEN" | "PAUSED" | "CLOSED") => {
    if (!id) return;
    try {
      const res = await jobService.update(id, { status } as any);
      if (res.data) setJob(res.data);
      toast.success(`Job ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  // --- Delete job ---
  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await jobService.delete(id);
      toast.success("Job deleted");
      navigate("/jobs");
    } catch {
      toast.error("Failed to delete job");
    }
    finally { setDeleting(false); }
  };

  const gradeClass = (grade?: string) => {
    const map: Record<string, string> = { A: "grade-a", B: "grade-b", C: "grade-c", D: "grade-d", F: "grade-f" };
    return map[grade || ""] || "bg-secondary text-muted-foreground";
  };

  if (loading) return <div className="p-8"><div className="skeleton h-40 rounded-xl" /></div>;
  if (!job) return <div className="p-8 text-muted-foreground">Job not found</div>;

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <button onClick={() => navigate("/jobs")} className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to jobs
      </button>

      {/* Job header */}
      <div className="bg-secondary/50 border border-border rounded-xl p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-medium mb-1">{job.title}</h1>
            <p className="text-[13px] text-muted-foreground">{job.department}{job.location ? ` · ${job.location}` : ""}{job.experienceLevel ? ` · ${job.experienceLevel}` : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2 py-0.5 rounded ${job.status === "OPEN" ? "bg-emerald-500/10 text-emerald-400" : job.status === "PAUSED" ? "bg-amber-500/10 text-amber-400" : "bg-zinc-500/10 text-zinc-400"}`}>
              {job.status}
            </span>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground mt-4 leading-relaxed">{job.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {(job.requiredSkills || []).map((skill) => (
            <span key={skill} className="text-[11px] bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground">{skill}</span>
          ))}
        </div>

        {/* Job actions for HR */}
        {user?.role === "HR" && (
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
            {/* Status toggles */}
            {job.status !== "OPEN" && (
              <button
                onClick={() => handleStatusChange("OPEN")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
              >
                <Play size={12} /> Open
              </button>
            )}
            {job.status !== "PAUSED" && job.status !== "CLOSED" && (
              <button
                onClick={() => handleStatusChange("PAUSED")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all"
              >
                <Pause size={12} /> Pause
              </button>
            )}
            {job.status !== "CLOSED" && (
              <button
                onClick={() => handleStatusChange("CLOSED")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 rounded-lg hover:bg-zinc-500/20 transition-all"
              >
                <XCircle size={12} /> Close
              </button>
            )}

            <div className="flex-1" />

            <button
              onClick={openEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-muted-foreground border border-border rounded-lg hover:border-muted-foreground/30 hover:text-foreground transition-all"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Candidates section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-medium">Candidates</h2>
          <span className="text-[12px] bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground">{candidates.length}</span>
        </div>
        {(user?.role === "HR" || user?.role === "RECRUITER") && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBulkUpload(true)} className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border text-foreground rounded-lg text-[12px] font-medium hover:border-muted-foreground/30">
              <Upload size={12} /> Bulk upload
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background rounded-lg text-[12px] font-medium hover:opacity-90">
              <Plus size={12} /> Add candidate
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {candidates.map((c, i) => (
          <div
            key={c.id}
            onClick={() => navigate(`/candidates/${c.id}`)}
            className="flex items-center justify-between bg-secondary/50 border border-border rounded-lg p-4 cursor-pointer hover:border-muted-foreground/30 transition-all animate-stagger-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[12px] text-muted-foreground font-medium">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-[14px] font-medium">{c.name}</div>
                <div className="text-[12px] text-muted-foreground">{c.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {c.aiGrade ? (
                <span className={`text-[11px] px-2 py-0.5 rounded border ${gradeClass(c.aiGrade)}`}>
                  Grade {c.aiGrade}
                </span>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleEvaluate(c.id); }}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-muted-foreground/30 transition-all"
                >
                  <Sparkles size={12} /> Evaluate
                </button>
              )}
              <span className="text-[11px] text-muted-foreground">{c.status}</span>
            </div>
          </div>
        ))}

        {candidates.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users2Icon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-[14px] font-medium mb-1">No candidates yet</p>
            <p className="text-[12px] text-muted-foreground/60">Add candidates to start evaluating resumes with AI</p>
          </div>
        )}
      </div>

      {/* Add Candidate Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-modal-in" onClick={() => setShowAdd(false)}>
          <div className="bg-background border border-border rounded-xl w-full max-w-md p-6 animate-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-medium">Add candidate</h2>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email" required className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground">Resume (PDF or DOCX)</label>
                <label className="flex items-center gap-2 px-3 py-3 bg-secondary border border-dashed border-border rounded-lg cursor-pointer hover:border-muted-foreground/40 transition-colors">
                  <Upload size={14} className="text-muted-foreground" />
                  <span className="text-[12px] text-muted-foreground">{file ? file.name : "Choose file..."}</span>
                  <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>
              <button type="submit" disabled={adding} className="bg-foreground text-background rounded-lg py-2.5 font-medium text-[13px] hover:opacity-90 disabled:opacity-50 mt-1">
                {adding ? "Adding..." : "Add candidate"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-modal-in" onClick={() => setShowBulkUpload(false)}>
          <div className="bg-background border border-border rounded-xl w-full max-w-md p-6 animate-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-medium">Bulk upload candidates</h2>
              <button onClick={() => setShowBulkUpload(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <p className="text-[12px] text-muted-foreground mb-4">
              Upload an Excel (.xlsx) or CSV file extracted from your Google Form. 
              Required columns: <strong>Name, Email</strong>. Optional: <strong>Phone, Resume</strong> (Google Drive link).
            </p>
            <form onSubmit={handleBulkUpload} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center justify-center gap-2 px-3 py-6 bg-secondary border border-dashed border-border rounded-lg cursor-pointer hover:border-muted-foreground/40 transition-colors">
                  <Upload size={18} className="text-muted-foreground" />
                  <span className="text-[13px] font-medium text-muted-foreground">{bulkFile ? bulkFile.name : "Select Excel/CSV file"}</span>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setBulkFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>
              <button type="submit" disabled={uploadingBulk || !bulkFile} className="bg-foreground text-background rounded-lg py-2.5 font-medium text-[13px] hover:opacity-90 disabled:opacity-50 mt-1">
                {uploadingBulk ? "Uploading & Processing..." : "Upload Candidates"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-modal-in" onClick={() => setShowEdit(false)}>
          <div className="bg-background border border-border rounded-xl w-full max-w-lg p-6 animate-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-medium">Edit job</h2>
              <button onClick={() => setShowEdit(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-muted-foreground">Title</label>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-muted-foreground">Department</label>
                  <input value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} required className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required rows={3} className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40 resize-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground">Required skills (comma-separated)</label>
                <input value={editForm.requiredSkills} onChange={(e) => setEditForm({ ...editForm, requiredSkills: e.target.value })} required className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-muted-foreground">Experience level</label>
                  <input value={editForm.experienceLevel} onChange={(e) => setEditForm({ ...editForm, experienceLevel: e.target.value })} placeholder="Senior" className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-muted-foreground">Location</label>
                  <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="Remote" className="bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-muted-foreground/40" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="bg-foreground text-background rounded-lg py-2.5 font-medium text-[13px] hover:opacity-90 disabled:opacity-50 mt-2">
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <ConfirmModal
          title="Delete this job?"
          message={`This will permanently delete "${job.title}" and cannot be undone. Candidates linked to this job will not be deleted.`}
          confirmLabel="Delete job"
          confirmVariant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

// Simple icon for empty state
function Users2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
