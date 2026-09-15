import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Blog",
  titleTemplate: "自在的博客",
  description: "ZiZai's personal blog. ",
  // markdown配置
  markdown: {
    math: true
  },

  // 主题配置
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: 'Groovy', link: '/groovy' },
      { text: '算法', link: '/algorithm' },
      { text: '更新', link: '/update-info' },
      { text: '关于我', link: '/about' }
    ],

    sidebar: {
      '/groovy/': [
        {
          text: 'Groovy文档',
          items: [
            { text: '介绍', link: '/groovy/index' },
            { text: '数据类型', link: '/groovy/data-types/index' },
            { text: '操作符', link: '/groovy/operators/index' },
            { text: '程序结构', link: '/groovy/program-structure/index' },
            { text: '面向对象', link: '/groovy/object-orientation/index'},
            { text: '闭包', link: '/groovy/closures/index'},
            { text: '语义', link: '/groovy/semantics/index'},
            { text: '与Java的区别', link: '/groovy/differences-with-java/index'}
          ]
        }
      ],
      '/algorithm/': [
        { text: '介绍', link: '/algorithm/index'},
        {
          text: '题解',
          base: '/algorithm/solutions/',
          items: [
            { text: '题解部分', link: 'index'}
          ]
        }
      ],
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
