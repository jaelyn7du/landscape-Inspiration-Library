import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/**
 * 数据源：项目内的 data.js（由 generate_data.py 生成，已随仓库一起提交）
 * 图片素材放在 public/小红书素材爬取/，Vite 会自动在 dev 与 build 时对外提供
 */
const DATA_FILE = path.join(__dirname, 'data.js')

/* ------------------------------------------------------------------
   插件：把项目内的 data.js 转成虚拟模块 virtual:inspiration-data
   这样 React 侧可以直接 `import items from 'virtual:inspiration-data'`
   数据源仍是项目内的 data.js，generate_data.py 重新生成后热更新即可
------------------------------------------------------------------ */
function inspirationDataPlugin() {
  const VIRTUAL_ID = 'virtual:inspiration-data'
  const RESOLVED_ID = '\0' + VIRTUAL_ID

  const readItems = () => {
    if (!fs.existsSync(DATA_FILE)) {
      console.warn(`[data] 未找到 ${DATA_FILE}`)
      return '[]'
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']')
    if (start === -1 || end === -1) return '[]'
    const json = raw.slice(start, end + 1)
    try {
      JSON.parse(json)
    } catch (e) {
      console.error('[data] data.js 解析失败：', e.message)
      return '[]'
    }
    return json
  }

  return {
    name: 'inspiration-data',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      return `export default ${readItems()}`
    },
    configureServer(server) {
      server.watcher.add(DATA_FILE)
      server.watcher.on('change', (file) => {
        if (path.resolve(file) === DATA_FILE) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
          if (mod) server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
  }
}

export default defineConfig({
  // 使用相对 base，保证产物可部署到任意子路径（如 GitHub Pages 的 /<repo>/）
  base: './',
  plugins: [react(), inspirationDataPlugin()],
  server: {
    port: 5180,
    host: '127.0.0.1',
    open: false,
  },
  preview: {
    port: 5181,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
  },
})
