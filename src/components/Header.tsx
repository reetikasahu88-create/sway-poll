import { useEffect, useState } from "react";
import Logo from "./Logo";
import SignupDialog from "./SignupDialog";
import LoginDialog from "./LoginDialog";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Header = ({ currentView, onNavigate }: HeaderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("authToken"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    onNavigate("home");
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <Logo className="h-14" /> {/* ⬅️ slightly bigger than before */}
          </button>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate("home")}
              className={`btn-ghost ${
                currentView === "home" ? "bg-primary-muted" : ""
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("browse")}
              className={`btn-ghost ${
                currentView === "browse" ? "bg-primary-muted" : ""
              }`}
            >
              Browse Polls
            </button>

            {isLoggedIn ? (
              <>
                <button
                  onClick={() => onNavigate("create")}
                  className="btn-hero text-sm"
                >
                  Create Poll
                </button>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowSignup(true)}
                  className="btn-ghost text-sm"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="btn-hero text-sm"
                >
                  Login
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Overlays */}
      <SignupDialog
        open={showSignup}
        onOpenChange={setShowSignup}
        onSignupSuccess={() => {
          setShowSignup(false);
        }}
      />
      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setShowLogin(false);
        }}
      />
    </header>
  );
};

export default Header;
