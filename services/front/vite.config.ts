import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react-swc";
import { z } from "zod";
import checker from "vite-plugin-checker";

// ! important - for typescript inference, report any new config variable in `vite-env.d.ts`
export const configSchema = z.object({
  VITE_BACK_BASE_URL: z.string().url(),
  VITE_BACK_DID: z
    .string()
    .describe("Decentralized Identifier with did:web method")
    .max(254)
    .refine(
      (val) => {
        return val.startsWith("did:web:");
      },
      {
        message: "Please use did:web such as `did:web:api.example.com`",
      }
    ),
});

// https://vitejs.dev/config/
// See https://vitejs.dev/config/#using-environment-variables-in-config
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "VITE");
  configSchema.parse(env);
  return {
    plugins: [
      react(),
      VitePWA({ registerType: "autoUpdate" }),
      svgr(),
      checker({
        typescript: true,
      }),
    ],
  };
});
