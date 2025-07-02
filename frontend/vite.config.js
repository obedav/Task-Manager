// vite.config.js - With WebSocket Fix
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Vite 6 compatible HTML environment variable replacer
const htmlEnvReplacer = () => {
  return {
    name: 'html-env-replacer',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        console.log('🔧 Processing HTML environment variables...')
        
        // Get environment variables with safe fallbacks
        const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000/api'
        const environment = process.env.VITE_ENVIRONMENT || process.env.NODE_ENV || 'development'
        const appVersion = process.env.VITE_APP_VERSION || '1.0.0'
        const buildTime = new Date().toISOString()
        
        // Replace ALL %VITE_*% patterns in HTML
        let result = html
          .replace(/%VITE_API_URL%/g, apiUrl)
          .replace(/%VITE_ENVIRONMENT%/g, environment)
          .replace(/%VITE_APP_VERSION%/g, appVersion)
          .replace(/%VITE_BUILD_TIME%/g, buildTime)
          .replace(/%VITE_APP_NAME%/g, 'TaskFlow')
          .replace(/%VITE_APP_DESCRIPTION%/g, 'Task Management & Progress Tracking')
          // Remove any remaining %VITE_*% patterns that might cause issues
          .replace(/%VITE_[^%]*%/g, '')
        
        console.log('✅ Environment variables replaced in HTML')
        return result
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isProd = mode === 'production'
  
  console.log(`🏗️ Building in ${mode} mode`)
  
  return {
    plugins: [
      react(),
      htmlEnvReplacer()
    ],
    
    // FIXED: Enhanced server configuration with WebSocket fix
    server: {
      port: 5173,
      host: true, // Allow external access
      open: false,
      cors: true,
      // WebSocket configuration for HMR
      hmr: {
        port: 5173,
        host: 'localhost',
        // Alternative: use different port if 5173 has conflicts
        // port: 5174,
        // clientPort: 5173
      },
      // Additional WebSocket options
      ws: true, // Enable WebSocket
      // Fallback for WebSocket issues
      middlewareMode: false
    },
    
    build: {
      outDir: 'dist',
      sourcemap: isDev,
      minify: isProd,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom']
          }
        }
      }
    },
    
    // Define environment variables for JavaScript
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        process.env.VITE_API_URL || 'http://localhost:5000/api'
      ),
      'import.meta.env.VITE_ENVIRONMENT': JSON.stringify(
        process.env.VITE_ENVIRONMENT || mode
      ),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(
        process.env.VITE_APP_VERSION || '1.0.0'
      ),
      'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString())
    },
    
    // Path aliases
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    
    // Environment prefix
    envPrefix: ['VITE_'],
    
    // Enhanced optimization
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
      exclude: [],
      force: true
    },
    
    // Additional safety configurations
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
      jsx: 'automatic',
      target: 'esnext',
      keepNames: !isProd
    },
    
    // Enhanced error handling
    logLevel: isDev ? 'info' : 'warn',
    clearScreen: false
  }
})