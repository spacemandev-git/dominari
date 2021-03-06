import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import dts from 'rollup-plugin-dts';

const env = process.env.NODE_ENV;

const config = [
  {
    input: "src/index.ts",
    plugins: [
      commonjs(),
      nodeResolve({
        browser: true,
        extensions: [".js", ".ts"],
        dedupe: ["bn.js", "buffer"],
        preferBuiltins: false,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        moduleResolution: "node",
        outDir: "types",
        target: "es2019",
        outputToFilesystem: false,
      }),
      replace({
        preventAssignment: true,
        values: {
          "process.env.NODE_ENV": JSON.stringify(env),
          "process.env.BROWSER": JSON.stringify(true),
        },
      }),
      terser(),
    ],
    external: [
      "@project-serum/borsh",
      "@solana/web3.js",
      "assert",
      "base64-js",
      "bn.js",
      "bs58",
      "buffer",
      "camelcase",
      "eventemitter3",
      "js-sha256",
      "pako",
      "toml",
    ],
    output: {
      file: "dist/dominari.js",
      format: "umd",
      name: "di",
      sourcemap: false,
    },
  }, {
    input: "dist/dist/src/index.d.ts",
    output: [{ file: "dist/dominari.d.ts", format: "umd" }],
    plugins: [dts()]
  } 
];

export default config;