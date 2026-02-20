import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BIND_TO_PUBLIC = true;
const PORT = 5173

const BIND_ADDRESS = BIND_TO_PUBLIC ? "0.0.0.0" : "127.0.0.1";

// https://vite.dev/config/
export default defineConfig({
    server: {
        host: BIND_ADDRESS,
        port: PORT
    },
    plugins: [react()],
})
