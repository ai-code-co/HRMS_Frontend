<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: 'https://staginghr.excellencetechnologies.in/exce_favicon.png' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Excellence HRMS'
const description = 'Human Resource Management System'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://staginghr.excellencetechnologies.in/exce_favicon.png',
  twitterImage: 'https://staginghr.excellencetechnologies.in/exce_favicon.png',
  twitterCard: 'Excellence HRMS'
})
</script>

<template>
  <UApp>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
