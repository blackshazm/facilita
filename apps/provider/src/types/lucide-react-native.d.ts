declare module 'lucide-react-native' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';

  export interface IconProps extends SvgProps {
    color?: string;
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    style?: any;
  }

  export type Icon = React.FC<IconProps>;

  export const Wrench: Icon;
  export const Zap: Icon;
  export const Droplet: Icon;
  export const Hammer: Icon;
  export const Paintbrush: Icon;
  export const Check: Icon;
  export const ChevronRight: Icon;
  export const Camera: Icon;
  export const Upload: Icon;
  export const CheckCircle2: Icon;
  export const CheckCircle: Icon;
  export const ShieldCheck: Icon;
  export const FileText: Icon;
  export const MapPin: Icon;
  export const Navigation: Icon;
  export const Sliders: Icon;
  export const Power: Icon;
  export const Wallet: Icon;
  export const Star: Icon;
  export const Clock: Icon;
  export const Briefcase: Icon;
  export const ShieldAlert: Icon;
  export const DollarSign: Icon;
  export const ArrowRight: Icon;
  export const PlusCircle: Icon;
  export const ArrowDownRight: Icon;
  export const ArrowUpRight: Icon;
  export const Building2: Icon;
  export const Building: Icon;
  export const Award: Icon;
  export const TrendingUp: Icon;
  export const Calendar: Icon;
  export const User: Icon;
  export const Phone: Icon;
  export const AlertTriangle: Icon;
  export const Crosshair: Icon;
  export const AlertCircle: Icon;
  export const CheckSquare: Icon;
  export const RotateCcw: Icon;
  export const X: Icon;
  export const WifiOff: Icon;
  export const XCircle: Icon;
  export const ArrowLeft: Icon;
}
