import React from 'react';
import Svg, { Path, G, Circle, Rect, Line } from 'react-native-svg';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.5 }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const icons: Record<string, React.ReactNode> = {
    home: <Path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2z" />,
    chart: <G><Path d="M4 19V5" /><Path d="M10 19V10" /><Path d="M16 19V8" /><Path d="M22 19V12" /></G>,
    calendar: <G><Rect x={3} y={5} width={18} height={16} rx={2} /><Path d="M3 9h18" /><Path d="M8 3v4" /><Path d="M16 3v4" /></G>,
    profile: <G><Circle cx={12} cy={8} r={4} /><Path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></G>,
    book: <G><Path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4z" /><Path d="M20 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8z" /></G>,
    users: <G><Circle cx={9} cy={8} r={4} /><Path d="M2 21c0-3.5 3.5-6 7-6s7 2.5 7 6" /><Path d="M17 5a4 4 0 010 8" /><Path d="M22 21c0-3-2-5.5-5-6" /></G>,
    check: <Path d="M5 12l5 5L20 7" />,
    x: <G><Path d="M6 6l12 12" /><Path d="M6 18L18 6" /></G>,
    chevronRight: <Path d="M9 6l6 6-6 6" />,
    chevronLeft: <Path d="M15 6l-6 6 6 6" />,
    chevronDown: <Path d="M6 9l6 6 6-6" />,
    clock: <G><Circle cx={12} cy={12} r={9} /><Path d="M12 7v5l3 2" /></G>,
    pin: <G><Path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" /><Circle cx={12} cy={9} r={3} /></G>,
    star: <Path d="M12 2l2.6 6.4 6.9.5-5.3 4.5L17.8 21 12 17.3 6.2 21l1.6-7.6L2.5 8.9l6.9-.5z" />,
    edit: <Path d="M14 4l6 6L8 22H2v-6L14 4z" />,
    plus: <G><Path d="M12 5v14" /><Path d="M5 12h14" /></G>,
    minus: <Path d="M5 12h14" />,
    search: <G><Circle cx={11} cy={11} r={6} /><Path d="M20 20l-4-4" /></G>,
    info: <G><Circle cx={12} cy={12} r={9} /><Path d="M12 8v.01" /><Path d="M11 12h1v5h1" /></G>,
    warn: <G><Path d="M12 3l10 18H2L12 3z" /><Path d="M12 10v5" /><Path d="M12 18v.01" /></G>,
    trophy: <G><Path d="M8 21h8" /><Path d="M12 17v4" /><Path d="M7 4h10v4a5 5 0 01-10 0z" /><Path d="M7 4H4v2a3 3 0 003 3" /><Path d="M17 4h3v2a3 3 0 01-3 3" /></G>,
    document: <G><Path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" /><Path d="M14 3v6h6" /><Path d="M8 13h8" /><Path d="M8 17h5" /></G>,
    creditCard: <G><Rect x={3} y={6} width={18} height={13} rx={2} /><Path d="M3 10h18" /></G>,
    share: <G><Circle cx={6} cy={12} r={3} /><Circle cx={18} cy={6} r={3} /><Circle cx={18} cy={18} r={3} /><Path d="M8.5 10.5l7-3" /><Path d="M8.5 13.5l7 3" /></G>,
    mail: <G><Rect x={3} y={5} width={18} height={14} rx={2} /><Path d="M3.5 7l8.5 6 8.5-6" /></G>,
    phone: <Path d="M7 3h3l2 5-2.5 1.5a10 10 0 005 5L16 12l5 2v3a2 2 0 01-2.2 2A16 16 0 015 5.2 2 2 0 017 3z" />,
    copy: <G><Rect x={9} y={9} width={11} height={11} rx={2} /><Path d="M5 15V5a2 2 0 012-2h10" /></G>,
    trash: <G><Path d="M4 7h16" /><Path d="M9 7V4h6v3" /><Path d="M6 7l1 13h10l1-13" /><Path d="M10 11v6" /><Path d="M14 11v6" /></G>,
    flag: <Path d="M5 21V4h12l-2 4 2 4H5" />,
    arrowRight: <G><Path d="M12 19l7-7-7-7" /><Path d="M5 12h14" /></G>,
    arrowUp: <G><Path d="M12 19V5" /><Path d="M5 12l7-7 7 7" /></G>,
    arrowDown: <G><Path d="M12 5v14" /><Path d="M5 12l7 7 7-7" /></G>,
    settings: <G><Circle cx={12} cy={12} r={3} /></G>,
    qr: <G><Rect x={3} y={3} width={7} height={7} /><Rect x={14} y={3} width={7} height={7} /><Rect x={3} y={14} width={7} height={7} /><Path d="M14 14h2v2h-2z" /><Path d="M18 14h3" /><Path d="M14 18v3" /><Path d="M18 18h3v3" /></G>,
    sparkle: <G><Path d="M12 2v6" /><Path d="M12 16v6" /><Path d="M2 12h6" /><Path d="M16 12h6" /></G>,
  };

  return (
    <Svg {...props}>
      {icons[name] || <Circle cx={12} cy={12} r={8} />}
    </Svg>
  );
}
