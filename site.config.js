const CONFIG = {
  // profile setting (required)
  profile: {
    name: "임진수",
    image: "/my_profile.png", // Custom profile image
    role: "ML/AI Engineer",
    bio: "just working on it.",
    email: "dla0830ld@@gmail.com",
    linkedin: "진수-임-43219499/",
    github: "Jinsu-L",
    instagram: "",
  },

  projects: [{ name: '', href: '' },].filter(() => false),

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
  ogImageGenerateURL: "", //"https://og-image-korean.vercel.app", // The link to generate OG image, don't end with a slash

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
  revalidateTime: 60 // 21600 * 7, // revalidate time for [slug], index
}

module.exports = { CONFIG }
