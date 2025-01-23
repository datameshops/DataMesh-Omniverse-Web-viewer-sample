import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

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
          target: 'https://dtcs-local-demo.datamesh.com/',
          // target: 'http://192.168.3.177',
          changeOrigin: true,
        },
      },
    },
  })
}
