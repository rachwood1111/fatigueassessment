import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures the process.env.API_KEY works in the browser build
    // You must set this in Netlify Environment Variables
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY) 
  }
});