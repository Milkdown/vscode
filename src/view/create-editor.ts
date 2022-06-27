import { defaultValueCtx, Editor, rootCtx, ThemeImageType } from '@milkdown/core';
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
import { PluginKey } from '@milkdown/prose/state';
import { NodeView } from '@milkdown/prose/view';
import type { ResourceManager } from './resource-manager';

import { vscodeTheme } from '../theme-vscode';
import type { ClientMessage } from './client-message';

import 'katex/dist/katex.min.js';

const key = new PluginKey('MILKDOWN_IMAGE_INPUT');
const vsImage = (message: ClientMessage, resource: ResourceManager) =>
    image.extend((original, utils, options) => {
        return {
            ...original,
            view: () => (node) => {
                let currNode = node;

                const placeholder = options?.placeholder ?? 'Add an Image';
                const isBlock = options?.isBlock ?? false;
                const renderer = utils.themeManager.get<ThemeImageType>('image', {
                    placeholder,
                    isBlock,
                });

                if (!renderer) {
                    return {} as NodeView;
                }

                const { dom, onUpdate } = renderer;

                const updateLink = () => {
                    const promise = resource.add(currNode.attrs.src);
                    message.getResource(currNode.attrs.src);
                    promise.then((url) => {
                        if (url !== currNode.attrs.src) {
                            const image = dom.querySelector('img');
                            if (image) {
                                image.setAttribute('src', url);
                            }
                        }
                    });
                };

                onUpdate(currNode);
                updateLink();

                return {
                    dom,
                    update: (updatedNode) => {
                        if (updatedNode.type.name !== 'image') return false;

                        currNode = updatedNode;
                        onUpdate(currNode);
                        updateLink();

                        return true;
                    },
                    selectNode: () => {
                        dom.classList.add('ProseMirror-selectednode');
                    },
                    deselectNode: () => {
                        dom.classList.remove('ProseMirror-selectednode');
                    },
                };
            },
        };
    });

export const createEditor = (vscode: any, message: ClientMessage, resource: ResourceManager) =>
    Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('app'));
            const state = vscode.getState();
            if (state?.text) {
                ctx.set(defaultValueCtx, state.text);
            }
            ctx.get(listenerCtx)
                .markdownUpdated((_, markdown) => {
                    vscode.setState({ text: markdown });
                    message.update(markdown);
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
        .create();
