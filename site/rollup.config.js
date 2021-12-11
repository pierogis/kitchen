import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import replace from "rollup-plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import rust from "rollup-plugin-rust";
import typescript from "@rollup/plugin-typescript";
import html from "@rollup/plugin-html";
import css from "rollup-plugin-import-css";

const production = !process.env.ROLLUP_WATCH;
import preprocess from "svelte-preprocess";

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require("child_process").spawn(
                "npm", ["run", "start", "--", "--dev"], {
                    stdio: ["ignore", "inherit", "inherit"],
                    shell: true,
                }
            );

            process.on("SIGTERM", toExit);
            process.on("exit", toExit);
        },
    };
}

export default {
    input: "src/index.ts",
    output: {
        dir: "dist",
    },
    plugins: [
        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        commonjs(),

        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
        }),

        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `src` directory and refresh the
        // browser on changes when not in production
        !production && livereload("src"),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser(),

        rust(),
        svelte({
            preprocess: preprocess(),
        }),
        typescript(),
        css(),
        html({
            title: "kitchen",
        }),
    ],
    watch: {
        clearScreen: false,
    },
};