# ソースコードの基本

## http オブジェクトを読み込む

```js
const http = require(`http`);
```

- http モジュールをロードして、http という変数（定数）に設定している。
- 変数 = require(モジュール名);
- require メソッド：モジュールのロードを行う。Node.js では、オブジェクトをモジュール化して管理し、必要に応じてロードし利用できるようにしている。（モジュールローディングシステム）
- http は、ネットワークの基本モジュール。ここでは http というモジュールをロードしている。http モジュールとは、HTTP アクセスをするための機能をまとめてあるもの。HTTP とは、Web サイトのデータをやり取りする時に使われているプロトコル（手続き）。
- Node.js のプログラムは、まず http をロードすることから始まる。

## サーバーオブジェクトの作成

```js
var server = http.createServer((request, response) => {
  response.end("Hello Node.js!");
});
```

- サーバーのオブジェクトは、http.Server というオブジェクトとして用意されている。このオブジェクトを作成するのが、
- 変数 = http.createServer(関数);
- http オブジェクトにある、createServer というメソッドを呼び出し,http.Server オブジェクトが作成され、変数に設定される。
- この createServer は、関数を 1 つ引数に用意しておく。関数の値を引数に指定して使う。
- この関数は、(request, response) => { 実行する処理 }
- この関数は、createServer で作成された http.Server オブジェクトがサーバーとして実行された時に必要なもの。つまり、ここに処理を用意しておくと、誰かがサーバーにアクセスしてきたら、必ずこの処理を実行することができる。
- response という引数：サーバーからクライアントへの返信に関するオブジェクト
- response.end("Hello Node.js!");の、.end()は、クライアントへの返信を終了するメソッド。引数にテキストが用意してあると、そのテキストを出力して返信を終える。
- createServer で用意される関数は、このように response のメソッドを使って、クライアントに表示する内容を出力する処理を用意する。

### request と response

- http.ClientRequest: request 引数に入っているオブジェクト。クライアントから送られてきた情報を管理するためのもの。
- http.ServerResponse: response 引数に入っているオブジェクト。サーバーから送り出される情報を管理するためのもの。

## 待ち受け

```js
server.listen(3000);
```

- http.Server の listen というメソッドで待ち受け状態にする。引数に使用するポート番号を指定。
- http://localhost:3000 にアクセスして確認。
- まとめ：Node.js でサーバーを作って動かすという基本手順。
  1. http の用意（http モジュールのロード）
  2. createServer で http.Server オブジェクトの作成
  3. 待ち受け開始

## HTML の出力方法

```js
const http = require("http");

var server = http.createServer((request, response) => {
  response.end('<h1 style="color:blue;">Hello World</h1>');
});

server.listen(3000);
```

## ヘッダー情報の設定

- ヘッダー情報とは、サーバーとクライアント間でやり取りする際に送られる見えない情報。その情報を元に、どんなデータが送られてくるかを解釈し処理をする。ex.使用言語、エンコード、データの種類（HTML など）
- サーバーからクライアントにデータを返信する際に、まずヘッダー情報として「どんなデータが返信されるか」を送っておけば、確実に必要な形式でデータが処理される。
- 2 つの方法がある。
  1. HTML の<head>内にタグを用意する
  2. http.ServerResponse のメソッドを使う
     ・ ヘッダー情報を設定：《ServerResponse》.setHeader(名前, 値);
     ・ ヘッダー情報を得る：変数 = 《ServerResponse》.getHeader(名前);
     ・ ヘッダー情報を出力する：《ServerResponse》.whiteHead(コード番号, メッセージ);
  - setHeader / getHeader は、ヘッダー情報から特定の項目の値を読み書きするもの。ヘッダー情報は、それぞれ名前と値がセットになっている。「〇〇という項目には、xx という値を設定する」という書き方。
  - writeHead は、ヘッダー情報をテキストで用意して直接書き出すためのもの。ステータスコードと呼ばれる番号をつけて出力する。
  - ステータスコードとは、アクセスに関する状況を表す番号で、正常にアクセスしていれば 200, エラーが発生していたらそのエラー番号を設定。

