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

## レコードの編集(Update)

- まず、どのレコードを編集するのかを指定し、その内容を表示するなどして編集できる状態を用意する。その上で、内容を変更して更新する。
- /hello/edit に、クエリーパラメーターでIDを指定してアクセスするという方法を取る。
- /views/hello/edit.ejsを作成し、フォームを作る。actionは、/hello/editにし、各入力欄のvalueを、<%= mydata.name %>のようにする。フォーム内の一番上に、<input type="hidden" name="id" value="<%= mydata.id %>" />を入れる。

```js
<form method="post" action="/hello/edit">
  <input type="hidden" name="id" value="<%= mydata.id %>" />
  <div class="form-group">
    <label for="name">お名前</label>
    <input type="text" name="name" id="name" class="form-control" value="<%= mydata.name %>" />
  </div>
  <div class="form-group">
    <label for="mail">メールアドレス</label>
    <input type="text" name="mail" id="mail" class="form-control" value="<%= mydata.mail %>" />
  </div>
  <div class="form-group">
    <label for="age">年齢</label>
    <input type="text" name="age" id="age" class="form-control" value="<%= mydata.age %>" />
  </div>
  <input type="submit" value="更新" class="btn btn-primary" />
</form>
```

- hello.jsに、編集画面の表示(get)処理と、編集内容の保存処理(post)を追記する。

```js
// 編集画面の表示
router.get("/edit", (req, res, next) => {
  const id = req.query.id; // クエリパラメータからidを取得。クエリパラメータが、?id=9の時、req.query.id = 9 になる。
  db.get("SELECT * FROM mydata WHERE id = ?", [id], (err, row) => {
    if (err) return next(err);

    if (!row) {
      return res.status(404).send("データが見つかりません");
    }
    res.render("hello/edit", {
      title: "Hello/Edit",
      content: "id = " + id + " のレコードを編集",
      mydata: row,
    });
  });
});

// 編集内容の保存
router.post("/edit", (req, res, next) => {
  const { id, name, mail, age } = req.body;
  // const id = req.body.id;
  // const name = req.body.name;
  // const mail = req.body.mail;
  // const age = req.body.age;

  db.run(
    "UPDATE mydata SET name = ?, mail = ?, age = ? WHERE id = ?",
    [name, mail, age, id],
    (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/hello"); // 更新後、一覧画面へリダイレクト
    },
  );
});
```

- 更新処理のSQLクエリー文：update テーブル名 set フィールド1 = 値1, フィールド2 = 値2, フィールド3 = 値3 where 条件
- ここでは、`UPDATE mydata SET name = ?, mail = ?, age = ? WHERE id = ?`
- 結果のレコードを返す必要がないので、db.runで実行する。
- 更新処理で必ず必要なのが、where による条件の設定！！これを忘れると、テーブルのすべてのレコードを書き換えてしまうので注意。

## レコードの削除(delete)

- まず、IDを指定してアクセスすると、そのレコード内容が表示され、その内容を確認して削除のボタンを押すとそのレコードが削除される。
- views/hello/delete.ejsを作成。詳細画面のshow.ejsのように、テーブルで該当のデータを表示し、テーブルの下に、削除するレコードのID番号を送信するfボタンだけのフォームも用意。

```js
<form method="post" action="/hello/delete">
  <input type="hidden" name="id" value="<%= mydata.id %>" />
  <input type="submit" value="削除" class="btn btn-danger" />
</form>
```

- hello.jsに、削除画面と削除処理を追記する。

```js
// 削除画面の表示
router.get("/delete", (req, res, next) => {
  const id = req.query.id; // クエリパラメータからidを取得。getなのでreq.query.id
  db.get("SELECT * FROM mydata WHERE id = ?", [id], (err, row) => {
    if (err) return next(err);

    if (!row) {
      return res.status(404).send("データが見つかりません");
    }
    res.render("hello/delete", {
      title: "Hello/Delete",
      content: "id = " + id + " のレコードを削除",
      mydata: row,
    });
  });
});

// 削除処理
router.post("/delete", (req, res, next) => {
  const id = req.body.id; // postなのでreq.body.id。postなのでフォームのbodyから取得。
  db.run("DELETE FROM mydata WHERE id = ?", [id], (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/hello"); // 削除後、一覧画面へリダイレクト
  });
});
```

- 削除処理のSQLクエリー文: delete from テーブル where 条件
- ここでは、delete from mydata where id = ?
- db.runで実行。
- なぜ、削除や更新がpostなのかというと、formがpostしか送れないから（deleteやputが送れない）。
- JavaScriptの fetch / axios, APIサーバー, SPA（React, Vue, Next.js など）は、PUTやDELETEを使う。
  例）`fetch("/users/5", { method: "DELETE" });`
- Expressでも method-override というミドルウェアを使って「メソッド擬似化」（サーバー側でPOSTだけど実質DELETEとして扱うなどの処理）を行うこともできる。

## レコードの検索

- レコードの更新や削除は、該当のレコードを取り出すために、下記のように絞り込んでいた。
  `db.get("SELECT * FROM mydata WHERE id = ?", [id], (err, row) => {});`
- views/hello/index.ejsを修正。
- 本では、postだけど、検索結果はgetを使うのが一般的。（/hello/find?find=taroのような検索結果のURLを共有できるから）

```js
<form action="/hello/find" method="get">
  <div class="form-group">
    <label for="find">検索</label>
    <input type="text" name="find" id="find" class="form-control" value="<%=find %>" />
  </div>
  <input type="submit" value="検索" class="btn btn-secondary" />
  <a href="/hello/" class="btn btn-outline-secondary">
    クリア
  </a>
</form>
```

- hello.jsに追加

```js
// 一覧画面の表示
router.get("/", (req, res) => {
  db.all("SELECT * FROM mydata", (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    res.render("hello/index", {
      title: "Hello",
      content: rows,
      find: "", // 検索文字列用を追加
    });
  });
});

// 検索処理（条件文をそのまま受け取る危険な実装例）
router.get("/find", (req, res) => {
  const find = req.query.find;
  const q = "SELECT * FROM mydata WHERE ";
  db.all(q + find, [], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    res.render("hello/index", {
      title: "Hello",
      content: rows,
      find: find,
    });
  });
});
```

### LIKE検索（あいまい検索）

- where フィールド like 値
- 例）where mail like "%.com" // .comで終わるもの
- %をつけると、その部分はなんでも当てはまる。

### 複数条件の指定

#### AND検索

- 2つの条件の両方に合致するものだけを検索。
- 例）age >=20 and age < 30 // 20代の人。ageが20以上30未満。

#### OR検索

- 2つの条件のどちらかに合致するものをすべて検索
- 例）age < 20 or age > 50 // 20歳未満と50歳以上の人

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
- レコードを取得せず実行(insert, update, deleteなど): db.run("INSERT ...", params, callback);
- 1つのレコードを取得: db.get("select \* from mydata where id = ?", [id], callback)
