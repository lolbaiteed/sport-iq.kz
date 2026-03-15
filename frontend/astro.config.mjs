// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
	vite: {
		plugins: [tailwindcss()],
	},
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'kk'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
