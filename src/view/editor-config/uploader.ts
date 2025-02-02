/* Copyright 2021, Milkdown by Mirone.*/
import { upload, uploadConfig } from '@milkdown/kit/plugin/upload';
import type { Node } from '@milkdown/kit/prose/model';
import type { Editor } from '@milkdown/kit/core';
import type { ClientMessage } from '../utils/client-message';

export const useUploader = (editor: Editor, message: ClientMessage) => {
    editor
        .config((ctx) => {
            ctx.update(uploadConfig.key, (prev) => ({
                ...prev,
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
            }));
        })
        .use(upload);
};
