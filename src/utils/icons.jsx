import { Type, Image as ImageIcon, Code, Calculator, QrCode, Search, Hash, CaseSensitive, ArrowUpAZ, ArrowDownAZ, Eraser, Undo2, ListX, Link, AlignLeft, Minimize2, FileImage, Scaling, Crop, RotateCw, Binary, Palette, Braces, ShieldCheck, FileCode, Shrink, Lock, Unlock, Link2, Percent, Cake, HeartPulse, Tag, TrendingUp, Landmark, Receipt, CalendarDays, ScanLine, Files, Scissors, FileText, Tags, ScanSearch, Bot, Map as MapIcon, Youtube, Instagram, Wrench } from 'lucide-react';
// Only icons named in the data files are bundled; unknown names fall back to Wrench.
const icons = { Type, Image: ImageIcon, Code, Calculator, QrCode, Search, Hash, CaseSensitive, ArrowUpAZ, ArrowDownAZ, Eraser, Undo2, ListX, Link, AlignLeft, Minimize2, FileImage, Scaling, Crop, RotateCw, Binary, Palette, Braces, ShieldCheck, FileCode, Shrink, Lock, Unlock, Link2, Percent, Cake, HeartPulse, Tag, TrendingUp, Landmark, Receipt, CalendarDays, ScanLine, Files, Scissors, FileText, Tags, ScanSearch, Bot, Map: MapIcon, Youtube, Instagram, Wrench };
export function Icon({ name, size = 22, ...rest }) {
  const C = icons[name] || Wrench;
  return <C size={size} aria-hidden="true" {...rest} />;
}
