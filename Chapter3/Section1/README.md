# データのやり取りをマスターしよう

## パラメーターで値を送る

- URL の後ろにクエリパラメーターをつけてサーバーに送信する。(app.js)
- クエリーパラメーターの取り出し方：

  - 本では、

  ```js
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;
  ```

  とすると、query.msg で、?msg=xxx の xxx の部分が取り出せる。が、これは非推奨！！

  - 推奨版：現在の正式な方法 → WHATWG URL API。
    new URL() + searchParams で取り出す！

  ```js
  const urlObj = new URL(request.url, `http://${request.headers.host}`);
  const msg = urlObj.searchParams.get("msg");
  ```

  とすると、msg で、?msg=xxx の xxx の部分が取り出せる。
  解説：
  ブラウザからサーバーに送られる情報は、
  GET /?msg=hello HTTP/1.1 　
  Host: localhost:3000
  このようになっている。
  new URL(request.url, `http://${request.headers.host}`)　は、Node が内部的にこう解釈する：
  new URL("/?msg=hello", "http://localhost:3000")
  → "http://localhost:3000/?msg=hello"
  これで完全な URL オブジェクトが作れる！
  つまり、Node の request.url が“絶対 URL ではない”ので、${request.headers.host}を使ってブラウザがアクセスしてきたホスト名を取得して絶対 URL を組み立てる！

- 本では、var を使っているが、これも今は非推奨。現在は、let, const を使う。Chapter3 から app.js を、let, const に書き換えた。
- app.js を実行し、http://localhost:3000/?msg=3 にアクセスすると、「これは Index ページです。あなたは、「3」と送りました。」と表示される。

## フォーム送信を行う

- フォーム送信の流れ
  1. 送られたフォームのデータを受け取る
  2. 受け取ったデータをパースする。
  3. 必要な値を取り出して処理する
- index2.ejs で form を作成。<form method="post" action="/other">
- /other でフォームの内容を受け取り、other.ejs を使って結果を表示。
- app2,js に書く処理。
  <非推奨の querystring で書く方法(本に書いてある内容)>

  1. const qs = require('querystring');で、Query String というモジュールをロードする。
     Query String とは、クエリーテキストを処理するための機能を提供するもの。（普通のテキストをパース処理する）
  2. switch の処理：
     ルーティングの処理。
     コードが長くなるので、response_index, response_other という関数に切り離す。
     フォーム送信の処理は、response_other 関数に書く。
  3. response_other 関数での POST 処理
     (1) if 文を使って、POST 送信されたかどうかチェック。
     if(request.method === 'POST') { ... }
     request の method というプロパティは、そのリクエストがどういう方式で送られてきたかを表す値。これが GET か POST かによって処理を分ける。

     (2)データ受信に関するイベント処理
     クライアントから POST でフォーム送信された情報は、request オブジェクトにまとめられている。
     この request には、クライアントから送られたデータを受信する際のイベントが用意されている。

     - data イベント：クライアントからデータを受け取ると発生するイベント。
     - end イベント：データの受け取りが完了すると発生するイベント。（最後のデータが送られるとき）

     ※イベント処理：オブジェクトでは、イベントに応じて呼び出される関数を設定することができる。
     （〇〇という動作をした → 〇〇イベントが発生 → 設定した関数を実行）
     イベントの設定方法：オブジェクト.on(イベント名, 関数);

     - data のイベント処理
       本での書き方（非推奨）：

     ```js
     let body = "";
     request.on("data", (data) => {
       body += data; // body = body + data;
       // dataは、Bufferだけど、JavaScriptの仕様で、片方が string なら、もう片方も string に変換して結合するから、自動で data.toString() されるて文字列化（クエリーテキスト形式の文字列）されて結合する。
     });
     ```

     でも、これだと、JavaScript の + 演算子はどっちかが string → もう片方も string に強制変換するという仕様のため JavaScript 側が勝手に toString してるので、たまたま動いてる。でも、たまたま動いているコードは危険なので非推奨。
     推奨の書き方は、.toString()をちゃんと書く！

     ```js
     request.on("data", (chunk) => {
       body += chunk.toString();
     });
     ```

     ・変数 body を用意しておき、data イベント（クライアントからデータを受け取った時のイベント）が発生したら、引数の値を body に追加している。
     ・引数には、クライアントから受け取ったデータが入っている。
     ・data は「POST されたデータの断片（chunk）」。
     ・1 回で全部来ないので複数回呼ばれる
     ・body += data としてくっつける
     ・このデータを変数 body にどんどん追加していけば、受け取ったデータを取り出せるようになる。
     ・end が来た時点で “すべてのデータが揃った” という意味。
     ・Express と違って、Node.js の HTTP は“低レイヤー”だから「chunk ごとに渡された → 開発者が結合する」という動きになる。

     - end イベントの処理：
       本での書き方（古い書き方で非推奨）：

     ```js
     request.on("end", () => {
       const post_data = qs.parse(body); // データのパース
       msg += "あなたは、「" + post_data.msg + "」と書きました。";
       // 省略
     });
     ```

     - 全てのデータを受け取ったら、最後にそれをパースしてテキストの値として取り出す。
     - end イベントに設定する関数には引数はない。全てのデータを受け取った後なので、もう渡されるデータはない。
     - ただし、受け取ったデータ（body 変数）は、クエリーテキストという形式なので、オブジェクトに変換（エンコード）しておかなければならない。それが qs オブジェクトの parse。qs.parse(body)で、受け取ったデータ(body)をエンコードし、それぞれのパラメータの値を整理したオブジェクトに変換してくれる。
     - これで、post.data.msg で取り出せるようになる。

     - 推奨の書き方は、new URLSearchParams(body)を使う！

     ```js
     const params = new URLSearchParams(body);
     const userMsg = params.get("msg");
     msg += `あなたは、「${userMsg}」と書きました。`;
     ```

     - 文字列 body（例："msg=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF"）を
     - 「クエリ文字列として解釈して」
     - キーと値のセットに分解するオブジェクト(実際はオブジェクトじゃなくて URLSearchParams インスタンス)を作る。
       イメージとしては、
       params = {
       "msg": "こんにちは"
       }
       みたいな感じ。
       - つまり、URLSearchParams が内部でやってくれているのは：
       1. & で区切って msg=... みたいにバラす
       2. = で区切ってキーと値に分ける
       3. %E3%81%93... みたいなエンコードを デコード して元の日本語に戻す
       4. - を半角スペースとして扱う（"Hello+World" → "Hello World"）

