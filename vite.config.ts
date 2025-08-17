// vite.config.ts
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin() // Automatic vendor chunk splitting
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/components'),
      '@engines': path.resolve(__dirname, './src/engines'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles')
    }
  },
  
  build: {
    target: 'es2020',
    minify: 'esbuild',
    
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd': ['antd', '@ant-design/icons'],
          'visualization': ['three', 'leaflet', 'react-leaflet'],
          'charts': ['recharts', '@ant-design/charts'],
          'utils': ['lodash', 'date-fns', 'axios'],
          
          // Application chunks
          'engines': [
            './src/engines/DDoSCorrelationEngine.ts',
            './src/engines/GeographicIntelligence.ts',
            './src/engines/CorporateIntelligence.ts',
            './src/engines/AdvancedAnalyticsEngine.ts'
          ],
          'api-layer': [
            './src/api/core/ApiOrchestrator.ts',
            './src/api/services/NVDService.ts',
            './src/api/services/IPInfoService.ts'
          ]
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        
        // Chunk file naming
        chunkFileNames: 'js/[name]-[hash].js',
        
        // Entry file naming
        entryFileNames: 'js/[name]-[hash].js'
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
    
    // Source maps for production debugging
    sourcemap: true,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inlining threshold
    assetsInlineLimit: 4096, // 4KB
  },
  
  server: {
    port: 3000,
    host: true,
    open: true,
    
    // Proxy configuration for API calls
    proxy: {
      '/api/nvd': {
        target: 'https://services.nvd.nist.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvd/, '/rest/json/cves/2.0')
      },
      '/api/ipinfo': {
        target: 'https://ipinfo.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ipinfo/, '')
      }
    }
  },
  
  preview: {
    port: 4173,
    host: true
  },
  
  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    preprocessorOptions: {
      less: {
        // Ant Design theme customization
        modifyVars: {
          '@primary-color': '#FF6000',
          '@link-color': '#FF6000',
          '@success-color': '#52c41a',
          '@warning-color': '#faad14',
          '@error-color': '#f5222d',
          '@font-size-base': '14px',
          '@heading-color': '#454545',
          '@text-color': '#454545',
          '@text-color-secondary': '#666666',
          '@border-radius-base': '8px',
          '@border-color-base': '#FFE6C7'
        },
        javascriptEnabled: true
      }
    }
  },
  
  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      'three',
      'lodash',
      'axios'
    ],
    exclude: [
      '@ant-design/charts' // Large library, load on demand
    ]
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});