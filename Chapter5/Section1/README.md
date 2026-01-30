# SQLite3 を用意する

・Node.js には、SQLite3 データベースファイルにアクセスするパッケージが用意されているので、インストール不要。

## 特徴

・ファイル 1 つで完結する RDB
・サーバー不要（MySQL / PostgreSQL みたいな常駐プロセスがない）
・超軽量・高速・セットアップ不要

# DB Browser for SQLite

・SQLite の中身を GUI（画面操作）で見たり編集したりできる無料ツール
・ここからダウンロード：
http://sqlitebrowser.org/

・新しいデータベースファイルを作成：mydb
・テーブル名：mydata
・フィールド（カラム）を設定：id, name, mail, age
![alt text](<screenshots/スクリーンショット 2026-01-29 13.37.24.png>)
・「新しいレコードを現在のテーブルに挿入」ボタンでデータを追加する。

# sqlite3 パッケージをインストールする

・Express から SQLite にアクセスするには、sqlite3 というパッケージを使う。
npm install sqlite3 を実行。

# データベースのデータを表示する

1、表示側：views/hello/hello.ejs 　で、下記のテーブルを追加。

```html
<table>
  <% for(var i in content) { %>
  <tr>
    <th><%= obj.id %></th>
    <td><%= obj.name %></td>
    <td><%= obj.mail %></td>
    <td><%= obj.age %></td>
  </tr>
  <% } %>
</table>
```

2、データベースのアクセス処理：routes/hello.js で、下記を記述。

```js
const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3"); // 追加

// データベースオブジェクトの取得
const path = require("path");
const dbPath = path.join(__dirname, "../../../../mydb.db"); // データベースファイルのパス
// console.log("Using DB:", dbPath);
const db = new sqlite3.Database(dbPath);

// GETアクセスの処理
router.get("/", (req, res) => {
  db.all("SELECT * FROM mydata", (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    res.render("hello", {
      title: "Hello",
      content: rows,
    });
  });
});
```

## レコードを全て取り出す

```js
// db.all(クエリー文, 関数);
db.all("select \* from テーブル名", (err, rows) => {
  // 実行後に呼び出される処理
});
```

db.all(クエリー文, 関数);は、レコードをまとめて全て取り出すための、Node.js からSQLを実行するための「呼び出し方」。
クエリー文というのは、SQL の命令文。
今回のクエリー文は、"select \* from テーブル名"で、これを、db.allで実行する。
この処理が完了したら、第二引数のコールバック関数が呼び出される。この関数には、errとrowsという2つの引数が用意されている。
errが、エラーが発生した時にエラー情報を渡すためのもの。
rowsがデータベースから返されたレコードデータをJavaScriptのオブジェクトにしたものを配列にまとめたもの。

## シリアライズとは

データベースへのアクセス処理を順に実行していくためのもの。
db.allを1回呼び出すだけなら、シリアライズは不要。
しかし、データを書き換える作業のような、処理を順番に実行しなければ正しくデータを扱えない場合は、必要！

```js
db.serialize(() => {
  db.run(...)
  db.run(...)
  db.all(...)
});
```

## db.each()で書くレコードを処理する

`db.each(SQLクエリー, 関数1, 関数2);`

```js
db.each("SELECT * FROM テーブル名",
  (err, row) => { ... },   // ← 1行ずつ呼ばれる
  (err, count) => { ... }  // ← 全部終わったあとに1回呼ばれる
);
```

- eachは、レコードを1つずつ順に取り出していく。
- 関数1は、レコードが取り出されるごとに実行される。
- 関数2は、全てのレコードが取り出し終わったら実行される。
- 実際例：hello2.jsを参照。

```js
router.get("/", (req, res, next) => {
  let rows = "";
  db.each(
    "SELECT * FROM mydata",
    (err, row) => {
      if (err) return next(err);
      rows += "<tr><th>" + row.id + "</th><td>" + row.name + "</td></tr>";
    },
    (err, count) => {
      if (err) return next(err);
      res.render("hello2", { title: "Hello2", content: rows });
    },
  );
});
```

- これで、レコードが取り出されるたびに、レコードが1つずつオブジェクトとしてrowに渡され、rowsに<tr><th>1</th><td>taro</td></tr>が追加されていく。
- 2つ目の関数で、レンダリングとして表示する処理を用意する。
