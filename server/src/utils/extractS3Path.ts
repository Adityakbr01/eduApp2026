const extractS3Path = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.replace(/^\/+/, "").replace(/^hls\//, "");
    } catch {
        return url; // fallback (already a path)
    }
};
export default extractS3Path;