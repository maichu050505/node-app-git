# Section3: データを扱うための機能

## パラメーターを使おう

- /hello のページで、クエリーパラメーターを使ってみる。routes/hello.js を修正

```js
const express = require("express");
const router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  const name = req.query.name || "ゲスト";
  const mail = req.query.mail || "未登録";
  const data = {
    title: "Hello!",
    content: `こんにちは、${name}さん。メールアドレスは${mail}ですね。`,
  };
  res.render("hello", data);
});

module.exports = router;
```

- これで、npm start して、http://localhost:3000/hello?name=hanako&mail=hanako@example.comにアクセスする。
- req.query.パラメーター名だけで、クエリーパラメーターの値が取り出せる!!
- Express は内部で、URL を解析
  ?name=mai&mail=test@example.com
  ↓
  オブジェクト化

```js
{
  name: "mai",
  mail: "test@example.com"
}
```

これを req.query に自動で入れている
だから 👇 が書ける
const name = req.query.name;

- ちなみに、Node.js では、new URL と、searchParams.get で取り出してた。
  ```js
  const urlObj = new URL(request.url, `http://${request.headers.host}`);
  const msg = urlObj.searchParams.get("msg");
  ```
- ちなみに、req.qurey と似たやつで、req.params というのもある。
  /users/123 にアクセスして、req.params = { id: "123" } に変換してくれるので、123 を取り出せるやつ。

```js
router.get("/users/:id", (req, res) => {
  console.log(req.params.id); // 123
});
```

## フォームの送信

- Express では、Body Parser というパッケージをインストールして利用する。Express ジェネレーターでは標準で Body Parser が組み込み済み。
- node_modules/express/lib/express.js に、下記の処理が入っている。

```js
exports.json = bodyParser.json;
exports.query = require("./middleware/query");
exports.raw = bodyParser.raw;
exports.static = require("serve-static");
exports.text = bodyParser.text;
exports.urlencoded = bodyParser.urlencoded;
```

1. views/hello.ejs にフォームを設置する。

```html
<form method="post" action="/hello/post">
  <div class="form-group">
    <label for="msg">メッセージ：</label>
    <input type="text" class="form-control" id="msg" name="message" />
  </div>
  <input type="submit" value="送信" class="btn btn-primary" />
</form>
```

2. form タグに、action="/hello/post"と書いたので、routes/hello.js 内に/post に POST 送信した時の処理を用意。下記を追記。

```js
router.post("/post", function (req, res, next) {
  const msg = req.body["message"] || "メッセージはありません";
  const data = {
    title: "Hello!",
    content: `あなたのメッセージ：${msg}`,
  };
  res.render("hello", data);
});
```

- ポイントは、router.post("/post",...)にしていること。app.js で、app.use("/hello", helloRouter);にしているので、ここでは、/post にすると、/hello/post のリクエストを受け取るルートを作れる。
- req.body["message"]で、値を取り出す。post 送信された値は、req.body 内にまとめられている。これが Body Parser によって実現される機能。

ちなみに、今風に書くと、function (req, res, next)ではなく、アロー関数で書く。

```js
router.post("/post", (req, res) => {
  const msg = req.body.message || "メッセージはありません";

  res.render("hello", {
    title: "Hello!",
    content: `あなたのメッセージ：${msg}`,
  });
});
```

さらに読みやすく、分割代入/next 削除で書くと、

```js
router.post("/post", (req, res) => {
  const { message } = req.body;

  res.render("hello", {
    title: "Hello!",
    content: `あなたのメッセージ：${message ?? "メッセージはありません"}`,
  });
});
```

## セッションについて

- セッションとは、クライアントごとに値を保管できる仕組み。クッキーの機能と、サーバー側のプログラムを組み合わせたもの。
- サーバーにアクセスしたクライアントには、それぞれ固有のセッション ID がクッキーに保存される。そして各セッション ID ごとに、サーバー側でデータを保管する。こうすると、データそのものはサーバー側で保管しているので安心。
- Express は、Express Session というセッション機能のパッケージが用意されている。
