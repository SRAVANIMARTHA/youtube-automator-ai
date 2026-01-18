import { Play } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-xl' },
    lg: { icon: 40, text: 'text-3xl' },
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="gradient-primary rounded-xl p-2 shadow-lg">
          <Play size={sizes[size].icon} className="text-primary-foreground fill-current" />
        </div>
        <div className="absolute -inset-1 gradient-primary rounded-xl opacity-30 blur-lg -z-10" />
      </div>
      {showText && (
        <span className={`font-bold ${sizes[size].text} gradient-text`}>
          AutoYT
        </span>
      )}
    </div>
  );
}
