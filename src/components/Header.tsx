import Logo from './Logo';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Header = ({ currentView, onNavigate }: HeaderProps) => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <Logo />
          </button>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => onNavigate('home')}
              className={`btn-ghost ${currentView === 'home' ? 'bg-primary-muted' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('browse')}
              className={`btn-ghost ${currentView === 'browse' ? 'bg-primary-muted' : ''}`}
            >
              Browse Polls
            </button>
            <button 
              onClick={() => onNavigate('create')}
              className="btn-hero text-sm"
            >
              Create Poll
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;