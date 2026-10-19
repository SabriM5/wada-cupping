import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/espace-client/'], // Bloque l'indexation des zones privées
    },
    sitemap: 'https://www.wada-cupping.fr/sitemap.xml',
  };
}