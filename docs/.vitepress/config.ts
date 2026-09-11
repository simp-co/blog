import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Blog",
  titleTemplate: "自在的博客",
  description: "ZiZai's personal blog. ",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '更新', link: '/update-info' },
      { text: '关于我', link: '/about' }
    ],

    sidebar: {
      '/update-info/': [
        {
          text: '更新信息',
          items: [
            { text: '介绍', link: '/update-info/index' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/simp-co' },
      {
        icon: {
          svg: '<svg style="fill: none" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>'
        },
        link: 'mailto:wy163yx_ya@163.com'
      }
    ]
  }
})
