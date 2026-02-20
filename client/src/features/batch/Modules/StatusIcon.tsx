interface StatusIconProps {
  completed?: boolean;
  isLocked?: boolean;
  size?: number;
}

/**
 * Reusable status icon:
 *  - Completed → green checkmark circle
 *  - Locked    → muted arrow (no hover effect)
 *  - Default   → accent arrow with rotate-on-hover
 */
const StatusIcon = ({ completed, isLocked, size = 18 }: StatusIconProps) => {
  if (completed) {
    return (
      <svg
        className="shrink-0 fill-emerald-500/10 transition-transform duration-200 stroke-emerald-400"
        width={size}
        height={size}
        viewBox="0 0 19 19"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.78125 9.49969L8.2575 11.9759L13.2188 7.02344M9.5 18.25C14.3125 18.25 18.25 14.3125 18.25 9.5C18.25 4.6875 14.3125 0.75 9.5 0.75C4.6875 0.75 0.75 4.6875 0.75 9.5C0.75 14.3125 4.6875 18.25 9.5 18.25Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (isLocked) {
    return (
      <svg
        className="shrink-0 fill-emerald-500/10 stroke-white/30"
        width={size}
        height={size}
        viewBox="0 0 19 19"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 14L14 5M14 5H5M14 5V14"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className="shrink-0 fill-(--custom-accentColor) group-hover:rotate-45 transition-transform duration-200 stroke-(--custom-accentColor)"
      width={size}
      height={size}
      viewBox="0 0 19 19"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 14L14 5M14 5H5M14 5V14"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default StatusIcon;
