/* Copyright 2021, Milkdown by Mirone.*/
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/extension.ts'],
    external: ['vscode'],
    format: ['cjs'],
    shims: false,
});
