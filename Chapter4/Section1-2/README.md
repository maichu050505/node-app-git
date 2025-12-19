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

## Express ジェネレーターのスクリプト解説(ex-gen-app/app.js)

1. 必要なモジュールをロード

```js
var createError = require("http-errors"); // HTTPエラーの対処を行うもの
var express = require("express"); // Expressの本体。
var path = require("path"); // ファイルパスを扱うもの。
var cookieParser = require("cookie-parser"); // クッキーのパース（値を変換する処理）に関するもの。
var logger = require("morgan"); // HTTPリクエストのログ出力に関するもの。
```

2. ルート用のモジュールのロード

```js
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
```

- routes フォルダの中の index.js と users.js というスクリプトファイルをロードしている。

3. Express オブジェクトの作成と基本設定

```js
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
```

- app.set は、アプリケーションで必要とする各種設定情報をセット。
- views は、テンプレートファイルが保管されている場所を設定。
- view engine は、テンプレートエンジンの種類を設定。

4. app.use による関数組み込み

```js
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
```

- app.use は、アプリケーションで利用する関数を設定するためのもの（ミドルウェア）。アプリケーションにアクセスした際に実行される処理を組み込むためのもの。
- ここでは require でロードした各種のモジュールの機能を組み込んでいる。これらを組み込むことで、Web ページにアクセスした際の基本的な処理が行われるようになる。

5. アクセスのための app.use を作成

```js
app.use("/", indexRouter);
app.use("/users", usersRouter);
```

- ここでは、"/"と"users"に、それぞれ indexRouter と usersRouter を割り当てている。先ほど require でロードした index.js と users.js の内容を保管している変数を、app.use で指定のアドレスに割り当てることで、そのアドレスにアクセスしたら、設定されたモジュールにある処理を呼び出すという関連付けがされる。

6. その他のアクセス処理

- (1): エラーコード 404 用（Not Found）のエラー処理

```js
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
```

- (2): それ以外のエラー処理

```js
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
```

- これまでの app.use で設定されたアドレス以外のところにアクセスした際に呼び出される。

7. module.express の設定

```js
module.exports = app;
```

- app は express オブジェクトが入った変数。これを module というモジュール管理のオブジェクトの「exports」というプロパティに設定する。
- exports というのは、外部からのアクセスに関するもので、こうすることで設定したオブジェクトが外部からアクセスできるようになる。
- Express ジェネレーターのスクリプトで最後に必ずやっておくもの！

## Express ジェネレーターの index.js の解説（routes/index.js）

```js
var express = require("express");
var router = express.Router();
```

- require('express')で Express をロードした後、Router というメソッドを呼び出す。これは、Router オブジェクトを生成するもので、ルーティングに関する機能をまとめたもの。

1. router.get について

```js
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
```

- router.get というメソッドで、"/"にアクセスした際の表示(res.render でレンダリングする)を行っている。
- Express ジェネレーターを使わずに書く方法では、下記の app.get を使っていたが、これと同じもの。

```js
app.get("/", (req, res) => {
  res.send("Welcome to Express!");
});
```

- 使い方：router.get(アドレス, 関数);

2. render によるレンダリング

```js
res.render("index", { title: "Express" });
```

- 関数内で行っているのは、request の render でレンダリングを行う作業。第一引数にテンプレートファイルの名前を書く。.ejs は不要。
- { title: "Express" }この部分は、views/index.ejs の<%= title %>の部分で使われている変数に渡している。

3. module.express の設定

```js
module.exports = router;
```

- 最後のおまじない。

## Express ジェネレーターの bin/www ファイルの解説

- プログラムを実行するためのコマンドのような役割を果たしている。

```js
/**
 * Module dependencies.
 */

var app = require("../app");
var debug = require("debug")("ex-gen-app:server");
var http = require("http");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
```

- app.js と、ex-gen-app:server, http といったモジュールをロードしている。
- そして、port というポート番号を示す値を設定し、createServer でサーバーを実行する。
- 引数に app という変数が指定されている。これは createServer でサーバーを作り、app を実行するという働きをする。
- 後は、listen で待受状態にしておき、server の on を使ってイベントの処理を設定している。ここでは、error と listening という 2 つのイベントを設定。これでエラー時と待ち受け状態の時の処理を行うようにする。

## Express ジェネレーターの、app.js と routes 内のモジュールの役割分担

- www は、ただサーバーを起動するためのもの。実際にサーバーが起動した後の処理は何もない。
- app.js は、Web アプリケーション本体の設定に関するもの。実行するアプリケーションの基本的な設定などを行う。
- 実際に特定のアドレスにアクセスした時の処理は、routes フォルダ内に用意したスクリプト（モジュール）で行う。

## Express ジェネレーターで、Web ページを追加する

1. テンプレートを作成する

- views フォルダの中に hello.ejs を作成。

2. ルーティング用のスクリプトを作成。

- routes フォルダの中に、hello.js を作成。/hello にアクセスした際の処理を行うスクリプトファイル。

```js
var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  const data = {
    title: "Hello!",
    content: "これはサンプルのコンテンツです。<br>this is sample content.",
  };
  res.render("hello", data);
});

module.exports = router;
```

- ここの router.get("/")の/とは、/hello 以降のアドレスになる。
- つまり、router.get("/ok", )の場合は、/hello/ok の GET 処理となる。

3. app.js の修正

- app.js に hello.js をモジュールとしてロードし、アドレスへ割り当てる処理を追加する。

```js
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var helloRouter = require("./routes/hello"); // ここを追加

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/hello", helloRouter); // ここを追加
```

4. npm start で実行する。http://localhost:3000/hello にアクセスできる。
