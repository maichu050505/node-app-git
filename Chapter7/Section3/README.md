# Reactでフロントエンドを作成する

## create-react-app
- 本では、`npm install -g create-react-app`でパッケージをインストールしている。
- 現在では非推奨。今回は、Viteで作る。
- `npm create vite@latest プロジェクト名 --template react`を実行

## Reactの基本コード
- index.html: 起動ページ。このWebページにReactのスクリプトが読み込まれ、表示が作成されていく。あまり編集しない。
- src/main.jsx: index.htmlに読み込まれ、<body>内に埋め込まれる、Reactのベースとなる部分。あまり編集しない。
- src/App.jsx: 実際にWebページに表示されるReactのコンテンツ部分。開発を行うのはこの部分。

## src/App.jsxを修正
- ex-gen-app/public/js/main.jsと、ex-gen-app/public/index.htmlの内容を、Reactで書いていく。
- ステートを使って、変数を作成。これで後から値を変更するとJSXに埋め込まれた部分が自動変更できる。
```js
const [mkdata, setMkdata] = useState([]);
const [title, setTitle] = useState("");
const [source, setSource] = useState("");
const [content, setContent] = useState("");
const [mode, setMode] = useState("新規作成");
const [editId, setEditId] = useState("");
const [accountId, setAccountId] = useState("");
```

## src/App.cssを修正する
- CSSを追加する。

## index.htmlに、Bootstrapを読み込ませる。
- `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" crossorigin="anonymous"/>`

## ReactアプリをExpressプロジェクトにビルドする
- ReactをビルドしてHTMLファイルを生成し、これをExpressプロジェクト側に書き出して統合する
- ReactをExpressプロジェクト内にビルドすると、Expressプロジェクトのpublic/index.htmlは使えなくなる。publicフォルダ内にあるファイルは全て書き換えられる。

## イジェクト(eject)
- Viteではこの手順は不要。
- create-react-appを使っているプロジェクトでは、イジェクトが必要
- `npm run eject`を実行すると、configというフォルダが生成される。ここにプロジェクトに関する細かな設定情報が書き出され、それを元にビルドされるようになる。
- config/path.jsを開き、`const buildPath = xx`の箇所を、`const buildPath = process.env.BUILD_PATH ||'../ex-gen-app/public';`に書き換える

## ビルドする
- `npm run build`を実行。distフォルダが生成される。
- distフォルダの中身を、Expressプロジェクトのex-gen-app/publicフォルダ内に入れる。
- ex-gen-appで、npm startを実行し、http://localhost:3000/にアクセスする。

## 方法2：別パスで React アプリを配信する
- トップは今まで通り EJS の画面で、
/markdown だけ React アプリにしたい、というケースもあると思います。
その場合は：
React 側でビルド（同じく npm run build）
dist/index.html を public/markdown/index.html みたいに置く

- Express のルートをこう設定：
```js
// React アプリ用のエントリを 1 本生やすパターン
app.get('/markdown/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/markdown/index.html'));
});
```
これで、/markdown 以下のルーティングは React Router 側に任せる ことができます。

## 方法3：開発中は Vite dev サーバー + Express の2つで動かす
開発中はビルド→コピーが面倒なので、
- フロント：Vite dev（npm run dev → http://localhost:5173）
- バック：Express（npm start → http://localhost:3000）
と分けて動かし、Vite 側から Express の /api を叩く構成にするのが一般的です。
そのときは、Vite の vite.config.(js|ts) の server.proxy を使います。

