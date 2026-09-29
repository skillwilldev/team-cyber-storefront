function Svg({ size = 24, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const HeartIcon = (p) => (
  <Svg {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);

export const CartIcon = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </Svg>
);

export const UserIcon = (p) => (
  <Svg {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

export const ChevronIcon = ({ direction = 'down', ...p }) => {
  const rotate = { down: 0, up: 180, left: 90, right: -90 }[direction];

  return (
    <Svg {...p} style={{ transform: `rotate(${rotate}deg)`, ...p.style }}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
};

export const BurgerIcon = (p) => (
  <Svg strokeWidth="2.2" {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

export const SlidersIcon = (p) => (
  <Svg {...p}>
    <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg strokeWidth="3" {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const StarIcon = ({ filled = true, ...p }) => (
  <Svg fill={filled ? 'currentColor' : 'none'} strokeWidth="1.5" {...p}>
    <path d="m12 2.5 2.94 6.02 6.56.94-4.75 4.63 1.13 6.55L12 17.55l-5.88 3.09 1.13-6.55L2.5 9.46l6.56-.94L12 2.5Z" />
  </Svg>
);

// Social icons (filled)
export const TwitterIcon = (p) => (
  <Svg fill="currentColor" stroke="none" {...p}>
    <path d="M22 5.9a8.2 8.2 0 0 1-2.36.65 4.1 4.1 0 0 0 1.8-2.27 8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.74A11.64 11.64 0 0 1 3.4 4.75a4.1 4.1 0 0 0 1.27 5.47 4.07 4.07 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.28 4.02 4.1 4.1 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.46a11.6 11.6 0 0 0 6.29 1.84c7.55 0 11.67-6.25 11.67-11.67l-.01-.53A8.3 8.3 0 0 0 22 5.9Z" />
  </Svg>
);

export const FacebookIcon = (p) => (
  <Svg fill="currentColor" stroke="none" {...p}>
    <path d="M13.5 21v-7.8h2.6l.4-3.1h-3V8.2c0-.9.25-1.5 1.5-1.5h1.6V3.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3.1h2.7V21h3.1Z" />
  </Svg>
);

export const TikTokIcon = (p) => (
  <Svg fill="currentColor" stroke="none" {...p}>
    <path d="M16.6 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.77.12V9.75a5.7 5.7 0 1 0 4.93 5.65V9.1a7.3 7.3 0 0 0 4.2 1.33V7.3a4.2 4.2 0 0 1-4.2-4.3Z" />
  </Svg>
);

export const InstagramIcon = (p) => (
  <Svg fill="currentColor" stroke="none" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" fill="none" stroke="var(--icon-hole, #000)" strokeWidth="2" />
    <circle cx="17.2" cy="6.8" r="1.2" fill="var(--icon-hole, #000)" />
  </Svg>
);

// Product page icons
export const TruckIcon = (p) => (
  <Svg {...p}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </Svg>
);

export const StoreIcon = (p) => (
  <Svg {...p}>
    <path d="M3 9.5 4.5 4h15L21 9.5M3 9.5h18M4.5 9.5V20h15V9.5M9.5 20v-6h5v6" />
  </Svg>
);

export const ShieldCheckIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </Svg>
);

export const PhoneIcon = (p) => (
  <Svg {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2" />
    <path d="M11 18h2" />
  </Svg>
);

export const CpuIcon = (p) => (
  <Svg {...p}>
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </Svg>
);

export const CoresIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M5.3 5.3l2.8 2.8M15.9 15.9l2.8 2.8M5.3 18.7l2.8-2.8M15.9 8.1l2.8-2.8" />
  </Svg>
);

export const CameraIcon = (p) => (
  <Svg {...p}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
    <circle cx="12" cy="13" r="3.2" />
  </Svg>
);

export const BatteryIcon = (p) => (
  <Svg {...p}>
    <rect x="2" y="7" width="16" height="10" rx="2" />
    <path d="M22 11v2M6 11v2" />
  </Svg>
);

export const ImageIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m21 16-5-5-8 9" />
  </Svg>
);

export const InfoIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);
