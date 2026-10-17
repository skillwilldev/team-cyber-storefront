/**
 * Icons of the checkout flow and the address screens (stroke icons, `currentColor`, same style as icons.jsx).
 */
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

/** Step 1 — Address */
export const PinIcon = (p) => (
  <svg
    width="12"
    height="15"
    viewBox="0 0 12 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...p}
  >
    <path
      d="M5.7 0A5.7 5.7 0 0 0 0 5.7c0 4 4 7.6 5.3 8.6a1 1 0 0 0 .8 0c1.2-1 5.3-4.6 5.3-8.6A5.7 5.7 0 0 0 5.7 0m0 8a2.4 2.4 0 1 1 0-4.7 2.4 2.4 0 0 1 0 4.8"
      fill="currentColor"
    />
  </svg>
);

/** Step 2 — Shipping */
export const ShipmentIcon = (p) => (
  <svg
    width="16"
    height="15"
    viewBox="0 0 16 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...p}
  >
    <path
      d="m8.3 10.6-.9-.5-.7-2.7L15 5.1l.8 3.4zM5.7 3.4 11 1.9l.9 3.4-5.4 1.5zm.2 6.6-.4.2L3 .8h-1q0 .3-.4.4H.6A1 1 0 0 1 0 .6Q0 0 .6 0h1q.4 0 .5.3H4l2.5 9.6zm.2.6A2 2 0 0 1 8.5 12 2 2 0 0 1 7 14.6 2 2 0 0 1 4.7 13 2 2 0 0 1 6 10.6m-.3 2.2q.2.8 1 .7.8-.4.6-1.1a1 1 0 0 0-1-.6q-.7.2-.6 1m9.9-2.3L9 12.4l-.2-1 6.5-1.8z"
      fill="currentColor"
    />
  </svg>
);

/** Step 3 — Payment */
export const PaymentIcon = (p) => (
  <svg
    width="12"
    height="18"
    viewBox="0 0 12 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...p}
  >
    <path
      d="M11.2 8 8.6 5.3V1.7Q8.5 0 7 0H1.5Q.2.1 0 1.5v8.7q.1 1.5 1.7 1.6h1.9q.2 0 .1-.1V11l-.2-.1h-.1q-.2 0-.2-.2V1H7q.5 0 .6.6v8.8q0 .4-.4.5c-.4-.2-.8-1.1-1-1.3C6.3 9.3 6 7 4.9 7h-.1s-1 0-.2 2.8l.4 3.1c0 .2.4 1.7 1.4 2.8v.4q-.5 0-.5.4v1q0 .5.5.5h4.4q.3 0 .4-.4v-1q0-.5-.4-.5c0-1.4.6-6 .9-6.4 0-.2.3-1.2-.4-1.7m-9.5 2.7v.2a1 1 0 0 1-.7-.7V1.5q0-.6.6-.7l.1.1z"
      fill="currentColor"
    />
  </svg>
);

export const PencilIcon = (p) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    {...p}
  >
    <path
      fill="currentColor"
      d="M8.64 4.44a13 13 0 0 0 4.02 3.98l-6.89 6.9a4 4 0 0 1-.9.77c-.26.14-.55.2-1.14.32l-3.08.61c-.33.07-.5.1-.6 0-.09-.09-.05-.25.01-.58l.62-3.08c.12-.59.18-.89.32-1.15s.35-.47.77-.9zM13.03.21a2 2 0 0 1 1.77 0 5 5 0 0 1 1.12.96c.54.55.82.82.96 1.11a2 2 0 0 1 0 1.78 5 5 0 0 1-.96 1.11l-1.8 1.8a11 11 0 0 1-4.02-3.98l1.82-1.82c.54-.54.81-.82 1.1-.96"
    />
  </svg>
);

export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
);

export const CheckCircleIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m8 12 3 3 5-6" />
  </Svg>
);

export const CardChipIcon = ({ size = 35, ...rest }) => (
  <svg
    width={size}
    height={(size * 60) / 73.3}
    viewBox="0 0 73.3 60"
    fill="none"
    aria-hidden="true"
    focusable="false"
    style={{ shapeRendering: 'geometricPrecision', fillRule: 'evenodd', clipRule: 'evenodd' }}
    {...rest}
  >
    <rect
      width="70"
      height="53.3"
      x="1.7"
      y="3.3"
      fill="#f9cd5f"
      stroke="#373737"
      strokeLinejoin="round"
      strokeWidth="1.4"
      rx="8.3"
      ry="8.3"
    />
    <path
      fill="#373737"
      d="M24.3 3.3H26v53.4h-1.7zm24.8 20.1h1.6v33.3h-1.6zM49 3.3h1.6v9.4H49z"
    />
    <path
      fill="#373737"
      d="M1.7 12.8v-1.6h23.2v1.6zm0 12.1v-1.6H25v1.6zm0 11.2v-1.6H25v1.6zm0 12.3v-1.7H25v1.7zM50 12.7v-1.6h21.6v1.6zM50 25v-1.6h21.6V25zm0 11.1v-1.6h21.6v1.6zm0 12.3v-1.7h21.6v1.7z"
    />
  </svg>
);

/** Contactless (NFC) symbol: four arcs that grow to the right. Uses currentColor. */
export const ContactlessIcon = ({ size = 20, ...rest }) => (
  <svg
    width={size}
    height={(size * 20) / 12}
    viewBox="0 0 12 20"
    fill="none"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    <path
      fill="currentColor"
      d="M.2 7q.5.5.6 1.3a7 7 0 0 1-.6 4.8q-.5 1 .2 1.8a1 1 0 0 0 1.5-.2l1-2.2q.4-1.2.3-2.5 0-1.2-.3-2.5-.4-1.1-1-2.2a1 1 0 0 0-1.5-.2q-.7.8-.2 1.8"
    />
    <path
      fill="currentColor"
      d="M4 4.5S5.3 8 5.3 10q0 3.1-1.3 5.5-.5 1 .3 1.8 1 .5 1.5-.4a15 15 0 0 0 0-13.8q-.6-1-1.5-.4C3.8 3 4 4.5 4 4.5"
    />
    <path
      fill="currentColor"
      d="M8 2a19 19 0 0 1 0 16q-.5 1.1.4 1.8t1.5-.5q2-4.1 2.1-9.3Q12 4.8 9.9.7A1 1 0 0 0 8.4.2Q7.5.9 8 2"
    />
  </svg>
);