## テンプレート側で受け取ったデータを処理する仕組み

- EJS は、テンプレート内で JavaScript のコードを実行するためのタグも用意されている。
  <% 実行するスクリプト %>
  こうしたタグをテンプレートのあちこちで使った場合、上にあるものから順に実行されるし、変数なども共有され 1 つの処理として動く。
  必要に応じて、<% %>で処理を実行し、<% %>で結果を表示する。

### オブジェクトの内容をテーブル表示する

- データをオブジェクトにまとめておき、その内容をテーブルの方にまとめて表示する。(app3.js)

```js
let data = {
  Taro: "090-9999-9999",
  Hanako: "080-888-888",
  Sachiko: "070777-777",
  Ichiro: "060-666-666",
};

function response_index(request, response) {
  const msg = "これはIndexページです。";
  let content = ejs.render(index_page, {
    title: "Index",
    content: msg,
    data: data, // 追加
  });
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.write(content);
  response.end();
}
```

- テンプレート(index3,jsx)側で、このように書く。

```js
<table class="table">
  <% for(var key in data) { %>
  <tr>
    <th><%= key %></th>
    <td><%= data[key] %></td>
  </tr>
  <% } %>
</table>
```

WordPress テンプレートの、PHP の foreach とほぼ同じ。

```php
<table class="table">
<?php foreach ($data as $key => $value) : ?>
  <tr>
    <th><?php echo $key; ?></th>
    <td><?php echo $value; ?></td>
  </tr>
<?php endforeach; ?>
</table>
```

- 解説：for (var key in data)
  このループは
  1 周目：key = "Taro"
  2 周目：key = "Hanako"
  3 周目：key = "Sachiko"
  4 周目：key = "Ichiro"
  と、プロパティ名だけが順番に入ってくる。
  値を取りたい時は、キーがわかれば、data[key]でとれる。

- for in は、あまり使わない。実際は、forEach をよく使う。

```js
Object.entries(data).forEach(([key, value]) => {
  console.log(key, value);
});
```

を使う。

- Object.entries(data)は、オブジェクトを「[キー, 値] のペアの配列」に変換するメソッド。
  let data = {
  Taro: "090-9999-9999",
  Hanako: "080-888-888",
  };
  これを、
  [
  ["Taro", "090-9999-9999"],
  ["Hanako", "080-888-888"]
  ]
  こう変換する。
- 配列 .forEach() は、配列の要素をひとつずつ取り出して処理する。
  配列が
  [
  ["Taro", "090-9999-9999"],
  ["Hanako", "080-888-888"]
  ]
  こうなら forEach は 2 回ループする。
- ([key, value]) => {}は、
  配列をそのまま、[key, value]に 分割代入してる。
  つまり、
  1 回目ループでは
  key = "Taro"
  value = "090-9999-9999"
  2 回目ループでは
  key = "Hanako"
  value = "080-888-888"
  になる。
