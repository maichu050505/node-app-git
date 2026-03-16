# API + AjaxでMarkdownツールを開発する

## フロントエンドとバックエンドの分離
- Ajaxとは、Asynchronous JavaScript + XML の略。つまり、非同期JavaScriptとXMLという意味。（現在はXMLはあまり使われていない）
- JavaScriptの非同期でサーバーにアクセスする機能を使い、バックグラウンドでサーバーにアクセスして必要な情報をやり取りして動く。
- Ajaxを利用する場合、フォームを送信せず、情報をサーバーに送信できる。ページを遷移したりリロードする必要がない。表示されているページが、そのままに必要なところだけ情報が更新されていく。
- アプリをフロントエンドとバックエンドにわけ、両者をAjaxで繋ぐ。
- フロント側では、Ajaxという技術を使い、サーバーにアクセスして結果を取得する。そしてサーバー側は、すべての機能をAPIと呼ばれる形で整理して実装する。
- APIとは、アプリケーションの機能を外部から呼び出して利用できるようにしたインターフェイス。Webの基本的なプロトコルであるHTTPを使って必要な情報を受け取り、呼び出した側に必要な情報を返信します。データのやり取りは、XMLやJSONが使われる。最近ではJSONを使ってやり取りすることが多い。

## Web APIとしてのExpress
- サーバー側は、Web APIとして利用できるような形で処理を用意する。Expressを利用している場合、簡単に実装できる。
- Expressでは、各パスにアクセスした際の処理を、router.getなどで作成した。そこはAPIも同じ。結果をテンプレートのレンダリング(res.render('パス', data))を使って返さずに、JSONデータとして返せば良い。
```js
router.get(パス, (req, res, next) => {
  // 必要な処理
  res.json(オブジェクト);
})
```
- router.postの場合も、必要な処理を行ったあと、クライアント側に返す情報をオブジェクトにまとめ、res.jsonに引数として渡して実行すれば良い。これにより、引数のオブジェクトがJSONフォーマットのテキストに変換された値がクライアント側に送信される。あとは、それを受けとったクライアント側でJSONデータからオブジェクトを生成して利用する。

## Ajaxとfetchの関係
- クライアント側は、Webページの中からサーバーにAjaxでアクセスするには、fetchという非同期関数を使う。
- fetchの基本形：`fetch(アクセス先).then(引数 => {処理})`
- 引数には、アクセスするURLをテキストで指定する。非同期なので、thenメソッドの引数にコールバック関数を用意する。
- コールバック関数では、サーバーからのレスポンスを示すResponseというオブジェクトが引数として渡される。jsonメソッドで、受け取った情報をJSONフォーマットとして解析し、javaScriptのオブジェクトとして取り出す。
- <<Response>>.json().then(引数 => {処理});
- さらに、このjsonメソッドも非同期なので、thenでコールバック関数を用意し、そこで結果を引数として受け取る。そして、引数で得られたオブジェクトから必要な情報を取り出して処理する。
つまり、
```js
fetch("/api/example")
  .then(res => res.json()) // このresがResponseオブジェクト。resは変数名なので、responseやrでも同じ。ここでは、ただサーバーからのレスポンスからjsonを呼び出すだけ。
  .then(data => {
    // data を使って処理
  })
  .catch(err => {
    console.error(err);
});
```
もしくは、
```js
async function loadData() {
  try {
    const res = await fetch(アクセス先);
    if (!res.ok) {
      throw new Error("HTTP error " + res.status);
    }
    const data = await res.json();
    // data を使って処理
  } catch (err) {
    console.error(err);
  }
}
```

### postとオプション情報
- クライアント側から情報をサーバーに送信し処理を呼び出す場合は、POSTなどをを利用する。
- fetch関数は、デフォルトではGETでアクセスする。POSTの場合は、オプションの設定情報を用意する必要がある。
- オプション設定方法；`fetch(アクセス先, オブジェクト).---`
- fetchの第二引数に、各種のオプション設定の情報をまとめたオブジェクトを用意する。このオブジェクトには、アクセスの際に使われるヘッダー情報や、サーバーに送信するコンテンツなどをまとめる。下記のような感じ。
```js
{
  method: "POST",// アクセスに使うHTTPメソッド。GETの場合は省略可。他に、"POST" / "PUT" / "DELETE" など
  headers: {
    "Content-Type": "application/json",// JSONを送るならこれ。
  },
  body: JSON.stringify({ name: "太郎", age: 20 }),// 送りたいデータ。JSON のときは JSON.stringify(オブジェクト) で文字列にする。
}
```
- 全体では、下記のような形になる。
```js
fetch("/api/example", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "太郎", age: 20 }),
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```
- または、async/await で書くと、
```js
async function sendData() {
  try {
    const res = await fetch("/api/example", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "太郎", age: 20 }),
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

sendData();
```
- ちなみに、サーバー側は下記のようになる。
```js
// express.json() ミドルウェアで body をパースしている前提
router.post("/api/example", (req, res) => {
  const { name, age } = req.body;  // 送った { name: "太郎", age: 20 } が入る

  // 何か処理（DB に保存など）
  // ...

  res.json({ success: true, message: "受け取りました" });
});
```

## Markdown管理ツールを作成してみる！
- 実際に、Ajax + APIを使ったアプリを作成する。
- Markdownとは、技術系のドキュメントを書くための簡易言語。
- このMarkdownを使って記述したドキュメントをデータベースに保存し、いつでも検索し表示できるようにするツールを作成する。

