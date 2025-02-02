/* Copyright 2021, Milkdown by Mirone.*/
import { defineConfig } from 'tsup';

export default defineConfig([
    {
        clean: true,
        entry: {
            extension: 'src/main/extension.ts',
        },
        external: ['vscode'],
        format: ['cjs'],
        shims: false,
        dts: false,
        minify: true,
        platform: 'node',
    },
    {
        clean: true,
        entry: {
            view: 'src/view/view.ts',
            style: 'src/view/style/style.css',
        },
        external: ['vscode'],
        format: ['iife'],
        shims: false,
        dts: false,
        minify: true,
        platform: 'browser',
    },
]);
