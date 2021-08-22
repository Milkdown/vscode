import { injectGlobal } from '@emotion/css';
import { themeFactory } from '@milkdown/core';
import { color } from './color';
import { view } from './view';
import { widget } from './widget';

export const vscode = () =>
    themeFactory({
        font: {
            font: ['var(--vscode-font-family)'],
            fontCode: ['var(--vscode-editor-font-family)'],
        },
        size: {
            radius: '4px',
            lineWidth: '1px',
        },
        color: color(),
        widget,
        global: ({ palette, font, widget, size }) => {
            var _a, _b;
            const css = injectGlobal;
            css`
                body {
                    padding: 0;
                }
                ${view};
                .milkdown {
                    background: ${palette('surface')};
                    min-height: 100vh;

                    position: relative;
                    font-family: ${font.font};
                    margin-left: auto;
                    margin-right: auto;
                    ${(_a = widget.shadow) === null || _a === void 0 ? void 0 : _a.call(widget)};
                    padding: 1.25rem;
                    box-sizing: border-box;

                    .code-fence {
                        background: unset;
                        ${widget.border?.()}
                    }

                    .editor {
                        outline: none;
                        height: 100%;

                        & > * {
                            margin: 1.875rem 0;
                        }

                        h1,
                        h2,
                        h3,
                        h4,
                        h5,
                        h6 {
                            margin-top: 24px !important;
                            margin-bottom: 16px !important;
                            font-weight: 600;
                            line-height: 1.25;
                        }
                        h1 {
                            padding-bottom: 0.3em;
                            font-size: 2em;
                        }
                        h2 {
                            padding-bottom: 0.3em;
                            font-size: 1.5em;
                        }
                        h3 {
                            font-size: 1.25em;
                        }
                        h4 {
                            font-size: 1em;
                        }
                        h5,
                        h6 {
                            font-size: 0.875em;
                        }
                    }
                    .ProseMirror.editor > :first-child {
                        margin-top: 0 !important;
                    }

                    .ProseMirror-selectednode {
                        outline: ${size.lineWidth} solid ${palette('line')};
                    }

                    li.ProseMirror-selectednode {
                        outline: none;
                    }

                    li.ProseMirror-selectednode::after {
                        ${(_b = widget.border) === null || _b === void 0 ? void 0 : _b.call(widget)}
                    }

                    & ::selection {
                        background: ${palette('secondary', 0.38)};
                    }
                }
            `;
        },
    });
