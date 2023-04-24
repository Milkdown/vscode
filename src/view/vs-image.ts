/* Copyright 2021, Milkdown by Mirone.*/
// import { NodeView } from '@milkdown/prose/view';
// import type { ResourceManager } from './resource-manager';

// import type { ClientMessage } from './client-message';

import { customElement } from 'lit/decorators.js';
import { ShallowLitElement, useNodeViewContext } from '@prosemirror-adapter/lit';
import { ResourceManager } from './resource-manager';
import { ClientMessage } from './client-message';
import { html } from 'lit';
import { until } from 'lit/directives/until.js';

@customElement('milkdown-vs-image')
export class VsImage extends ShallowLitElement {
    nodeViewContext = useNodeViewContext(this);
    resource = ResourceManager.Instance;
    message = ClientMessage.Instance;

    private get ctx() {
        const ctx = this.nodeViewContext.value;
        if (!ctx) {
            throw new Error();
        }
        return ctx;
    }

    private get node() {
        const { node } = this.ctx;
        return node;
    }

    private getUrl() {
        const { src } = this.node.attrs;

        const promise = this.resource.add(src);
        this.message.getResource(src);
        return promise;
    }

    override render() {
        const image = this.getUrl().then((src) => html`<img src="${src}" />`);

        return html`${until(image)}`;
    }
}
