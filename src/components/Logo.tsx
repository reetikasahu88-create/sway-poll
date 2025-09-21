// src/components/Logo.tsx
import logo from "@/assets/logo.png";

const Logo = ({ className = "h-full" }: { className?: string }) => {
  return (
    <img src={logo} alt="App logo" className={`${className} object-contain`} />
  );
};

export default Logo;
