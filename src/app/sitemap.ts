import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.wada-cupping.fr';

  return [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${baseUrl}/reservation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/offrir`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/legal`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}