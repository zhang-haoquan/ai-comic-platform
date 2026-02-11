import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    base: './',
    server: {
        port: 3000,
        host: '0.0.0.0',
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
