/* Copyright 2021, Milkdown by Mirone.*/

module.exports = {
    content: ['./src/view/**/*.{ts,css}'],
    theme: {
        extend: {
            typography: () => ({
                DEFAULT: {
                    css: {
                        '--tw-prose-body': 'var(--vscode-foreground)',
                        '--tw-prose-headings': 'var(--vscode-foreground)',
                        '--tw-prose-bold': 'var(--vscode-foreground)',
                        '--tw-prose-quotes': 'var(--vscode-foreground)',
                        '--tw-prose-links': 'var(--vscode-textLink-activeForeground)',
                        '--tw-prose-code': 'var(--vscode-textPreformat-foreground)',
                        '--tw-prose-quote-borders': 'var(--vscode-textBlockQuote-border)',
                    },
                },
            }),
        },
    },
    plugins: [require('@tailwindcss/typography')],
};
