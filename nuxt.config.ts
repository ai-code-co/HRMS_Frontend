export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-zod-i18n',
    '@nuxtjs/i18n',
    '@nuxtjs/device',
    '@pinia/nuxt'
  ],
  devtools: {
    enabled: true
  },
  ui: {
    colorMode: false
  },
  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL
    }
  },
  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})