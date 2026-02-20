export const getS3PublicUrl = (key?: string) => {
  if (!key) return null;

  return `https://eduapp-bucket-prod.s3.us-east-1.amazonaws.com/${key}`;
};
