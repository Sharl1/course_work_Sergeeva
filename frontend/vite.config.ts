import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl' // <--- Импорт

export default defineConfig({
  plugins: [react(), basicSsl()], // <--- Добавили плагин
  server: {
    host: true, // Разрешает подключение по сети
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9090',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})