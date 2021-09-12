import { injectGlobal } from '@emotion/css';
import { themeFactory } from '@milkdown/core';
import { color } from './color';
import { view } from './view';
import { mixin } from './mixin';
import { slots } from './slots';

export const vscode = () =>
    themeFactory({
        font: {
            typography: ['var(--vscode-font-family)'],
            code: ['var(--vscode-editor-font-family)'],
        },
        size: {
            radius: '4px',
            lineWidth: '1px',
        },
        color: color(),
        slots,
        mixin,
        global: ({ palette, font, mixin, size }) => {
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
                    font-family: ${font.typography};
                    margin-left: auto;
                    margin-right: auto;
                    ${mixin.shadow()};
                    padding: 4.5rem 1.25rem 1rem;
                    box-sizing: border-box;

                    .code-fence {
                        background: unset;
                        ${mixin.border()}
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
                        ${mixin.border()};
                    }

                    .math-src > div {
                        color: ${palette('neutral')};
                    }

                    & ::selection {
                        background: ${palette('secondary', 0.38)};
                    }
                }
            `;
        },
    });
