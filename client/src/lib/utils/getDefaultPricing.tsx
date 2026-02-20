  // Transform pricing for form default values
  const getDefaultPricing = (initialData:any) => {
    if (initialData?.pricing) {
      return {
        price: initialData.pricing.price,
        originalPrice: initialData.pricing.originalPrice || 0,
        discountPercentage: initialData.pricing.discountPercentage || 0,
        discountExpiresAt: initialData.pricing.discountExpiresAt
          ? new Date(initialData.pricing.discountExpiresAt)
              .toISOString()
              .split("T")[0]
          : "",
        currency:
          (initialData.pricing.currency as "USD" | "EUR" | "INR") || "USD",
        isFree: initialData.pricing.isFree,
      };
    }
    return {
      price: 0,
      originalPrice: 0,
      discountPercentage: 0,
      discountExpiresAt: "",
      currency: "USD" as const,
      isFree: true,
    };
  };

  export default getDefaultPricing;