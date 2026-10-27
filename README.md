# suimeow portfolio

静的HTML/CSS/JavaScriptで動作するポートフォリオサイトです。ビルドツールは不要です。

## ローカルで確認する

`fetch()`でJSON/Markdownを読み込むため、HTMLファイルを直接開くのではなく、ローカルHTTPサーバーを使ってください。

Pythonが入っている場合、プロジェクトのフォルダで実行します。

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

## コンテンツの公開

各コンテンツは「インデックス」と「コンテンツ本体」の両方で公開フラグを管理します。表示するには両方を `true` にします。

- Work: `data/work/index.json` と各作品JSON
- Writing: `data/writing/index.json` と各記事Markdownのfront matter
- Log: `data/log/index.json` と各投稿Markdownのfront matter
- Sandbox: `data/sandbox/index.json` と各作品JSON

`published: false` はサイト画面で非表示にするだけです。公開リポジトリに保存したファイルの機密性を保証しません。

## Workを1件追加

1. `data/work/template.json` をコピーする。
2. `data/work/YYYY/MM/` に `unique-id.json` のような一意のファイル名で保存する。
3. JSONの `id`、`title`、`year`、`genre`、`thumbnail` などを記入する。
4. 公開する場合は作品JSONの `published` を `true` にする。
5. `data/work/index.json` の `items` に `{ "id": "unique-id", "file": "YYYY/MM/unique-id.json", "published": true }` を追加する。
6. コミットして公開を更新する。

## LogをTweet感覚で投稿する

1. サイトの `Log` ページ上部の `QUICK POST` に短文を入力（画像URLは任意）。
2. `Generate post files` を押すと、投稿Markdownファイルがダウンロードされ、`data/log/index.json` に追加する項目も生成されます。下書きは同じ端末・ブラウザに保存できます。
3. GitHub上で `data/log/YYYY/MM/` にMarkdownファイルをアップロードし、生成された項目を `data/log/index.json` の `items` 配列に追加します。
4. コミットすると公開されます。

**静的なGitHub Pagesサイトのため、フォームから直接全員に公開することはできません。** 生成した2つの変更をGitHubへコミットする必要があります。下書き保存は端末内だけで、別端末とは同期しません。スマートフォンからも使えるよう、入力項目を短くしています。

## Writing記事を1本追加

1. `data/writing/template.md` をコピーし、`data/writing/YYYY/MM/article-id.md` として保存する。
2. front matterのID・タイトル・日付・タグ・サムネイルを記入する。
3. 本文をMarkdownで書き、公開時は `published: true` にする。
4. `data/writing/index.json` にIDとファイルパスを追加し、登録側も `published: true` にする。
5. コミットする。

## Dropbox画像の貼り方

1. Dropboxで画像の共有リンクを取得する。
2. Workの `thumbnail.src` や詳細メディアの `src`、Logの `images`、WritingのMarkdown画像URLに貼る。
3. 画像が表示されない場合は、Dropboxの共有権限とリンク形式を確認する。

Dropboxの仕様や共有設定によっては表示できない場合があります。公開サイトに機密画像を置かないでください。リポジトリ内に移す場合は、`assets/` 以下の相対パスを指定します。

## GitHub Pagesへ公開・更新

1. GitHubでリポジトリを作成する。
2. このフォルダ内のファイルをリポジトリ直下へアップロードしてコミットする。
3. GitHubリポジトリの **Settings → Pages** を開く。
4. Build and deployment の Source を **Deploy from a branch** にし、ブランチ（通常は `main`）とフォルダ `/ (root)` を選択して保存する。
5. 表示されたURLを開いて確認する。
6. 更新時は編集したファイルをコミットする。数分後に公開サイトへ反映されることがあります。

## デモを削除

1. `data/work/index.json`、`data/log/index.json`、`data/writing/index.json`、`data/sandbox/index.json` からデモの登録項目を削除する。
2. `data/` 内の対応するデモJSON/Markdownファイルを削除する。
3. 不要なら `demo` と付いたファイルやフォルダも削除する。
4. コミットする。

この初期版はデモを `published: false` にしているため、初期状態ではサイト画面に表示されません。レイアウト確認のためデモを一時表示する場合は、インデックスとコンテンツ本体の両方を `true` にします。

## 注意点

- このサイトは静的サイトです。新規ファイルは自動検出されないため、インデックスへの登録が必要です。
- Markdown実装は必要な記法を対象とした軽量版で、CommonMark全仕様には対応しません。
- Dropboxのリンクは永続的なCDNを保証するものではありません。
- 外部動画の埋め込みは各サービスの仕様・プライバシー設定に依存します。
