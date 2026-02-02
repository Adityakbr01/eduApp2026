export function formatDuration(seconds = 0, { full = false } = {}) {
  const totalSeconds = Math.floor(seconds);

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  // Tooltip / full format → always hh:mm:ss
  if (full || hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  // Normal UI → mm:ss
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
