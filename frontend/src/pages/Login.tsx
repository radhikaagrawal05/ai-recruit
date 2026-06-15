import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

type View = "login" | "register" | "verify";

export default function Login() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("HR");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authService.login({ email, password });
      if (res.data) {
        login(res.data.token, res.data.user);
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.register({ name, email, password, role });
      setSuccess("Account created successfully! You can now sign in.");
      toast.success("Account created!");
      setView("login");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.verifyEmail({ email, code });
      setSuccess("Email verified! You can now sign in.");
      toast.success("Email verified!");
      setView("login");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Verification failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendVerification(email);
      setSuccess("New verification code sent!");
      toast.success("Verification code resent!");
    } catch {
      setError("Failed to resend code");
      toast.error("Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[380px] px-8 animate-fade-in">
        <div className="text-[11px] tracking-[0.08em] text-muted-foreground mb-6">RECRU·AI</div>

        {view === "login" && (
          <>
            <h1 className="text-xl font-medium text-foreground mb-1">Welcome back</h1>
            <p className="text-[13px] text-muted-foreground mb-7">Sign in to your workspace</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground tracking-wide">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="bg-secondary border border-border rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-muted-foreground/40 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground tracking-wide">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-secondary border border-border rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-muted-foreground/40 transition-colors"
                />
              </div>

              {error && <p className="text-[12px] text-rose-400">{error}</p>}
              {success && <p className="text-[12px] text-emerald-400">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="bg-foreground text-background rounded-lg py-2.5 font-medium text-[14px] hover:opacity-90 disabled:opacity-50 transition-opacity mt-1"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-[12px] text-muted-foreground mt-5 text-center">
              Don't have an account?{" "}
              <button onClick={() => { setView("register"); setError(""); setSuccess(""); }} className="text-foreground hover:underline">
                Register
              </button>
            </p>
          </>
        )}

        {view === "register" && (
          <>
            <h1 className="text-xl font-medium text-foreground mb-1">Create account</h1>
            <p className="text-[13px] text-muted-foreground mb-7">Register for your workspace</p>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground tracking-wide">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="bg-secondary border border-border rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-muted-foreground/40 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground tracking-wide">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="bg-secondary border border-border rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-muted-foreground/40 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground tracking-wide">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-secondary border border-border rounded-lg px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-muted-foreground/40 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground tracking-wide">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3.5 py-2.5 text-[14px] text-foreground outline-none focus:border-muted-foreground/40 transition-colors"
                >
                  <option value="HR">HR</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="INTERVIEWER">Interviewer</option>
                </select>
              </div>

              {error && <p className="text-[12px] text-rose-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="bg-foreground text-background rounded-lg py-2.5 font-medium text-[14px] hover:opacity-90 disabled:opacity-50 transition-opacity mt-1"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-[12px] text-muted-foreground mt-5 text-center">
              Already have an account?{" "}
              <button onClick={() => { setView("login"); setError(""); setSuccess(""); }} className="text-foreground hover:underline">
                Sign in
              </button>
            </p>
          </>
        )}

        {view === "verify" && (
          <>
            <h1 className="text-xl font-medium text-foreground mb-1">Verify email</h1>
            <p className="text-[13px] text-muted-foreground mb-7">
              We sent a 6-digit code to <span className="text-foreground">{email}</span>
            </p>

            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-muted-foreground tracking-wide">Verification code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  required
                  maxLength={6}
                  className="bg-secondary border border-border rounded-lg px-3.5 py-2.5 text-[14px] text-foreground text-center tracking-[0.3em] text-lg placeholder:text-muted-foreground/40 outline-none focus:border-muted-foreground/40 transition-colors"
                />
              </div>

              {error && <p className="text-[12px] text-rose-400">{error}</p>}
              {success && <p className="text-[12px] text-emerald-400">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="bg-foreground text-background rounded-lg py-2.5 font-medium text-[14px] hover:opacity-90 disabled:opacity-50 transition-opacity mt-1"
              >
                {loading ? "Verifying..." : "Verify email"}
              </button>
            </form>

            <div className="flex items-center justify-center gap-4 mt-5">
              <button onClick={handleResend} className="text-[12px] text-muted-foreground hover:text-foreground">
                Resend code
              </button>
              <span className="text-muted-foreground/30">·</span>
              <button onClick={() => { setView("login"); setError(""); setSuccess(""); }} className="text-[12px] text-muted-foreground hover:text-foreground">
                Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}