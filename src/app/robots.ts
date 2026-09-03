import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/espace-client/'], // Bloquer l'indexation des zones privées
    },
    sitemap: 'https://www.ton-domaine.fr/sitemap.xml',
  };
}