### トップページ
- ログインしたユーザー名が表示
- そのユーザーが投稿したMarkdownドキュメントの一覧が表示
- 新規ドキュメントを投稿できるフォーム
- 一覧から見たいドキュメントをクリックすると、フォームに、その内容が表示される。
- 編集して更新ボタンを押せば、更新もできる。
- フォームの下に、プレビューも表示される。

### 1, markdown-itをインストール
- 既存のex-gen-appにて、`npm install markdown-it`を実行。
- 最終的には、下記のパッケージが必要。
```json
"dependencies": {
    "@prisma/adapter-better-sqlite3": "^7.4.0",
    "@prisma/client": "^7.3.0",
    "better-sqlite3": "^12.6.2",
    "cookie-parser": "~1.4.6",
    "debug": "~4.3.4",
    "ejs": "~3.1.9",
    "express": "~4.18.2",
    "express-session": "^1.19.0",
    "express-validator": "^7.3.1",
    "http-errors": "~2.0.0",
    "markdown-it": "^14.1.1",
    "morgan": "~1.10.0"
  },
  "devDependencies": {
    "prisma": "^7.3.0"
  }
```

### 2. モデルを作成する
- schema.prismaに、Markdataモデルを作成する
```
model Markdata {
  id Int @id @default(autoincrement())
  title String
  content String
  account User @relation(fields: [accountId], references: [id])
  accountId Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
- Userモデルの最後に、`markdata Markdata[]`を追加。
- マイグレーションを実行する。`npx prisma migrate dev --name initial`
- `npx prisma generate`で、Prisma Client を再生成する。

### 3. app.jsの設定

#### body-parser
- 本では、Body Parserを利用するためのコードを追加。
- Body Parserとは、HTTP リクエストの「本体（body）」を解釈して、req.body で使える形にしてくれるミドルウェア。クライアントが POST で送るデータ（フォームや JSON）は、リクエストの body に入ってくる。生のままでは「文字列の塊」なので、そのままでは使いづらい。body parser がその文字列を解釈して、オブジェクト（例: { name: "太郎", age: 20 }）に変換する。
- 昔は、Express では、Body Parser というパッケージをインストールして利用する。Express ジェネレーターでは標準で Body Parser が組み込み済み。（今回はExpressジェネレーターで作っている）
- node_modules/express/lib/express.js に、下記の処理が入っている。
- Next.jsでは不要。
- ここでは、URLエンコーディング（日本語や記号、スペースなどを%E6%97%A5みたいな文字列に変換する）をONに、JSONフォーマットのパース処理をONにする。
- app.jsに、`const bodyParser = require("body-parser");`を追加。
- app.jsに、`app.use(bodyParser.urlencoded({ extended: true }));`と`app.use(bodyParser.json());`を追加。
- しかし、Express4.16以降は、body のパース用の機能が Express 本体に入っているので、body-parserは不要。
- app.jsでは、Express本体のミドルウェアだけを使う。
```js
const express = require("express");
const app = express();

app.use(express.json());                           // JSON の body 用
app.use(express.urlencoded({ extended: false }));  // フォームの body 用
```
これだけで、body-parserでやっていたことができる。上記コードはExpressジェネレーターで作ったapp.jsにすでに書いてある。

#### この後作成する、API用のルーター処理（api.js）の組み込み処理を追加
```js
const apiRouter = require('./routes/api');
app.use('api', apiRouter);
```

### 4. api.jsでAPI処理を作成する
- routes/api.jsを作成。
- 上の方で、MarkdownItをインストール
```js
// Markdown-itをインストール
const markdown = require("markdown-it");
const md = new markdown();
```
- ログインのチェック関数を作る。
```js
function checkLogin(req, res) {
  if (req.session.login == null) {
    req.session.back = "/";
    return true;
  } else {
    return false;
  }
}
```
- APIエンドポイントへ直接アクセスして処理を呼び出すような使い方もできなければいけないので、/api/check/にアクセスしたら、ログインのチェック関数を呼び出して結果をJSONで返す処理を作る。
```js
// ログインチェック
router.get("/check", (req, res) => {
  if (checkLogin(req, res)) {
    // ログインしていない場合は、result: falseを返す。
    res.status(401).json({ result: false });
  } else {
    // ログインしている場合は、result: trueを返す。
    res.json({ result: req.session.login.name });
  }
});
```
- 全データ取得
- 指定IDのデータを取得
- 新規データ作成
- 更新
- Markdataのレンダリング結果（Markdownで書かれたコンテンツをHTMLのコードにレンダリングする処理）
```js
router.post("/mark/render", async (req, res) => {
  if (checkLogin(req, res)) {
    res.status(401).json({ result: false });
    return;
  }
  const { source } = req.body; // クライアントから送られてきた Markdown テキストを受け取る。source に Markdown 文字列が入る。
  const ren = md.render(source); // Markdown-it で Markdown 文字列を HTML に変換する。（レンダリング）
  const result = { render: ren }; // 変換結果をJSのオブジェクトにする。
  res.json(result); // それをJSON形式でクライアントに返す。
});
```

### 5. フロントエンドの作成

#### ログインページの作成
- 新たに作る場合は、public/login.htmlを作成。`<form method="post" action="/users/login">`のフォームを設置。名前とパスワードとログインボタンを設置。

#### index.htmlを作成
- public/index.htmlを作成。
- 本では、JavaScriptコードもこのindex.htmlに書いているが、本番に近いやり方で、JSコードは、public/js/main.jsに書く。
