
// This file can be used for custom SVG icons or re-exporting lucide-react icons
// For now, we'll mostly rely on lucide-react directly in components.

// Example of a custom SVG icon component:
/*
export const MyCustomIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2 L2 7 L12 12 L22 7 Z" />
    <path d="M2 17 L12 22 L22 17" />
    <path d="M2 12 L12 17 L22 12" />
  </svg>
);
*/

// Re-exporting commonly used icons from lucide-react can also be done here for consistency
// Brain icon removed as it's no longer used.
export { MapPin, Route, AlertTriangle, SlidersHorizontal, Sigma, MapPinned } from 'lucide-react';
