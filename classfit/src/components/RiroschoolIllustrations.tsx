import React from 'react';

/**
 * Custom SVG illustrations replicating the exact school building
 * and notepad illustrations seen in the Jungsan Riroschool portal (Image 1).
 */

export const SchoolBuildingIllustration: React.FC<{ className?: string }> = ({ className = 'w-36 h-28' }) => {
  return (
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Ground line */}
      <path d="M10 112H150" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Main Center Building */}
      <rect x="52" y="58" width="56" height="54" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" strokeLinejoin="round" />
      
      {/* Clock Tower / Triangular Roof */}
      <polygon points="80,18 56,42 104,42" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="66" y="42" width="28" height="16" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
      
      {/* Clock */}
      <circle cx="80" cy="32" r="6" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
      <path d="M80 29V32H83" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

      {/* Left Wing */}
      <rect x="22" y="74" width="30" height="38" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Right Wing */}
      <rect x="108" y="74" width="30" height="38" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Center Windows */}
      <rect x="60" y="66" width="10" height="10" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />
      <rect x="75" y="66" width="10" height="10" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />
      <rect x="90" y="66" width="10" height="10" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />

      {/* Left Wing Windows */}
      <rect x="28" y="82" width="8" height="8" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />
      <rect x="39" y="82" width="8" height="8" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />
      <rect x="28" y="96" width="8" height="8" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />
      <rect x="39" y="96" width="8" height="8" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />

      {/* Right Wing Windows */}
      <rect x="113" y="82" width="8" height="8" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />
      <rect x="124" y="82" width="8" height="8" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />
      <rect x="113" y="96" width="8" height="8" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />
      <rect x="124" y="96" width="8" height="8" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />

      {/* Center Entrance Door */}
      <path d="M72 112V92C72 90 74 88 76 88H84C86 88 88 90 88 92V112" fill="#E2E8F0" stroke="#334155" strokeWidth="2" />
      
      {/* Little roof flag */}
      <path d="M80 18V8" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      <polygon points="80,9 90,12 80,15" fill="#EF4444" />
    </svg>
  );
};

export const NotepadIllustration: React.FC<{ className?: string }> = ({ className = 'w-36 h-28' }) => {
  return (
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Notepad shadow/tilt */}
      <g transform="rotate(-6 75 60)">
        {/* Back page */}
        <rect x="42" y="16" width="62" height="82" rx="4" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
        {/* Front page */}
        <rect x="38" y="20" width="62" height="82" rx="4" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
        
        {/* Blue spiral ring holes on left */}
        <circle cx="44" cy="28" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        <circle cx="44" cy="38" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        <circle cx="44" cy="48" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        <circle cx="44" cy="58" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        <circle cx="44" cy="68" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        <circle cx="44" cy="78" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        <circle cx="44" cy="88" r="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />

        {/* Note lines */}
        <line x1="52" y1="34" x2="90" y2="34" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="44" x2="92" y2="44" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="54" x2="88" y2="54" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="64" x2="90" y2="64" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="74" x2="82" y2="74" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

        {/* Little Post-it / Sticky Note in coral */}
        <rect x="66" y="70" width="22" height="18" rx="2" fill="#FCA5A5" stroke="#E11D48" strokeWidth="1.5" />
        <line x1="70" y1="76" x2="84" y2="76" stroke="#9F1239" strokeWidth="1" />
        <line x1="70" y1="81" x2="80" y2="81" stroke="#9F1239" strokeWidth="1" />

        {/* Paper clip */}
        <path d="M56 16V26C56 28 58 30 60 30C62 30 64 28 64 26V18" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      {/* Pencil leaning on the right */}
      <g transform="translate(108, 48) rotate(35)">
        {/* Pencil body */}
        <rect x="0" y="0" width="8" height="42" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
        {/* Wood cone tip */}
        <polygon points="0,42 8,42 4,52" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
        {/* Graphite lead tip */}
        <polygon points="2,47 6,47 4,52" fill="#334155" />
        {/* Eraser and ferrule */}
        <rect x="0" y="-8" width="8" height="6" fill="#F472B6" stroke="#DB2777" strokeWidth="1" rx="1" />
        <rect x="0" y="-2" width="8" height="2" fill="#94A3B8" stroke="#64748B" strokeWidth="0.5" />
      </g>
    </svg>
  );
};
