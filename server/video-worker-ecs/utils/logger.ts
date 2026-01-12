export function log(level: "INFO" | "WARN" | "ERROR", msg: string, meta?: any) {
  const base = `[${new Date().toISOString()}] [${level}] ${msg}`;
  if (meta) console.log(base, meta);
  else console.log(base);
}
