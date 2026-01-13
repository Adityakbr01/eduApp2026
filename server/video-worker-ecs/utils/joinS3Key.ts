function joinS3Key(...parts: string[]) {
  return parts
    .filter(Boolean)              // "" remove
    .map(p => p.replace(/^\/+|\/+$/g, "")) // trim slashes
    .join("/");
}
export default joinS3Key;


