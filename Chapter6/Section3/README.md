# PrismaによるCRUD

## レコードの新規作成（Create）
- `prisma.モデル.create(モデル情報をまとめたオブジェクト);`
- モデル情報をまとめたオブジェクトは、`{data: {各プロパティの値}}`のように、dataという項目に、モデルの各プロパティに保管する値の情報を{}でオブジェクトにまとめたものを用意する。
- views/users/add.ejsを作成。
`<form method="post" action="/users/add"></form>`を作る。
- routes/users.jsに、/addの処理を作成する。asyncとawaitを忘れずに！
```js
// 新規追加画面の表示
router.get("/add", (req, res) => {
  res.render("users/add", {
    title: "ユーザー追加",
    content: "新しいレコードを入力",
    form: { name: "", password: "", mail: "", age: 0 }, // 初期値を空に設定。バリデーションエラー時に「入力内容を保持して再表示」したい場合はformを渡す。
  });
});

// 新規追加画面の処理
router.post("/add", async (req, res) => {
  const { name, password, mail, age } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, pass: password, mail, age: Number(age) ?? 0 },
    });
    res.redirect("/users/");// 一覧ページにリダイレクト
  } catch (error) {
    console.error(error);
    res.status(500).render("error");
  }
});
```

## レコードの更新（Update）
- `prisma.user.update( { where: 更新する対象, data: 更新する内容 } );`
- views/users/edit.ejsを作成。
```html
<form method="post" action="/users/edit">
  <input type="hidden" name="id" id="id" value="<%= user.id %>" />
  <div class="form-group">
    <label for="name">お名前</label>
    <input type="text" name="name" id="name" class="form-control" value="<%= user.name %>" />
  </div>
  <div class="form-group">
    <label for="password">パスワード</label>
    <input type="password" name="password" id="password" class="form-control" value="<%= user.pass %>" />
  </div>
  <div class="form-group">
    <label for="mail">メールアドレス</label>
    <input type="text" name="mail" id="mail" class="form-control" value="<%= user.mail %>" />
  </div>
  <div class="form-group">
    <label for="age">年齢</label>
    <input type="number" name="age" id="age" class="form-control" value="<%= user.age %>" />
  </div>  
  <input type="submit" value="更新" class="btn btn-primary" />
</form>
```
- 更新の処理を作成する。routes/users.jsに下記を追加。
```js
// 編集画面の表示
router.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).render("error");
  }
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });
  if (!user) {
    return res.status(404).render("error");
  }
  const data = {
    title: "ユーザー編集",
    user: user, // ここは
  }
  res.render("users/edit", data);
});

// 編集内容の保存
router.post("/edit", async (req, res) => {
  const { id, name, password, mail, age } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, pass: password, mail, age: Number(age) ?? 0 },
    });
    res.redirect("/users/");
  } catch (error) {
    console.error(error);
    res.status(500).render("error");
  }
});
```
## レコードの削除
- `prisma.モデル.delete( { where: 検索条件 });`
- views/users/delete.ejsを作成。`<form method="post" action="/users/delete">`で削除のsubmitボタンを書く。
```html
<table>
  <tr>
    <th>お名前</th>
    <td><%= user.name %></td>
  </tr>
  <tr>
    <th>メールアドレス</th>
    <td><%= user.mail %></td>
  </tr>
  <tr>
    <th>年齢</th>
    <td><%= user.age %></td>
  </tr>
</table>
<form method="post" action="/users/delete">
  <input type="hidden" name="id" value="<%= user.id %>" />
  <input type="submit" value="削除" class="btn btn-danger" />
</form>
```

- /deleteの処理を作成する。routes/users.jsに下記を追加。
```js
// 削除画面の表示
router.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).render("error");
  }
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });
  if (!user) {
    return res.status(404).render("error");
  }
  const data = {
    title: "ユーザー削除",
    user: user,
  }
  res.render("users/delete", data);
});

// 削除処理
router.post("/delete", async (req, res) => {
  const { id } = req.body;
  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });
    res.redirect("/users/");  
  } catch (error) {
    console.error(error);
    res.status(500).render("error");
  }
});
```

## SQLクエリと Prismaの書き方比較まとめ
1. 全件取得
- SQL: `SELECT * FROM mydata;`
- Prisma: `await prisma.user.findMany();`

2. 1件取得(id=1)
- SQL: `SELECT * FROM mydata WHERE id = 1;`
- Prisma: 
```js
await prisma.user.findUnique({
  where: { id: 1 }
});
```
- ※ id が unique の場合は findUnique
- ※ 条件検索なら findFirst も使える

3. 条件付き検索
- SQL: `SELECT * FROM mydata WHERE age = 30;`
- Prisma: 
```js
await prisma.user.findMany({
  where: { age: 30 }
});
```

4. INSERT
- SQL: `INSERT INTO mydata (name) VALUES ('taro');`
- Prisma: 
```js
await prisma.user.create({
  data: {
    name: "taro"
  }
});
```

5. UPDATE
- SQL: `UPDATE mydata SET age = 30 WHERE id = 1;`
- Prisma: 
```js
await prisma.user.update({
  where: { id: 1 },
  data: { age: 30 }
});
```

6. DELETE
- SQL: `DELETE FROM mydata WHERE id = 1;`
- Prisma: 
```js
await prisma.user.delete({
  where: { id: 1 }
});
```

7. Node.js（Express）からの呼び出し比較
- SQLite3（コールバック型）: 
- 全件取得： `db.all("SELECT * FROM mydata", callback);`
- 1件取得: `db.get("SELECT * FROM mydata WHERE id = ?", [id], callback);`
- 実行のみ（INSERT / UPDATE / DELETE）: `db.run("INSERT ...", params, callback);`
- Prisma（Promise / async-await型）:
- 全件取得: 
```js
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();

  res.render("users/index", {
    title: "ユーザー一覧",
    content: users,
  });
});
```
- 1件取得
```js
router.get("/show/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) }
  });

  res.render("users/show", {
    title: "ユーザー詳細",
    content: user,
  });
});
```

- INSERT
```js
router.post("/create", async (req, res) => {
  await prisma.user.create({
    data: {
      name: req.body.name,
    }
  });

  res.redirect("/users");
});
```

- UPDATE
```js
await prisma.user.update({
  where: { id: Number(req.params.id) },
  data: { age: 30 }
});
```

- DELETE
```js
await prisma.user.delete({
  where: { id: Number(req.params.id) }
});
```





