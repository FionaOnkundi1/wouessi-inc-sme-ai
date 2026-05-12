import type { BusinessData } from "../schemas/business.js";

export type SeoMetadata = {
  title: string;
  description: string;
  keywords: string[];
};

export function generateSeoMetadata(businessData: BusinessData): SeoMetadata {
  const title = `${businessData.businessName} | ${businessData.businessType} in ${businessData.location}`.slice(0, 60);
  const description = businessData.shortDescription.length > 155
    ? `${businessData.shortDescription.slice(0, 152)}...`
    : businessData.shortDescription;

  return {
    title,
    description,
    keywords: [
      businessData.businessType.toLowerCase(),
      businessData.location.toLowerCase(),
      businessData.productsOrServices.toLowerCase()
    ]
  };
}
