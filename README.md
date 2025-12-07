# Milkdown 💖 VSCode

Edit or view markdown in a WYSIWYG way, powered by [milkdown](https://saul-mirone.github.io/milkdown/#/).

> **Note**  
> This repository is a fork of [Saul-Mirone/milkdown-vscode](https://github.com/Saul-Mirone/milkdown-vscode).  
> We follow the upstream structure/design and add our own tweaks here while keeping attribution and licensing intact.

## Install

[VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=mirone.milkdown)

## Features

> Plugin is still in dev progress, this is an early access version.

![Show](https://raw.githubusercontent.com/Saul-Mirone/milkdown-vscode/main/milkdown-vscode.gif)

### Usage:

-   Right click an `.md` file and choose **Open With... → Milkdown Viewer**.
-   Or open the file and select **More Actions... → Open With...** from the editor tab and choose **Milkdown Viewer**.
-   (Optional) Set it as the default markdown editor via `workbench.editorAssociations` (see below).

### Feature List

-   WYSIWYG Markdown Editor
-   Full GFM syntax support
-   Emoji picker and filter
-   Copy and paste with markdown
-   Slash commands
-   Tooltip bar
-   Math support
-   Edit/View toggle button for quick read-only mode

### Set as Default

If you want to use Milkdown Viewer as your default markdown editor, you can add this config into your settings:

```json
"workbench.editorAssociations": {
    "*.md": "milkdownViewer.editor"
}
```

# Contributor

<a title="Saul Mirone" href="https://github.com/Saul-Mirone"><img src="https://avatars.githubusercontent.com/u/10047788?v=4" width="100" alt="profile picture of Saul Mirone"></a>
<a title="calvinfung" href="https://github.com/hereisfun"><img src="https://avatars.githubusercontent.com/u/20593467?v=4" width="100" alt="profile picture of calvinfung"></a>

## License

Released under the [MIT License](./LICENSE).  
Original work by [Saul Mirone](https://github.com/Saul-Mirone) is also MIT-licensed; please keep the LICENSE file when redistributing.
