import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  LogOut,
  MessageSquare,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["HR", "RECRUITER", "INTERVIEWER"] },
  { to: "/jobs", label: "Jobs", icon: Briefcase, roles: ["HR", "RECRUITER", "INTERVIEWER"] },
  { to: "/candidates", label: "Candidates", icon: Users, roles: ["HR", "RECRUITER", "INTERVIEWER"] },
  { to: "/interviews", label: "Interviews", icon: MessageSquare, roles: ["HR", "RECRUITER", "INTERVIEWER"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["HR", "RECRUITER", "INTERVIEWER"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 w-56 flex-shrink-0 border-r border-border bg-background flex flex-col h-full
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-5 py-5 flex items-center justify-between">
          <span className="text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            RECRU·AI
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 px-3">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all duration-150
                ${isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`
              }
            >
              <item.icon size={16} strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <div className="text-[13px] text-foreground truncate">{user?.name}</div>
            <div className="text-[11px] text-muted-foreground">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-[12px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            RECRU·AI
          </span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
