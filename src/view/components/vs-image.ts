/* Copyright 2021, Milkdown by Mirone.*/

import { customElement } from 'lit/decorators.js';
import { html } from 'lit';
import { until } from 'lit/directives/until.js';

import clsx from 'clsx';
import { LitNodeView } from '../utils/lit-node-view';

@customElement('milkdown-vs-image')
export class VsImage extends LitNodeView {
    private getUrl() {
        const { src } = this.node.attrs;

        const promise = this.resource.add(src);
        this.message.getResource(src);
        return promise;
    }

    override render() {
        const { selected } = this.ctx;
        const image = this.getUrl().then(
            (src) => html`<img class=${clsx('m-0', selected && 'ProseMirror-selectednode')} src="${src}" />`,
        );

        return html`${until(image)}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'milkdown-vs-image': VsImage;
    }
}
