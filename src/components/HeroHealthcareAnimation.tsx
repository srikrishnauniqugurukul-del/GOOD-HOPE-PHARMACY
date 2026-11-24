import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { GoodHopeLogo } from './GoodHopeLogo';

interface HeroHealthcareAnimationProps {
  logoUrl?: string | null;
  sceneLabels: [string, string, string, string];
  staticToggleOn: string;
  staticToggleOff: string;
  animationEnabled?: boolean;
}

export const HeroHealthcareAnimation: React.FC<HeroHealthcareAnimationProps> = ({
  logoUrl,
  sceneLabels,
  staticToggleOn,
  staticToggleOff,
  animationEnabled = true,
}) => {
  const prefersReduced = useReducedMotion();
  const [staticMode, setStaticMode] = useState(Boolean(prefersReduced || !animationEnabled));
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    if (prefersReduced || !animationEnabled) {
      setStaticMode(true);
    }
  }, [prefersReduced, animationEnabled]);

  useEffect(() => {
    if (staticMode) return;
    const timer = window.setInterval(() => {
      setActiveScene((prev) => (prev + 1) % 4);
    }, 4600);
    return () => window.clearInterval(timer);
  }, [staticMode]);

  return (
    <div className="relative w-full h-full min-h-[380px] lg:min-h-[450px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#F1F8F3] via-[#FFFFFF] to-[#E6F4EC] border border-[#37A879]/20 shadow-[0_24px_60px_-28px_rgba(23,47,67,0.18)] flex flex-col justify-between p-5 sm:p-7">
      {/* Decorative subtle ECG waveform background */}
      <svg
        viewBox="0 0 600 80"
        className="pointer-events-none absolute top-4 left-0 w-full h-16 opacity-30"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0 44 H120 L142 44 L154 20 L166 64 L180 12 L194 56 L206 44 H350 L370 44 L382 24 L394 58 L408 18 L420 50 L432 44 H600"
          stroke="#37A879"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={staticMode ? '' : 'gh-ecg-line'}
        />
      </svg>

      {/* Floating subtle healthcare motifs */}
      <div className="pointer-events-none absolute right-6 top-6 opacity-20">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <rect x="14" y="4" width="8" height="28" rx="3" fill="#37A879" />
          <rect x="4" y="14" width="28" height="8" rx="3" fill="#37A879" />
        </svg>
      </div>

      {/* Top bar inside stage */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-[#172F43]/75 tracking-wide">
          <span>0{activeScene + 1} / 04</span>
          <span className="mx-2 text-[#37A879]">·</span>
          <span className="text-[#172F43] font-semibold">{sceneLabels[activeScene]}</span>
        </div>
        <button
          type="button"
          onClick={() => setStaticMode((s) => !s)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#172F43]/75 hover:text-[#172F43] px-2.5 py-1.5 rounded-lg bg-white/80 border border-[#172F43]/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          aria-pressed={staticMode}
        >
          {staticMode ? <Play className="w-3.5 h-3.5 text-[#37A879]" /> : <Pause className="w-3.5 h-3.5 text-[#37A879]" />}
          <span>{staticMode ? staticToggleOn : staticToggleOff}</span>
        </button>
      </div>

      {/* Central Illustrated 3D-Depth Stage */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-4">
        <AnimatePresence mode="wait">
          {activeScene === 0 && (
            <motion.div
              key="scene-consultation"
              initial={staticMode ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={staticMode ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[440px]"
            >
              {/* Scene 1: Friendly Doctor in White Coat & Stethoscope consulting seated patient */}
              <svg viewBox="0 0 440 270" className="w-full h-auto drop-shadow-sm" role="img" aria-label="Doctor consulting with a seated patient in a modern room">
                <defs>
                  <linearGradient id="roomWall" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E9F6EE" />
                  </linearGradient>
                  <linearGradient id="deskTop" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#172F43" />
                    <stop offset="100%" stopColor="#264966" />
                  </linearGradient>
                </defs>
                {/* Modern consultation room backdrop */}
                <rect x="16" y="18" width="408" height="234" rx="22" fill="url(#roomWall)" stroke="#37A879" strokeOpacity="0.18" />
                {/* Window with soft hill light */}
                <rect x="44" y="38" width="104" height="74" rx="12" fill="#DDF2E6" />
                <path d="M44 96 Q78 72 110 86 T148 82 V112 H44 Z" fill="#B9D36A" opacity="0.45" />
                <circle cx="122" cy="58" r="10" fill="#FFFFFF" opacity="0.85" />
                {/* Wall medical board */}
                <rect x="296" y="42" width="96" height="60" rx="10" fill="#FFFFFF" stroke="#172F43" strokeOpacity="0.1" />
                <rect x="339" y="54" width="10" height="24" rx="2" fill="#D83B48" />
                <rect x="332" y="61" width="24" height="10" rx="2" fill="#D83B48" />
                <rect x="314" y="86" width="60" height="5" rx="2.5" fill="#37A879" opacity="0.5" />

                {/* Doctor Figure (Left) */}
                <g className={staticMode ? '' : 'gh-float'}>
                  {/* Chair */}
                  <rect x="82" y="148" width="54" height="66" rx="12" fill="#D6EAE0" />
                  {/* White Coat Torso */}
                  <path d="M84 188 C84 156 102 142 126 142 C150 142 168 156 168 188 V212 H84 Z" fill="#FFFFFF" stroke="#172F43" strokeOpacity="0.14" strokeWidth="1.5" />
                  {/* Green Shirt inside coat */}
                  <path d="M116 143 L126 172 L136 143 Z" fill="#37A879" />
                  {/* Stethoscope */}
                  <path d="M110 148 C108 168 118 178 126 178 C134 178 144 168 142 148" stroke="#172F43" strokeWidth="3.2" fill="none" strokeLinecap="round" />
                  <circle cx="142" cy="182" r="5" fill="#172F43" />
                  <circle cx="142" cy="182" r="2.2" fill="#B9D36A" />
                  {/* Doctor Head */}
                  <circle cx="126" cy="116" r="21" fill="#F2C6A0" />
                  <path d="M105 112 C106 95 144 93 147 112 C142 104 112 104 105 112 Z" fill="#172F43" />
                  {/* Friendly smile */}
                  <path d="M119 122 Q126 127 133 122" stroke="#172F43" strokeWidth="2" strokeLinecap="round" fill="none" />
                  {/* Gesture arm */}
                  <path d="M156 172 L192 166" stroke="#FFFFFF" strokeWidth="13" strokeLinecap="round" />
                  <circle cx="196" cy="165" r="6" fill="#F2C6A0" />
                </g>

                {/* Consultation Desk */}
                <rect x="172" y="176" width="112" height="12" rx="6" fill="url(#deskTop)" />
                <rect x="186" y="188" width="10" height="48" rx="4" fill="#172F43" opacity="0.85" />
                <rect x="260" y="188" width="10" height="48" rx="4" fill="#172F43" opacity="0.85" />
                {/* Clipboard on desk */}
                <rect x="206" y="164" width="36" height="12" rx="3" fill="#37A879" />

                {/* Seated Patient Figure (Right) */}
                <g>
                  <rect x="298" y="152" width="52" height="64" rx="12" fill="#E3ECEF" />
                  <path d="M276 192 C276 162 292 148 314 148 C336 148 352 162 352 192 V216 H276 Z" fill="#37A879" />
                  <circle cx="314" cy="122" r="20" fill="#EBB892" />
                  <path d="M294 119 C296 100 333 100 334 119 C326 110 302 110 294 119 Z" fill="#23394D" />
                  <path d="M308 128 Q314 132 320 128" stroke="#172F43" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </g>

                {/* Floor shadow */}
                <ellipse cx="220" cy="238" rx="164" ry="8" fill="#172F43" opacity="0.08" />
              </svg>
            </motion.div>
          )}

          {activeScene === 1 && (
            <motion.div
              key="scene-pharmacy-counter"
              initial={staticMode ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={staticMode ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[440px]"
            >
              {/* Scene 2: Friendly Pharmacist assisting a customer at Good Hope Pharmacy counter */}
              <svg viewBox="0 0 440 270" className="w-full h-auto drop-shadow-sm" role="img" aria-label="Friendly pharmacist assisting a visitor at Good Hope Pharmacy counter">
                <rect x="16" y="18" width="408" height="234" rx="22" fill="#FFFFFF" stroke="#37A879" strokeOpacity="0.2" />
                {/* Pharmacy shelves in background */}
                <rect x="40" y="42" width="176" height="86" rx="12" fill="#F1F8F3" />
                <line x1="52" y1="70" x2="204" y2="70" stroke="#37A879" strokeOpacity="0.3" strokeWidth="2" />
                <line x1="52" y1="98" x2="204" y2="98" stroke="#37A879" strokeOpacity="0.3" strokeWidth="2" />
                {/* Stylized neat pharmacy boxes */}
                <rect x="58" y="54" width="22" height="14" rx="3" fill="#37A879" opacity="0.7" />
                <rect x="86" y="50" width="18" height="18" rx="3" fill="#B9D36A" />
                <rect x="110" y="54" width="26" height="14" rx="3" fill="#172F43" opacity="0.75" />
                <rect x="142" y="52" width="20" height="16" rx="3" fill="#37A879" opacity="0.5" />
                <rect x="168" y="55" width="24" height="13" rx="3" fill="#D83B48" opacity="0.75" />
                <rect x="64" y="80" width="24" height="16" rx="3" fill="#172F43" opacity="0.65" />
                <rect x="96" y="82" width="20" height="14" rx="3" fill="#37A879" opacity="0.8" />
                <rect x="124" y="78" width="28" height="18" rx="3" fill="#B9D36A" opacity="0.9" />
                <rect x="160" y="82" width="28" height="14" rx="3" fill="#37A879" opacity="0.6" />

                {/* Pharmacist behind counter */}
                <g className={staticMode ? '' : 'gh-float'}>
                  <path d="M104 176 C104 146 122 134 146 134 C170 134 188 146 188 176 V186 H104 Z" fill="#FFFFFF" stroke="#37A879" strokeWidth="2" />
                  <rect x="140" y="138" width="12" height="26" rx="4" fill="#37A879" />
                  <circle cx="146" cy="110" r="20" fill="#F2C6A0" />
                  <path d="M126 107 C127 90 165 90 166 107 C158 98 134 98 126 107 Z" fill="#172F43" />
                  <path d="M140 116 Q146 121 152 116" stroke="#172F43" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>

                {/* Pharmacy Counter */}
                <rect x="44" y="176" width="212" height="60" rx="12" fill="#172F43" />
                <rect x="44" y="176" width="212" height="12" rx="6" fill="#37A879" />
                <text x="150" y="213" textAnchor="middle" fill="#FFFFFF" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="13" letterSpacing="1.6">
                  GOOD HOPE COUNTER
                </text>

                {/* Customer at counter (Right) */}
                <g>
                  <path d="M292 184 C292 152 308 138 332 138 C356 138 372 152 372 184 V234 H292 Z" fill="#37A879" opacity="0.9" />
                  <circle cx="332" cy="112" r="20" fill="#EBB892" />
                  <path d="M312 110 C313 91 350 91 352 110 C343 101 320 101 312 110 Z" fill="#172F43" />
                  <path d="M326 118 Q332 122 338 118" stroke="#172F43" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  {/* Extended arm towards counter */}
                  <path d="M298 164 L256 168" stroke="#37A879" strokeWidth="12" strokeLinecap="round" />
                  <circle cx="252" cy="168" r="6" fill="#EBB892" />
                </g>

                {/* Information Card on Counter */}
                <rect x="208" y="160" width="34" height="16" rx="4" fill="#FFFFFF" stroke="#37A879" strokeWidth="1.5" />
                <line x1="214" y1="166" x2="236" y2="166" stroke="#172F43" strokeWidth="1.5" />
                <line x1="214" y1="171" x2="229" y2="171" stroke="#37A879" strokeWidth="1.5" />
              </svg>
            </motion.div>
          )}

          {activeScene === 2 && (
            <motion.div
              key="scene-bag-handover"
              initial={staticMode ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={staticMode ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[440px]"
            >
              {/* Scene 3: Patient receives a sealed pharmacy bag & healthcare information card */}
              <svg viewBox="0 0 440 270" className="w-full h-auto drop-shadow-sm" role="img" aria-label="Patient receiving a sealed pharmacy bag and healthcare guidance card">
                <rect x="16" y="18" width="408" height="234" rx="22" fill="#F9FCFA" stroke="#37A879" strokeOpacity="0.2" />

                {/* Soft glowing halo */}
                <circle cx="220" cy="134" r="78" fill="#37A879" opacity="0.09" />
                <circle cx="220" cy="134" r="56" fill="#B9D36A" opacity="0.14" />

                {/* Sealed Pharmacy Bag */}
                <g className={staticMode ? '' : 'gh-float'}>
                  {/* Bag handle */}
                  <path d="M188 86 C188 64 252 64 252 86" stroke="#172F43" strokeWidth="5" strokeLinecap="round" fill="none" />
                  {/* Bag body */}
                  <rect x="162" y="84" width="116" height="126" rx="14" fill="#FFFFFF" stroke="#37A879" strokeWidth="2.5" />
                  {/* Top green seal strip */}
                  <rect x="162" y="84" width="116" height="22" rx="10" fill="#37A879" />
                  <text x="220" y="99" textAnchor="middle" fill="#FFFFFF" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="9.5" letterSpacing="1.3">
                    SEALED CARE PACK
                  </text>
                  {/* Red medical cross on bag */}
                  <rect x="214" y="120" width="12" height="30" rx="2.5" fill="#D83B48" />
                  <rect x="205" y="129" width="30" height="12" rx="2.5" fill="#D83B48" />
                  {/* Brand line */}
                  <text x="220" y="172" textAnchor="middle" fill="#37A879" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="13">
                    GOOD <tspan fill="#172F43">HOPE</tspan>
                  </text>
                  <text x="220" y="188" textAnchor="middle" fill="#172F43" opacity="0.6" fontFamily="DM Sans, sans-serif" fontSize="8.5">
                    KALIMPONG
                  </text>
                </g>

                {/* Care Information Card floating cleanly on right */}
                <g>
                  <rect x="294" y="96" width="98" height="86" rx="12" fill="#FFFFFF" stroke="#172F43" strokeOpacity="0.12" />
                  <rect x="306" y="110" width="44" height="6" rx="3" fill="#37A879" />
                  <rect x="306" y="124" width="72" height="5" rx="2.5" fill="#172F43" opacity="0.2" />
                  <rect x="306" y="135" width="64" height="5" rx="2.5" fill="#172F43" opacity="0.2" />
                  <rect x="306" y="146" width="54" height="5" rx="2.5" fill="#172F43" opacity="0.2" />
                  <rect x="306" y="160" width="48" height="10" rx="5" fill="#F1F8F3" />
                  <text x="330" y="167.5" textAnchor="middle" fill="#37A879" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="7">
                    CARE INFO
                  </text>
                </g>

                {/* Trust shield on left */}
                <g>
                  <rect x="48" y="108" width="94" height="64" rx="12" fill="#FFFFFF" stroke="#37A879" strokeOpacity="0.22" />
                  <circle cx="72" cy="140" r="14" fill="#F1F8F3" />
                  <path d="M66 140 L70.5 144.5 L79 135.5" stroke="#37A879" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <rect x="94" y="131" width="38" height="6" rx="3" fill="#172F43" opacity="0.75" />
                  <rect x="94" y="143" width="28" height="5" rx="2.5" fill="#37A879" opacity="0.6" />
                </g>
              </svg>
            </motion.div>
          )}

          {activeScene === 3 && (
            <motion.div
              key="scene-logo-reveal"
              initial={staticMode ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={staticMode ? undefined : { opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center py-4"
            >
              <div className={`relative p-4 rounded-full bg-white shadow-[0_20px_50px_-15px_rgba(55,168,121,0.32)] border border-[#37A879]/25 ${staticMode ? '' : 'gh-float'}`}>
                <GoodHopeLogo logoUrl={logoUrl} size={148} />
              </div>
              <p className="mt-5 font-display text-lg font-extrabold tracking-tight text-[#172F43]">
                GOOD HOPE PHARMACY
              </p>
              <p className="mt-1 text-sm text-[#172F43]/70">
                KD Pradhan Road · Kalimpong Bazar
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Scene Selector Bar */}
      <div className="relative z-10 grid grid-cols-4 gap-2 pt-3 border-t border-[#172F43]/8">
        {sceneLabels.map((label, idx) => {
          const isCurrent = idx === activeScene;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActiveScene(idx)}
              className={`text-left px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-[#172F43] text-white'
                  : 'bg-white/75 text-[#172F43]/75 hover:bg-white hover:text-[#172F43]'
              }`}
            >
              <div className={`text-[11px] font-mono-tabular ${isCurrent ? 'text-[#B9D36A]' : 'text-[#37A879]'}`}>
                0{idx + 1}
              </div>
              <div className="text-xs font-medium truncate mt-0.5">{label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
