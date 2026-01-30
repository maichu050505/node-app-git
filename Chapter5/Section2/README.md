# データベースの基本をマスターする

## CRUDとは？

- Create: 新しいレコードを新規保存する。
- Read: レコードをデータベースから取り出す。
- Update: レコードの内容（フィールドの値）を書き換える。
- Delete: レコードを削除する。

## 新しいレコードを作成する(Create)

### 入力画面の作成

1. views/hello/add.ejsで、<form method="post" action="/hello/add">を作る。お名前、メールアドレス、年齢を入力できるようにする。
2. routes/add.jsで、getアクセス処理と、postアクセス処理を書く。

```js
// GETアクセスの処理。これで、hello/add/にアクセスしたら、hello/add.ejsのフォームが表示される。
router.get("/add", (req, res) => {
  res.render("hello/add", { title: "Hello/Add", content: "新しいレコードを入力" });
});

// POSTアクセスの処理
router.post("/add", (req, res, next) => {
  const { name, mail, age } = req.body;
  // const name = req.body.name;
  // const mail = req.body.mail;
  // const age = req.body.age;

  db.run(
    "INSERT INTO mydata (name, mail, age) VALUES (?, ?, ?)",
    [name, mail, age],
    function (err) {
      if (err) return next(err); // エラーはExpressのエラーハンドラへ
      res.redirect("/hello/"); // 成功したらリダイレクト
    },
  );
});
```

- db.run('クエリー', name, mail, age)：データベース側からレコードを取り出す必要がない処理の場合に使う。
- insert文：レコードを新規追加するSQLクエリー文。
  `insert into テーブル名 (フィールド1, フィールド2, フィールド3) values (値1, 値2, 値3);`
  実際は、
  `INSERT INTO mydata (name, mail, age) VALUES (?, ?, ?);`
  この?は、プレースホルダーといって、あたいの場所を予約しておくもの。name, mail, ageの3つの変数の値が、この?のところに嵌め込まれて実行するSQL文が作成される。

## レコードを表示する(Read)

### 詳細ページの作成（特定のレコードだけ取り出す）

- 詳細ページのテンプレートを、views/hello/show.ejsで作成。
- routes/hello.jsに、/showの処理を追加

```js
router.get("/show", (req, res) => {
  const id = req.query.id; // クエリパラメータからidを取得。クエリパラメータが、?id=9の時、req.query.id = 9 になる。
  db.get("SELECT * FROM mydata WHERE id = ?", [id], (err, row) => {
    if (err) return next(err);

    if (!row) {
      return res.status(404).send("データが見つかりません");
    }

    res.render("hello/show", {
      title: "Hello/Show",
      content: "id = " + id + " のレコード",
      mydata: row,
    });
  });
});
```

- /hello/show?id=9 にアクセスすると、idが9のデータが表示される。
- db.get(): レコードを1つだけ取り出す。条件で複数のレコードが見つかった場合は、最初のものだけ取り出す。
  db.get(クエリー文, [id], (err, row) => {
  // 処理
  });
- `select * from テーブル名 where 条件文`
- `select * from mydata where id = ?`

## まとめ

1. SQLクエリー文

- SELECT \* FROM mydata;
- SELECT \* FROM mydata where id = 1;
- INSERT INTO mydata (name) VALUES ('taro');
- UPDATE mydata SET age=30 WHERE id=1;
- DELETE FROM mydata WHERE id=1;

2. Node.jsからの呼び出し方

- 全てのレコードを取得: db.all("SELECT \* FROM mydata", callback);
- レコードを1つずつ順に取得: db.each("SELECT \* FROM mydata", 関数1, callback)
- レコードを取得せず実行(insertなど): db.run("INSERT ...", params, callback);
- 1つのレコードを取得: db.get("select \* from mydata where id = ?", [id], callback)
