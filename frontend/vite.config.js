import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    base: "/guesthouse/",

    plugins: [react()],

    server: {
        proxy: {

            "/guesthouse-api": {
                target: "http://localhost:9009",
                changeOrigin: true,
                secure: false,
                rewrite: (path) =>
                    path.replace(/^\/guesthouse-api/, "")
            },

            "/transport-api": {
                target: "http://localhost:9009",
                changeOrigin: true,
                secure: false,
                rewrite: (path) =>
                    path.replace(/^\/transport-api/, "")
            }

        }
    }
});