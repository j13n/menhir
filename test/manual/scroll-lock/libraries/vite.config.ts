// The other libraries' pages: React for Radix and Base UI, Solid 1 for
// Kobalte and corvu, each compiled by its own plugin, by folder.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    react({ include: /\/react\/.*\.tsx$/ }),
    // Kobalte and corvu ship JSX source, which only this plugin compiles.
    solid({ include: [/\/solid1\/.*\.tsx$/, /node_modules\/.*\.jsx$/] }),
  ],
  server: { host: true, port: 5181 },
});
