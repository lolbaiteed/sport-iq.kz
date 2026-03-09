import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  // Change this to your Strapi URL
  // You can also use environment variables: import.meta.env.STRAPI_URL
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'kk'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
