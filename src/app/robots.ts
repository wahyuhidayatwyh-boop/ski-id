import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Jangan indeks halaman admin
    },
    sitemap: 'https://skitelkompurwokerto.site/sitemap.xml',
  };
}