```js
const http = require("http");

var server = http.createServer((request, response) => {
  response.setHeader("Content-Type", "text/html");
  response.write('<!DOCTYPE html><html lang="ja">');
  response.write('<head><meta charset="UTF-8">');
  response.write("<title>Hello</title></head>");
  response.write("<body><h1>Hello World</h1>");
  response.write("<p>これはNode.jsのサンプルページです</p>");
  response.write("</body></html>");
  response.end();
});

server.listen(3000);
console.log("Server start!");
```

- 全部を end()の引数に入れると大変なので、.write()で短く区切って何度も出力する。
- .write()は、引数のテキストを出力するメソッド。

# HTML ファイルを使う

- 上記の.write()の方法だといずれ限界が来るので、HTML ファイルを読み込んで表示させる。（app3.js）

## fs オブジェクト

- ファイルを扱うオブジェクトは、File System オプション。これは fs というパッケージとして Node.js に用意されている。これを利用するには、
- 変数 = require('fs');
- このように require を実行して、オブジェクトを変数に取り込む。
- そして fs オブジェクト内にある readFile というメソッドでファイルを読み込む。
- fs.readFile(ファイル名, エンコーディング, 関数);
- readFile の第一引数に、読み込みファイル名、第二引数に、ファイルの内容のエンコーディング方式を指定、第三引数に、readFile が完了した後に実行する処理(関数)。
- readFile は、ファイルの大きさがどれだけ大きくても瞬時に実行を終え、次に進む。実際のファイルを読み込む作業はバックグラウンドで行われる。完了したタイミングで指定したコールバック関数を後から実行する（＝非同期的に実行される）。
  ・ 同期処理：通常の処理。処理を実行し、終わったら次に進む。完了するまで次の行に進まない。
  ・ 非同期処理：処理を実行したら、終わるのを待たずに次に進む。
- つまり readFile()の第 3 引数に指定した関数は、ファイルの読み込みが完了した後に実行される関数なので、readFile が完了する（ファイルが読み込み完了する）前に、次の処理が始まり、ファイルの読み込みが終わった後に、第 3 引数に指定した関数が実行されるという流れになる。
- つまりまとめると
  ✅ readFile() は「非同期にファイルを読む」関数。
  ✅ 呼び出した瞬間に「読み込み開始」だけして、すぐ次の行へ進む。
  ✅ 読み込みが終わったタイミングで、第 3 引数に渡したコールバック関数が呼ばれる。

- 応用：

```js
const filePath = path.join(__dirname, "index.html");
fs.readFile(filePath, "utf8", (error, data) => {
  省略;
});
```

にすると絶対パスで指定できるので、どのディレクトリにいる状態で app.js を実行してもエラーにならない。
相対パスだと、Chapter2 に移動してから実行しないとエラーになる。

## readFile のコールバック関数

```js
fs.readFile(filePath, "utf8", (error, data) => {
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(data);
  response.end();
});
```

- readFile のコールバック関数の形。

```js
(error, data) => {
  実行する処理;
};
```

- 第一引数には、読み込み時にエラーなどが起きた時のエラーに関する情報をまとめたオブジェクトが渡される。(error) エラーが起きていなかったら空。
- 第二引数には、ファイルから読み込んだデータが渡される。（data）このデータを利用する処理を関数の中に書く。
- response.write(data); で、ファイルから読み込んだ data を write で書き出す。これで index.html の内容が表示される。

## 関数を切り分ける

- 関数の引数の中に関数、その引数の中にまた関数・・・と入れ子になりすぎると複雑化してしまう。わかりやすく書くために、引数に組み込まれている関数を別に切り離す。
- createServer の関数を切り離す（app4.js 参照）

# テンプレートエンジンを使う

- テンプレートエンジンとは：値などを動的に表示させるために、テンプレートを HTML に変換して出力する仕組み。

## EJS を使う

- 最も初心者が使いやすいテンプレートエンジン。Embedded JavaScript Template。
- Node.js には標準で用意されていないが、npm というパッケージマネージャーでインストールできる。
- 「npm install ejs」でインストールする。(node-app フォルダ内で)
- インストールすると、node_modules フォルダが生成される。パッケージがインストールされている。
- 新しいファイル（index.ejs）を作成。普通の HTML を書く。
- テンプレートを表示させる手順 (app5.js)
  1. テンプレートファイルを読み込む（fs.readFile, fs.readFileSync など）
  2. レンダリングする。（= HTML を生成する。）
  3. 生成された表示内容を出力する。(write など)
