const CONFIG = {
  // profile setting (required)
  profile: {
    name: "j1n2u / 임진수",
    image: "https://notion-avatar.app/api/svg/eyJmYWNlIjozLCJub3NlIjo3LCJtb3V0aCI6MTEsImV5ZXMiOjksImV5ZWJyb3dzIjowLCJnbGFzc2VzIjowLCJoYWlyIjo2LCJhY2Nlc3NvcmllcyI6MCwiZGV0YWlscyI6MywiYmVhcmQiOjAsImZsaXAiOjAsImNvbG9yIjoicmdiYSgyNTUsIDAsIDAsIDApIiwic2hhcGUiOiJub25lIn0=", // If you want to create your own notion avatar, check out https://notion-avatar.vercel.app
    role: "ML/AI Engineer",
    bio: "just working on it.",
    email: "dla0830ld@@gmail.com",
    linkedin: "https://www.linkedin.com/in/진수-임-43219499/",
    github: "https://github.com/Jinsu-L",
    instagram: "",
  },
  
  projects: projects: [
  { name: '', href: '' },
].filter(() => false)
    
  // blog setting (required)
  blog: {
    title: "j1n2u-blog",
    description: "welcome to my-blog!",
    scheme: "system", // 'light' | 'dark' | 'system'
  },

  // CONFIG configration (required)
  link: "https://j1n2u-blog.vercel.app",
  since: 2019, // If leave this empty, current year will be used.
  lang: "ko-LR", // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES', 'ko-KR']
  ogImageGenerateURL: "https://og-image-korean.vercel.app", // The link to generate OG image, don't end with a slash

  // notion configuration (required)
  notionConfig: {
    pageId: process.env.NOTION_PAGE_ID,
  },

  // plugin configuration (optional)
  googleAnalytics: {
    enable: false,
    config: {
      measurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID || "",
    },
  },
  googleSearchConsole: {
    enable: false,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  },
  naverSearchAdvisor: {
    enable: false,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || "",
    },
  },
  utterances: {
    enable: true,
    config: {
      repo: process.env.NEXT_PUBLIC_UTTERANCES_REPO || "",
      "issue-term": "og:title",
      label: "💬 Utterances",
    },
  },
  cusdis: {
    enable: false,
    config: {
      host: "https://cusdis.com",
      appid: "", // Embed Code -> data-app-id value
    },
  },
  isProd: process.env.VERCEL_ENV === "production", // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
  revalidateTime: 21600 * 7, // revalidate time for [slug], index
}

module.exports = { CONFIG }
