import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  // Add configuration for Three.js specific properties
  {
    rules: {
      "react/no-unknown-property": [
        "error",
        {
          ignore: [
            "position",
            "intensity",
            "args",
            "transparent",
            "opacity",
            "roughness",
            "metalness",
            "map",
            "envMapIntensity",
            "color",
            "makeDefault",
            "rotation",
            "preset"
          ]
        }
      ]
    }
  }
];