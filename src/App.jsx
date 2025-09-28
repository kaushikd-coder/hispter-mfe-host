import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import RemoteLoader from "./RemoteLoader";
import ErrorBoundary from "./ErrorBoundary";
import Home from "./routes/Home";

/* -------------------- utils -------------------- */
const cx = (...c) => c.filter(Boolean).join(" ");
const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/* -------------------- guards & bridges -------------------- */
function Protected({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AuthEventsBridge({ setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    const onLogin = (e) => {
      const user = e.detail;
      setUser(user);
      localStorage.setItem("authUser", JSON.stringify(user));
      navigate("/", { replace: true });
    };
    const onLogout = () => {
      setUser(null);
      localStorage.removeItem("authUser");
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:login", onLogin);
    window.addEventListener("auth:logout", onLogout);
    return () => {
      window.removeEventListener("auth:login", onLogin);
      window.removeEventListener("auth:logout", onLogout);
    };
  }, [navigate, setUser]);

  return null;
}

/* -------------------- header -------------------- */

function AppHeader({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const avatar = useMemo(() => initials(user?.name || ""), [user]);

  // close menu on route change
  useEffect(() => setOpen(false), [location.pathname]);

  // close with Esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleLogout = () => {
    window.dispatchEvent(new CustomEvent("auth:logout"));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#062f2e]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="group inline-flex items-center gap-2 rounded-xl px-2 py-1"
          title="Home"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-400/40 transition group-hover:bg-emerald-500/30">
            <span className="text-sm font-bold text-emerald-300">H</span>
          </div>
          <div className="text-sm font-semibold tracking-wide text-emerald-200">
            Host
          </div>
        </button>

        {/* Nav always visible */}
        <nav className="ml-2 flex gap-1">
          {[
            { to: "/", label: "Home", end: true },
            { to: "/booking", label: "Booking" },
            { to: "/report-dashboard", label: "ReportDashboard" },
            { to: "/profile", label: "Profile" },
          ].map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={Boolean(l.end)}
              className={({ isActive }) =>
                cx(
                  "rounded-lg px-3 py-1.5 text-sm transition",
                  isActive
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-emerald-100 hover:bg-white/5 hover:text-white"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <div className="text-xs text-emerald-100/80">
                  Signed in as{" "}
                  <span className="font-medium text-white">{user.name}</span>{" "}
                  <span className="text-emerald-300">({user.role})</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white ring-1 ring-white/20">
                  {avatar || "U"}
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="text-xs text-emerald-100/80">Not signed in</div>
          )}
        </div>
      </div>
    </header>

  );
}



/* -------------------- layout (header hidden on /login) -------------------- */
function Layout({ user, children }) {
  const location = useLocation();
  const hideHeader = location.pathname === "/login" && !user;

  return (
    <div className="min-h-screen bg-[#003d3b] text-white">
      {/* gradient halo */}
      <div className="pointer-events-none absolute inset-x-0 top-[-10rem] z-0 mx-auto h-[24rem] max-w-4xl rounded-full bg-emerald-500/20 blur-3xl"></div>

      {!hideHeader && <AppHeader user={user} />}

      <main
        className={cx("relative z-10", hideHeader ? "" : "px-4 py-6 sm:px-6")}
      >
        <div className={hideHeader ? "" : "mx-auto max-w-7xl"}>{children}</div>
      </main>
    </div>
  );
}



/* -------------------- app -------------------- */
export default function App() {
  const [user, setUser] = useState(null);

  // restore persisted user
  useEffect(() => {
    const stored = localStorage.getItem("authUser");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("authUser");
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthEventsBridge setUser={setUser} />
      <Layout user={user}>
        <Routes>
          {/* Home (protected) */}
          <Route
            path="/"
            element={
              <Protected user={user}>
                <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
                  <Home />
                </div>
              </Protected>
            }
          />

          {/* NEW: Booking - List */}
          {/* Booking */}
          <Route
            path="/booking"
            element={
              <Protected user={user}>

                <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
                  <ErrorBoundary message="Booking module is currently unavailable.">
                    <RemoteLoader
                      scope="bookingApp"
                      module="./UserBooking"
                      fallback={
                        <div className="text-emerald-100/80">
                          Loading profile…
                        </div>
                      }
                      render={({ Component }) => <Component user={user} />}
                    />
                  </ErrorBoundary>
                </div>

              </Protected>
            }
          />

          {/* NEW: Booking - Create Form */}
          <Route
            path="/report-dashboard"
            element={
              <Protected user={user}>
                <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
                  <ErrorBoundary message="Booking module is currently unavailable.">
                    <RemoteLoader
                      scope="reportingApp"
                      module="./ReportDashboard"
                      fallback={
                        <div className="text-emerald-100/80">
                          Loading booking form…
                        </div>
                      }
                    // Example of injecting props if the remote accepts them:
                    // render={({ Component }) => <Component user={user} mode="create" />}
                    />
                  </ErrorBoundary>
                </div>
              </Protected>
            }
          />

          {/* Login (no header, full-bleed) */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <ErrorBoundary message="Auth module is currently unavailable.">
                  <RemoteLoader
                    scope="authApp"
                    module="./Login"
                    fallback={
                      <div className="p-8 text-sm text-emerald-100/80">
                        Loading login…
                      </div>
                    }
                  />
                </ErrorBoundary>
              )
            }
          />

          {/* Profile (protected) */}
          <Route
            path="/profile"
            element={
              <Protected user={user}>
                <div className="h-full">
                  <ErrorBoundary message="Auth module is currently unavailable.">
                    <RemoteLoader
                      scope="authApp"
                      module="./UserProfile"
                      fallback={
                        <div className="text-emerald-100/80">
                          Loading profile…
                        </div>
                      }
                      render={({ Component }) => <Component user={user} />}
                    />
                  </ErrorBoundary>
                </div>
              </Protected>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
