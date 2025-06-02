import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'

// 自定义插件：复制CSV文件到构建输出目录
function copyCSVPlugin() {
  return {
    name: 'copy-csv',
    writeBundle() {
      // 在构建完成后执行
      const sourceDir = join(__dirname, '..', 'csv')
      const targetDir = join(__dirname, 'dist', 'csv')

      function copyDirectory(src: string, dest: string) {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true })
        }

        const items = readdirSync(src)
        items.forEach(item => {
          const srcPath = join(src, item)
          const destPath = join(dest, item)
          const stat = statSync(srcPath)

          if (stat.isDirectory()) {
            copyDirectory(srcPath, destPath)
          } else if (stat.isFile()) {
            // 确保目标目录存在
            const destDirPath = dirname(destPath)
            if (!existsSync(destDirPath)) {
              mkdirSync(destDirPath, { recursive: true })
            }
            copyFileSync(srcPath, destPath)
            console.log(`Copied to dist: ${srcPath} -> ${destPath}`)
          }
        })
      }

      if (existsSync(sourceDir)) {
        copyDirectory(sourceDir, targetDir)
        console.log('CSV files copied to build output directory')
      } else {
        console.warn('Source CSV directory not found:', sourceDir)
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), copyCSVPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vue: ['vue']
        }
      }
    }
  },
  server: {
    port: 8000,
    host: true
  }
}) 