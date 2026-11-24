import React from 'react';

interface GoodHopeLogoProps {
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

/**
 * Clean vector circular GOOD HOPE PHARMACY logo faithfully modeled after
 * the client's illuminated circular signboard (Red Cross + #37A879 GOOD + #172F43 HOPE).
 * Automatically displays an admin-uploaded custom logo image when configured.
 */
export const GoodHopeLogo: React.FC<GoodHopeLogoProps> = ({
  logoUrl,
  size = 48,
  className = '',
}) => {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Good Hope Pharmacy Logo"
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover border border-[#37A879]/30 bg-white ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Good Hope Pharmacy Circular Logo"
      className={className}
    >
      {/* Crisp white circular signboard with Good Hope green outer ring */}
      <circle cx="60" cy="60" r="57" fill="#FFFFFF" stroke="#37A879" strokeWidth="4.5" />
      <circle cx="60" cy="60" r="52.5" fill="none" stroke="#B9D36A" strokeWidth="1.2" opacity="0.7" />

      {/* Medical Red Cross inspired by signboard */}
      <g>
        <rect x="53.5" y="15.5" width="13" height="27" rx="2.5" fill="#D83B48" />
        <rect x="46.5" y="22.5" width="27" height="13" rx="2.5" fill="#D83B48" />
        {/* Subtle inner cross highlight */}
        <path
          d="M60 22.5C61.8 20.8 64.5 21 65.8 22.7C67 24.3 66.5 26.8 64.5 28.6L60 32.5L55.5 28.6C53.5 26.8 53 24.3 54.2 22.7C55.5 21 58.2 20.8 60 22.5Z"
          fill="#FFFFFF"
          opacity="0.92"
        />
      </g>

      {/* GOOD lettering in Good Hope Green */}
      <text
        x="60"
        y="64"
        textAnchor="middle"
        fill="#37A879"
        fontFamily="Manrope, DM Sans, sans-serif"
        fontWeight="800"
        fontSize="21.5"
        letterSpacing="1.2"
      >
        GOOD
      </text>

      {/* HOPE lettering in Hope Navy */}
      <text
        x="60"
        y="83"
        textAnchor="middle"
        fill="#172F43"
        fontFamily="Manrope, DM Sans, sans-serif"
        fontWeight="800"
        fontSize="22"
        letterSpacing="1.8"
      >
        HOPE
      </text>

      {/* Subtle PHARMACY sub-label */}
      <line x1="25" y1="92.5" x2="35" y2="92.5" stroke="#37A879" strokeWidth="1.4" strokeLinecap="round" />
      <text
        x="60"
        y="95.5"
        textAnchor="middle"
        fill="#37A879"
        fontFamily="Manrope, DM Sans, sans-serif"
        fontWeight="700"
        fontSize="8.2"
        letterSpacing="1.6"
      >
        PHARMACY
      </text>
      <line x1="85" y1="92.5" x2="95" y2="92.5" stroke="#37A879" strokeWidth="1.4" strokeLinecap="round" />

      {/* Bottom green accent bar */}
      <rect x="38" y="101.5" width="44" height="5.5" rx="2.75" fill="#37A879" />
    </svg>
  );
};
