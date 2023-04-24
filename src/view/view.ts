/* Copyright 2021, Milkdown by Mirone.*/
import { html } from 'lit';
import { ShallowLitElement } from '@prosemirror-adapter/lit';
import { customElement } from 'lit/decorators.js';

export { ProsemirrorAdapterProvider } from '@prosemirror-adapter/lit';
export * from './components/editor';

import 'katex/dist/katex.min.js';

@customElement('milkdown-app')
export class MilkdownApp extends ShallowLitElement {
    override render() {
        return html`
            <prosemirror-adapter-provider>
                <milkdown-editor></milkdown-editor>
            </prosemirror-adapter-provider>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'milkdown-app': MilkdownApp;
    }
}

// function main() {
//     window.addEventListener('message', (event) => {
//         const message = event.data;
//         switch (message.type) {
//             case 'update': {
//                 const text = message.text;
//                 editor.update(text);
//                 return;
//             }
//             case 'resource-response': {
//                 resource.resolve(message.origin, message.result);
//                 return;
//             }
//         }
//     });

//     editor.create();
// }

// main();
