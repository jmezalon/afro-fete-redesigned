import React from 'react';

/**
 * Afro-fete Logo Component
 *
 * A flexible logo component with elegant serif typography and dancing figure icon.
 * Uses currentColor for easy theming.
 *
 * @param {Object} props
 * @param {number} [props.width=200] - Width of the logo in pixels
 * @param {number} [props.height=60] - Height of the logo in pixels
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.iconOnly=false] - Show only the dancing figure icon
 * @returns {JSX.Element}
 */
const Logo = ({
  width = 200,
  height = 60,
  className = '',
  iconOnly = false
}) => {
  if (iconOnly) {
    // Icon-only version for favicon or small spaces
    const iconSize = width || 40;
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Afro-fete logo"
      >
        <g transform="translate(8, 6)">
          {/* Head */}
          <circle cx="12" cy="8" r="4" fill="currentColor"/>
          {/* Body with dynamic pose */}
          <path
            d="M12 12 L10 20 M12 12 L14 20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Arms in dancing pose */}
          <path
            d="M12 13 L6 16 M12 13 L16 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Legs in dancing pose */}
          <path
            d="M10 20 L8 28 M14 20 L18 26"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Movement lines for dynamic effect */}
          <path
            d="M4 15 Q6 14 7 15"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M17 9 Q18 8 19 9"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      </svg>
    );
  }

  // Full logo with text
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Afro-fete"
    >
      {/* Dancing figure icon */}
      <g transform="translate(5, 10)">
        {/* Head */}
        <circle cx="12" cy="8" r="4" fill="currentColor"/>
        {/* Body with dynamic pose */}
        <path
          d="M12 12 L10 20 M12 12 L14 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Arms in dancing pose */}
        <path
          d="M12 13 L6 16 M12 13 L16 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Legs in dancing pose */}
        <path
          d="M10 20 L8 28 M14 20 L18 26"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Movement lines for dynamic effect */}
        <path
          d="M4 15 Q6 14 7 15"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M17 9 Q18 8 19 9"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      {/* Text: "afro fete" */}
      <text
        x="35"
        y="35"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="300"
        fill="currentColor"
        letterSpacing="1"
      >
        afro
      </text>
      <text
        x="95"
        y="35"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="600"
        fill="currentColor"
        letterSpacing="1"
      >
        fête
      </text>

      {/* Decorative underline accent */}
      <line
        x1="95"
        y1="38"
        x2="155"
        y2="38"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.6"
      />
    </svg>
  );
};

export default Logo;
