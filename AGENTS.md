# 開発メモ / ガイドライン

- このリポジトリは Milkdown 公式 VS Code 拡張 (`yuya296/vscode-markdown`) をベースにしている。フォルダ構成やビルドフロー（pnpm/tsup）など upstream の設計を尊重する。
- `src/main` は VS Code 側のエントリーポイント群。`extension.ts` → `provider.ts` → `template.html.ts` という流れで Webview を初期化する構造を維持する。
- `src/view` は Webview (Milkdown) 側。`editor-manager.ts` で Milkdown インスタンスを管理し、`view.ts` がバンドルの入口。Milkdown の設定は `editor-config` 以下のプリセットを編集する形で拡張する。
- ビルド／開発は upstream と同じく `pnpm` を使う。`pnpm install` → `pnpm dev`（watch）／`pnpm build` の手順、`tsup` によるバンドルを崩さない。
- UI カスタマイズは段階的に行う。まずは upstream と同じデフォルト UI/UX を維持し、必要な変更はテーマやプラグインを追加する形で行う。
- README / CHANGELOG は upstream の表現を踏襲しつつ、差分が生じた場合のみ追記する。
- いずれフォーク元に PR を返す可能性があるので、ライセンス表記やクレジットは削除しない。
- このリポジトリは MIT ライセンス。再頒布時は `LICENSE` を必ず同梱し、著作権表示・許諾条件を改変しない。
