/**
 * 参考链接: https://vitejs.dev/config/
 */
import { join } from 'path'
import dotenv from 'dotenv'
import vue from '@vitejs/plugin-vue'

dotenv.config({ path: join(__dirname, '.env') })
const root = join(__dirname, 'src/render')

const config = {
  root,
  resolve: {
    alias: {
      '/@': root,
    }
  },
  base: './',
  build: {
    outDir: join('../../dist/render'),
    emptyOutDir: true
  },
  server: {
    port: +process.env.PORT,
  },
  plugins: [
    vue()
  ],
  optimizeDeps: {
    exclude: [
      'electron-is-dev',
      'electron-store',
      'ipfs-core',
      'ipfs',
      'ipfs-http-client',
      'ipfsd-ctl',
      'ipfs-pubsub-room'
    ]
  },
}

export default config
