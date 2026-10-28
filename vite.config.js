import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

/**
 * index.html contains the placeholder __SITE_URL__ in the Open Graph tags and in the structured data.
 * With VITE_SITE_URL set it becomes the real address; without it the lines are removed
 * (an Open Graph picture needs an absolute URL, a wrong one is worse than none).
 */
function siteUrlPlugin(siteUrl) {
  return {
    name: 'site-url-in-html',
    transformIndexHtml(html) {
      if (siteUrl) return html.replaceAll('__SITE_URL__', siteUrl)

      return html.replace(/^.*__SITE_URL__.*\r?\n/gm, '')
    },
  }
}

/**
 * The main stylesheet is a render-blocking request: the browser waits for index-xxxx.css before it paints.
 * For a small stylesheet it is faster to put it straight into index.html (one request less on a slow network).
 * Stylesheets of lazy pages stay separate files. A big stylesheet (> 80 KB) is left alone, so index.html does not grow too much.
 */
function inlineMainCssPlugin() {
  return {
    name: 'inline-main-css',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html // dev server
        return html.replace(/<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (tag, href) => {
          const asset = ctx.bundle[href.replace(/^\//, '')]
          if (!asset || asset.type !== 'asset') return tag
          const css = String(asset.source)
          if (css.length > 80_000 || css.includes('</style')) return tag

          return `<style>${css}</style>`
        })
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'VITE_')
  const siteUrl = (env.VITE_SITE_URL || '').trim().replace(/\/+$/, '')

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      siteUrlPlugin(siteUrl),
      inlineMainCssPlugin(),
    ],
    resolve: {
      alias: {
        '@': `${import.meta.dirname}/src`,
        '@shared': `${import.meta.dirname}/src/shared`,
        '@features': `${import.meta.dirname}/src/features`,
        '@api': `${import.meta.dirname}/src/api`,
      },
    },
  }
})
