/* Copyright 2021, Milkdown by Mirone.*/
import { Ctx, defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { emoji } from '@milkdown/plugin-emoji';
import { history } from '@milkdown/plugin-history';
import { indent, indentPlugin } from '@milkdown/plugin-indent';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { math } from '@milkdown/plugin-math';
import { prism } from '@milkdown/plugin-prism';
import { slash } from '@milkdown/plugin-slash';
import { tooltip } from '@milkdown/plugin-tooltip';
import { trailing } from '@milkdown/plugin-trailing';
import { gfm, image } from '@milkdown/preset-gfm';
import { upload, uploadPlugin } from '@milkdown/plugin-upload';
import { Node } from '@milkdown/prose/model';
import { outline } from '@milkdown/utils';

import { vscodeTheme } from '../theme-vscode';
import { vsImage } from './vs-image';
import type { ClientMessage } from './client-message';
import type { ResourceManager } from './resource-manager';

import 'katex/dist/katex.min.js';

const renderOutline = (ctx: Ctx) => {
    const container = document.getElementById('outline');
    while (container && container.firstChild) {
        container.removeChild(container.firstChild);
    }
    const outlines = outline()(ctx);
    outlines.forEach(({ id, level, text }) => {
        const item = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = text;
        a.style.paddingLeft = `${level * 10}px`;
        item.appendChild(a);
        container?.appendChild(item);
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createEditor = (vscode: any, message: ClientMessage, resource: ResourceManager) =>
    Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('editor'));
            const state = vscode.getState();
            if (state?.text) {
                ctx.set(defaultValueCtx, state.text);
            }
            ctx.get(listenerCtx)
                .markdownUpdated((ctx, markdown) => {
                    vscode.setState({ text: markdown });
                    message.update(markdown);

                    requestAnimationFrame(() => {
                        renderOutline(ctx);
                    });
                })
                .focus(() => {
                    message.focus();
                })
                .blur(() => {
                    message.blur();
                })
                .mounted(() => {
                    message.ready();
                });
        })
        .use(vscodeTheme())
        .use(gfm.replace(image, vsImage(message, resource)()))
        .use(math)
        .use(slash)
        .use(tooltip)
        .use(history)
        .use(listener)
        .use(emoji)
        .use(clipboard)
        .use(prism)
        .use(
            indent.configure(indentPlugin, {
                type: 'space',
            }),
        )
        .use(cursor)
        .use(trailing)
        .use(
            upload.configure(uploadPlugin, {
                uploader: async (files, schema) => {
                    const images: File[] = [];
                    const readImageAsBase64 = (file: File): Promise<{ alt: string; src: string }> => {
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.addEventListener(
                                'load',
                                () => {
                                    resolve({
                                        alt: file.name,
                                        src: reader.result?.toString().split(',')[1] as string,
                                    });
                                },
                                false,
                            );
                            reader.readAsDataURL(file);
                        });
                    };

                    for (let i = 0; i < files.length; i++) {
                        const file = files.item(i);
                        if (!file) {
                            continue;
                        }

                        // You can handle whatever the file type you want, we handle image here.
                        if (!file.type.includes('image')) {
                            continue;
                        }

                        images.push(file);
                    }

                    const nodes: Node[] = await Promise.all(
                        images.map(async (image) => {
                            const { alt, src: base64 } = await readImageAsBase64(image);
                            const url = image.name;
                            message.upload(url, base64);
                            return schema.nodes.image.createAndFill({
                                src: url,
                                alt,
                            }) as Node;
                        }),
                    );

                    return nodes;
                },
            }),
        )
        .create();
