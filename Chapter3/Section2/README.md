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
  ① Object.entries(data)
  data がこうだったとする：
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
  つまり、
  key が名前（"Taro"）
  value が電話番号（"090-9999-9999"）
  のペアになった配列。
  ② .forEach(([key, value], index) => { ... })
  ([key, value], index) => { ... }
  これは 配列 [key, value] をそのまま分解して受け取る書き方（分割代入）。
  1 ループ目では：
  key = "Taro"
  value = "090-9999-9999"
  index = 0
  2 ループ目では：
  key = "Hanako"
  value = "080-888-888"
  index = 1
  …って感じで回る。
  ③ index + 1 の意味
  { id: index + 1, ... }
  JavaScript の配列は index が 0 から始まるけど、テーブルの ID は 1 から始めたいので+1 している。
  ④ include してる行
  <%- include('data_item', { id: index + 1, key, val: value }) %>
  ここで data_item.ejs に値を渡してる。
  ここは、index.ejs から見た相対パスで書く。data_item.ejs が、index.ejs と同じフォルダ内にあるため、'data_item'だけど、もし別のフォルダ（例えば「partials」フォルダ内にあったら、include('partials/data_item', { id, key, val }) %> になる。
  ⑤ <%- を使っている理由
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
