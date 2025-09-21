import { BarChart3, Users, Zap, Shield } from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

const HomePage = ({ onNavigate }: HomePageProps) => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Create Polls That
              <span className="block text-gradient bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                Matter
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Build beautiful polls, gather real-time insights, and make decisions with confidence. 
              Simple, fast, and designed for modern teams.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={() => onNavigate('create')}
                className="btn-hero text-lg shadow-glow"
              >
                <Zap className="w-5 h-5 mr-2" />
                Create Poll
              </button>
              <button 
                onClick={() => onNavigate('browse')}
                className="btn-secondary text-lg border-white text-white hover:bg-white hover:text-black"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Browse Polls
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-red-400 rounded-full animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-poller-black">
              Why Choose Poller?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, share, and analyze polls with professional results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="poll-card text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-primary-muted p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-poller-black">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-hover">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Create your first poll in under 30 seconds. No registration required.
          </p>
          <button 
            onClick={() => onNavigate('create')}
            className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 text-lg shadow-lg"
          >
            Start Polling Now
          </button>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Create polls in seconds with our intuitive interface"
  },
  {
    icon: BarChart3,
    title: "Real-time Results",
    description: "Watch votes come in live with beautiful visualizations"
  },
  {
    icon: Users,
    title: "Easy Sharing",
    description: "Share polls instantly with anyone, anywhere"
  },
  {
    icon: Shield,
    title: "Secure Voting",
    description: "Prevent duplicate votes and ensure data integrity"
  }
];

export default HomePage;