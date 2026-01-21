import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  const { VITE_PUBLIC_PATH } = loadEnv(mode, process.cwd())
  return defineConfig({
    base: VITE_PUBLIC_PATH,
    plugins: [
      vue(),
      vueJsx(),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      }),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
        ],
        dts: true,
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Server Configuration
    server: {
      hmr: true,
      port: 8080,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'https://dcs.datamesh.com.cn/',
          changeOrigin: true,
        },
      },
    },
  })
}
