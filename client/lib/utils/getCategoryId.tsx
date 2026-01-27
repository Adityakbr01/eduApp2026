// Helper to extract ID from category/subCategory (can be string or object)
const getCategoryId = (
  category: string | { _id: string } | undefined
): string => {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category._id;
};


export default getCategoryId;