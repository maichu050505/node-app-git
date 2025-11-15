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