- ejs オブジェクトの基本
  1. ejs オブジェクトの読み込み
  ```js
  const ejs = require("ejs");
  ```
  2. テンプレートファイルの読み込み
  ```js
  const index_page = fs.readFileSync("./index.ejs", "utf-8");
  // または
  filePath = path.join(__dirname, "index.ejs");
  const index_page = fs.readFileSync(filePath, "utf-8");
  ```
  ### readFileSync というメソッドの使い方： 変数 = fs.readFileSync(ファイル名, エンコーディング);
  - readFileSync は同期処理でファイルを読み込む。（readFile は非同期処理）
  - ファイルの読み込みが終わるまで待ってから次に進む。なのでコールバック関数はない。
  - なぜ、時間がかかりそうな同期処理で良いのか。サーバーが実行される前だから大丈夫。サーバーが起動するのに時間がかかるだけ。
  3. レンダリングの実行
  ```js
  var content = ejs.render(index_page);
  ```
  4. 出力

## 動的なテンプレートの表示 (app6.js / index2.ejs)

- app.js 側で値を用意しておき、それをテンプレート(index.ejs)の指定の場所で出力。
- <%=変数 %>で値を埋め込む。例）<%= title %> など。
- app.js 側は、変数を用意する。アクセスしてきたクライアントに HTML を生成して返す getFromClient 関数（createServer の中身の関数）の中の、render に値を渡す。ejs.render(レンダリングするデータ, オブジェクト);のように書く。ここのオブジェクトにまとめてある値がテンプレート側で出力できる。

```js
var content = ejs.render(index_page, {
  title: "Indexページ",
  content: "これはテンプレートを使ったサンプルページです。",
});
```

# ルーティング

## CSS の読み込みについて

- style.css を作成し、index2.ejs の head 内に、<link type="text/css" rel="stylesheet" href="/style.css" />を追記して読み込んでも、CSS が適用されない！
- http://localhost:3000/style.css にアクセスしても、index3.ejs が表示される。
- http://localhost:3000/の後に何をつけても、必ず index3.ejs が表示される。
- そこで、「どのアドレスにアクセスしたら、どういうコンテンツを出力するか」ということを定義するための仕組みが必要 = ルーティング

## URL オブジェクト

- URL オブジェクト：URL を扱うためのさまざまな機能をまとめたもの。
- 使い方：

```js
const url = require("url");
```

- request の URL で処理を分岐する(app7.js 参照)

```js
// url.parseで、URLデータをパースして、ドメインやパス部分など、URLを構成するそれぞれの要素に分ける。
// 引数のrequest.urlプロパティは、クライアントからのリクエストのURLが保管されているプロパティ。
// つまり、ここで、クライアントがアクセスしたURLを整理したものをurl_partsに格納している。
var url_parts = url.parse(request.url);

// パース処理した値のpathnameというものを取り出す。pathnameは、ドメイン直下の/xxxxx/の部分。
switch (url_parts.pathname) {
  case "/":
    // "/"にアクセスした時の処理
    breake;
}
```

- 本には、url.parse()で書いてあるが、現在は非推奨！！その代わりに、URL クラスを使う。

```js
const url = new URL(request.url, `http://${request.headers.host}`);
switch (url.pathname) {
  case "/":
    // "/"にアクセスした時の処理
    breake;
}
```

## リンクの付け方

- index2.ejs に<p><a href="/other">Other Page に移動 &gt;&gt;</a></p>を追加
- other.ejs を作成
- app7.js に、

```js
filePath_other = path.join(__dirname, "other.ejs");
const other_page = fs.readFileSync(filePath_other, "utf-8");
```

と、case '/other': を追加

```js
case "/other":
var content = ejs.render(other_page, {
  title: "Other",
  content: "これは新しく用意したページです。",
});
response.writeHead(200, { "Content-Type": "text/html" });
response.write(content);
response.end();
break;
```

# Bootstrap とは(other.ejs で使用)

- CSS のフレームワーク
- Bootstrap の読み込み

```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.css"
  rel="stylesheet"
  crossorigin="anonymous"
/>
```

- <body class="container">や、<h1 class="display-4">などの専用のクラスをつける。
