import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ 
      autoImport: true,
      styles: {
        configFile: 'src/styles/variables.scss'
      }
    }),
  ],
  server: {
    watch: {
      usePolling: true,
    }
  },
});
