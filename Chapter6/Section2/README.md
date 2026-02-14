# レコードを検索しよう

- routes/users.js に、下記を追加する。

```js
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const data = {
      title: "ユーザー一覧",
      content: users,
    };
    res.render("users/index", data);
  } catch (error) {
    console.error(error);
    res.status(500).render("error");
    // または適切なエラーハンドリング
  }
});
```

- `prisma.user.findMany()`について
- schema.prismaで、Userというモデルを設定したので、prisma.userというプロパティが使える。つまり、schema.prisma の model 名がそのままプロパティ名になる。（User → user）
- prisma.userにUserモデルのオブジェクトがある。ここからfindManyというメソッドを呼び出す。これは、複数のレコードを取得するメソッド。引数を特に指定しない場合はすべてのレコードを取り出す。
- このfindManyは「非同期（処理が全部終わるまで待たずに、そのまま次へ進む）」のメソッド！！findManyに限らず、prismaに用意されているデータベースアクセス系のメソッドは基本的に非同期。
- findManyは、戻り値としてもPromiseオブジェクトを返す。処理が完了するとPromiseから値を取得できるようになる。
- 処理が完了してPromiseから値を取得できるようになるまで待つ必要があるので、「await」をつけている。
- awaitを使う関数には、必ず「async」もつける。
- 本では、thenを使っている。非同期処理のコールバック処理を用意するメソッド。この場合は、usersにfindManyで得られたUserテーブルのレコード情報が保管されている。つまり、usersには各Userモデルのオブジェクトが配列にまとまられている。取り出したusers変数をそのままテンプレートに渡している。
```js
// 本の書き方 thenを使った場合
router.get("/", async (req, res) => {
  prisma.user.findMany().then((users) => {
    const data = {
      title: "ユーザー一覧",
      content: users,
    };
    res.render("users/index", data);
  });
});
```

- ちなみに、prismaを使わない場合は下記のとおり。

```js
router.get("/", (req, res) => {
  db.all("SELECT \* FROM mydata", (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }

        res.render("hello/index", {
          title: "Hello",
          content: rows,
          find: "", // 検索文字列用
        });

  });
});
```

- テンプレートを用意する。(views/users/index.ejsを作成)
- npm startを実行し、http://localhost:3000/users/ にアクセスすると、ユーザーの一覧画面になる。
（スキーマ変更後や初回は、`npx prisma generate`を実行してから。）


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





