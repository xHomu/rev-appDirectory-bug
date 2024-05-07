import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { expressDevServer } from "remix-express-dev-server";
import envOnly from "vite-env-only";

installGlobals({ nativeFetch: true });

export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [
    expressDevServer({
      appDirectory: "remix-app",
    }),
    envOnly(),
    remix({
      appDirectory: "remix-app",
      future: { unstable_singleFetch: true },
    }),
    tsconfigPaths(),
  ],
});
