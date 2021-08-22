const varMap = {}

/**
 * hack for accessing theme's colors programmatically
 * https://github.com/microsoft/vscode/issues/32813#issuecomment-798680103
 */
Object.values(document.getElementsByTagName('html')[0].style)
    .map(
        (rv) => {
            return {
                [rv]: document
                    .getElementsByTagName('html')[0]
                    .style.getPropertyValue(rv),
            }
        }
    )
    .forEach(varObj => {
        for (let key in varObj) {
            if (varObj[key]) {
                varMap[key] = varObj[key]
            }
        }
    })


// use #000000 as default value for high contrast theme
export const color = {
    shadow: varMap['--vscode-widget-shadow'] || '#000000',
    primary: varMap['--vscode-textBlockQuote-border'],
    secondary: varMap['--vscode-textLink-foreground'],
    neutral: varMap['--vscode-foreground'],
    solid: varMap['--vscode-icon-foreground'],
    line: varMap['--vscode-textBlockQuote-border'],
    background: varMap['--vscode-textBlockQuote-background'] || '#000000',
    surface: varMap['--vscode-editor-background'],
};
