# Express を利用しよう

- Express とは、アプリケーションフレームワーク。
- 比較的軽いフレームワークで、Node.js の開発効率を劇的にアップしてくれる。

## Express ジェネレーター

- Express アプリの「ひな形（初期構成）」を自動で作ってくれる公式ツール
- ただし、実務では使わない。構成がやや古い。（学習向け）
- インストール方法：

1. 本では、
   「npm install -g express-generator」を実行し、その後「express --view=ejs ex-gen-app」を実行と書いてあるが、これは昔の方法。
   ・グローバルにインストール
   ・どの場所でも express コマンドが使える
2. 今の方法
   「npx express-generator --view=ejs ex-gen-app」
   ・インストール不要
   ・グローバル環境を汚さない
   ・バージョンの不一致トラブルが少ない
   ・Node / npm の公式推奨フロー
   ※ 「--view=ejs」は、EJS を使う場合にだけ必要。テンプレートファイルに ejs を使う場合は入れる。
   ※ ex-gen-app は、プロジェクト名（生成されるフォルダ名）。
   → package.json が生成されるので、使用パッケージ類を最新バージョンに直す。

- cd フォルダ名 で移動し、npm install で、package.json のパッケージを全てインストールする。
- 「npm start」で、アプリケーションを起動する。
  > ex-gen-app@0.0.0 start
  > node ./bin/www
  > と表示されれば OK。
  > Express ジェネレーターで作られたアプリは、起動スクリプトは「bin」フォルダの中の「www」という名前で作られる。これを実行するとアプリが起動する。
  > ただし、package.json に「start」というスクリプトが定義されているので、「npm start」で起動できる。
  > http://localhost:3000/ でデフォルトページを確認。

## Express ジェネレーターのファイル構成

- bin フォルダー：
  アプリケーションを実行するためのコマンドとなるファイルが保管されている。この中の www というファイルがアプリケーションを実行するためのコマンド。
- node_modules フォルダー：
  Node.js のパッケージ類がまとめて保管されている。npm install を実行すると自動生成される。
- public フォルダー：
  公開ディレクトリ。ここにあるものは URL を指定して直接アクセスできる。
- routes フォルダー：
  各アドレスの処理が用意されている。用意されているページのアドレスごとにスクリプトファイルが作成されている。ここにファイルを追加することで、ルーティング（アドレスと実行するスクリプトの関連付け）を追加していくことができる。
- views フォルダー：
  テンプレートファイルをまとめておくところ。デフォルトで index.ejs と error.ejs というファイルが用意されている。
- app.js:
  メインプログラム。アプリケーション本体部分。
- package.json:
  必要なライブラリの情報など。

## もう一つの Express 開発方法(Express ジェネレーターを使わない方法)

- アプリケーションを作る場所に、カレントディレクトリを移動し、アプリケーションのフォルダを作成する。（ここでは、「express-app」という名前にする）
- cd express-app でフォルダ内に移動する
- npm init を実行（npm の初期化）
- 「package name: (express-app) 」と聞かれるので、この名前でよければそのまま Enter を押す。
- 次々尋ねてくるので、基本的には全て Enter を押す。
  「version: (1.0.0) 」「description: 」「entry point: (index.js) 」「test command: 」「git repository: 」「keywords: 」「author: 」「license: (ISC) 」
- 全て Enter を押すと、設定した内容が表示され、「Is this OK? (yes) 」と聞かれるので、そのまま Enter を押すと npm の初期化が完了する。
- 初期化すると package.json が生成される。
- 「npm install express」で Express をインストールする。
- express-app フォルダに、index.js というファイルを新規作成する。（メインプログラム）

```js
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to Express!");
});

app.listen(3000, () => {
  console.log("Start server port:3000");
});
```

- 方法 ②：ES Modules として正しく設定する（今風）
  ① package.json に追加

```
{
  "type": "module"
}
```

（既存の項目があれば、その中に追加）

② index.js
const express = require("express");ではなく、
import express from "express";を使用。

③ 実行
node index.js

## index.js のコードを解説

1. express オブジェクトの用意

```js
const express = require("express");
```

もしくは、

```js
import express from "express";
```

2. アプリ(app オブジェクト)の作成

```js
const app = express();
```

express オブジェクトは、そのまま関数として実行できる。
これを設定した変数 app を使って、アプリケーションの処理を行っていく。

3. ルーティングの設定

```js
app.get("/", (req, res) => {
  res.send("Welcome to Express!");
});
```

トップページにアクセスできるようにルーティングを設定。
app オブジェクトの get というメソッドを呼び出している。
app.get(パス, 実行する関数);
第一引数に割り当てるパスを指定、第二引数に、アクセスした時に実行する関数を指定。
(req, res) => {
res.send("Welcome to Express!");
}
引数の req, res は、Node.js の request、response とは違うもの（Express 独自のオブジェクト）ですが、基本的にリクエストとレスポンスの機能や情報をまとめたものという点は同じ。
res.send(表示するテキスト); で、引数に指定したテキストがそのまま表示される。
send メソッドは、クライアントに送信するボディ部分（実際に画面に表示されるコンテンツ部分）の値を設定する。

4. 待ち受け開始

```js
app.listen(3000, () => {
  console.log("Start server port:3000");
});
```

app オブジェクトの listen メソッドを使う。第一引数に、ポート番号、第二引数に、待ち受け開始後に実行されるコールバック関数を指定。
Node.js の http.Server にあった listen と同じ働き。
