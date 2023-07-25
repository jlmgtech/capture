import { defineConfig } from "vite";
//import react from "@vitejs/plugin-react";
//import concurrently from 'concurrently';
//import { spawn } from 'child_process';

export default defineConfig(
    {
        plugins: [
            //react(),
            {
                name: 'run-pocketbase',
                apply: 'serve', // This plugin will only take effect in 'serve' mode (npm run dev)
                configResolved(config) {
                    //if (config.command === 'serve') {
                    //    //const pocketbase = spawn('go', ['run', 'main.go', 'serve'], {cwd: './bin/'});
                    //    // actually, let's use the library "concurrently" instead:
                    //    concurrently([
                    //        {command: './bin/director serve', name: 'pocketbase'},
                    //    ]);
                    //    process.on("exit", () => {
                    //        spawn("killall", ["director"]);
                    //    });
                    //}
                },
            },
        ]
    }
);
