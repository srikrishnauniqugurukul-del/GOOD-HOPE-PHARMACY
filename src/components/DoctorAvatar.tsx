import React, { useEffect, useState } from 'react';

interface DoctorAvatarProps {
  name: string;
  photoUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
}

function getInitials(name: string): string {
  const cleaned = name.replace(/^Dr\.?\s+/i, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Displays a verified administrator-uploaded doctor photograph when supplied,
 * or a clean neutral illustrated medical silhouette placeholder (never fabricated portraits).
 */
export const DoctorAvatar: React.FC<DoctorAvatarProps> = ({ name, photoUrl, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  const dims =
    size === 'lg'
      ? 'w-28 h-28 sm:w-32 sm:h-32'
      : size === 'sm'
      ? 'w-12 h-12'
      : 'w-20 h-20';

  if (photoUrl && !imgError) {
    return (
      <div className={`${dims} rounded-2xl overflow-hidden border border-[#37A879]/25 bg-[#F1F8F3] shrink-0`}>
        <img
          src={photoUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  const initials = getInitials(name);

  return (
    <div
      className={`${dims} rounded-2xl overflow-hidden border border-[#37A879]/20 bg-gradient-to-br from-[#F1F8F3] to-[#E2F2E9] shrink-0 flex items-center justify-center relative`}
      aria-label={`${name} placeholder illustration`}
    >
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        {/* Subtle neutral physician silhouette */}
        <circle cx="40" cy="30" r="14" fill="#172F43" fillOpacity="0.14" />
        <path
          d="M16 72 C18 54 27 47 40 47 C53 47 62 54 64 72"
          fill="#37A879"
          fillOpacity="0.22"
        />
        <path
          d="M32 48 L40 58 L48 48"
          stroke="#172F43"
          strokeOpacity="0.3"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x="40"
          y="34"
          textAnchor="middle"
          fill="#172F43"
          fontFamily="Manrope, sans-serif"
          fontWeight="700"
          fontSize="13"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
};
