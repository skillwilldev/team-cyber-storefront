/**
 * Header icon set — one grid for every icon:
 * 24×24 viewBox, 1.75 stroke, round caps, drawing kept inside a 3…21 live area,
 * so all icons have the same optical size when rendered at the same pixel size.
 */
function Icon({ children, ...rest }) {
  return (
    <svg
      className="hicon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
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
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4.6-4.6" />
  </Icon>
);

export const HeartIcon = (p) => (
  <Icon {...p}>
    <path d="M12 20.5 4.6 13.3a5 5 0 0 1 0-7.1 5 5 0 0 1 7.1 0l.3.3.3-.3a5 5 0 0 1 7.1 0 5 5 0 0 1 0 7.1L12 20.5Z" />
  </Icon>
);

export const BagIcon = (p) => (
  <Icon {...p}>
    <path d="M5.2 8h13.6l1 12H4.2l1-12Z" />
    <path d="M8.5 10.5V7a3.5 3.5 0 0 1 7 0v3.5" />
  </Icon>
);

export const UserIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20.5c.8-3.6 3.9-5.5 8-5.5s7.2 1.9 8 5.5" />
  </Icon>
);

export const MenuIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const SunIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </Icon>
);

export const MoonIcon = (p) => (
  <Icon {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </Icon>
);

export const MonitorIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="4.5" width="18" height="12" rx="2" />
    <path d="M8.5 20h7M12 16.5V20" />
  </Icon>
);
