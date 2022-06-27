/* Copyright 2021, Milkdown by Mirone.*/
import { ThemeImageType } from '@milkdown/core';
import { image } from '@milkdown/preset-gfm';
import { NodeView } from '@milkdown/prose/view';
import type { ResourceManager } from './resource-manager';

import type { ClientMessage } from './client-message';

export const vsImage = (message: ClientMessage, resource: ResourceManager) =>
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
