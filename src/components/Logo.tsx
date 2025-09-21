import polarBearLogo from '@/assets/polar-bear-logo.png';

const Logo = ({ className = "h-8" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Colorful bars */}
      <div className="flex items-end gap-1">
        <div className="w-1.5 h-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-full"></div>
        <div className="w-1.5 h-7 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-full"></div>
        <div className="w-1.5 h-5 bg-gradient-to-t from-red-500 to-red-400 rounded-full"></div>
      </div>
      
      {/* Poller text */}
      <span className="text-2xl font-bold text-poller-black">Poller</span>
      
      {/* Polar bear */}
      <img 
        src={polarBearLogo} 
        alt="Polar bear logo" 
        className="w-8 h-8 object-contain"
      />
    </div>
  );
};

export default Logo;