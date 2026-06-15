import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Shield, Sparkles, Moon } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabel = (role?: string) => {
    const map: Record<string, string> = {
      HR: "Human Resources",
      RECRUITER: "Recruiter",
      INTERVIEWER: "Interviewer",
    };
    return map[role || ""] || role;
  };

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <h1 className="text-lg font-medium mb-6">Settings</h1>

      <div className="space-y-4">
        {/* Profile Section */}
        <div className="bg-secondary/50 border border-border rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500/20 to-sky-500/20 border border-border flex items-center justify-center text-xl text-foreground/70 font-medium">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[16px] font-medium">{user?.name}</h2>
              <p className="text-[13px] text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={14} className="text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Full name</div>
                <div className="text-[14px]">{user?.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield size={14} className="text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Role</div>
                <div className="text-[14px]">{roleLabel(user?.role)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-secondary/50 border border-border rounded-xl p-6">
          <h3 className="text-[14px] font-medium mb-4">Preferences</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={14} className="text-muted-foreground" />
              <div>
                <div className="text-[14px]">Dark mode</div>
                <div className="text-[11px] text-muted-foreground">Always enabled for RECRU·AI</div>
              </div>
            </div>
            <div className="w-10 h-5 bg-emerald-500/20 rounded-full relative cursor-default">
              <div className="w-4 h-4 bg-emerald-400 rounded-full absolute right-0.5 top-0.5 transition-all" />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-secondary/50 border border-border rounded-xl p-6">
          <h3 className="text-[14px] font-medium mb-4">About</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles size={14} className="text-violet-400" />
              <div>
                <div className="text-[14px]">RECRU·AI</div>
                <div className="text-[11px] text-muted-foreground">AI-powered recruitment platform</div>
              </div>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              RECRU·AI uses Gemini AI to evaluate resumes, generate interview questions, 
              and analyze code submissions — streamlining the entire hiring pipeline.
            </p>
            <div className="text-[11px] text-muted-foreground/50">Version 1.0.0</div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[13px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}
