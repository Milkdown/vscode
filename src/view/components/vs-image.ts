/* Copyright 2021, Milkdown by Mirone.*/

import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { until } from 'lit/directives/until.js';

import clsx from 'clsx';
import { LitNodeView } from '../utils/lit-node-view';

@customElement('milkdown-vs-image')
export class VsImage extends LitNodeView {
    private getUrl() {
        const { src } = this.attrs;

        const promise = this.resource.add(src);
        this.message.getResource(src);
        return promise;
    }

    private renderImage = (src: string) => {
        const { selected } = this.ctx;

        return html`<img class=${clsx('m-0 text-[0] inline', selected && 'ProseMirror-selectednode')} src="${src}" />`;
    };

    override render() {
        const image = this.getUrl().then(this.renderImage);

        return html`${until(image)}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'milkdown-vs-image': VsImage;
    }
}
