# レコードを検索しよう

## 一覧を表示する

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

## 指定IDのレコードを表示する（詳細ページ）
- findManyによるレコードの取得方法。
- JSON形式：　`findMany( {設定1: 値1, 設定2: 値2, ...})`
- whereオプション： `findUnique({where: {フィールド: 値}})`
- findUniqueは、同じものが複数ない、ユニークなレコードを取得するためのメソッド。
- users.jsを下記のように書き換える
```js
// idが指定されていない場合は一覧画面を表示、指定されている場合は詳細画面を表示
router.get("/", async (req, res) => {
  const id = +req.query.id;
  if (!id) {
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
  } else {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) {
      return res.status(404).render("error"); // または専用の404ページ
    }
    const data = {
      title: "ユーザー詳細",
      content: [user],
    }
    res.render("users/index", data);
    }
  }
);
```
- そうすると、http://localhost:3000/users では一覧が表示され、http://localhost:3000/users?id=2などでは該当のIDのレコードが表示される。
- ここで、`const id = +req.query.id;`となっているのは、`router.get("/")`で、?id=2などのクエリで渡す想定の場合。
- `+`がついているのは、文字列を数値に変換している。
- もしこれが、`router.get("/users/:id")`で、/users/2 にアクセスする場合は、`req.params.id`となる。

## ファイルター演算子を指定して検索する
- `where: { フィールド : {演算子 : 値}}`
- 指定したID以下のものを検索する。
- lteはless than-equalの略で、<=　に相当する。
```js
findMany({
  where: {id: {lte: id}}
})
```
- こうすると、/users?id=番号にアクセスすると、その番号以下のIDのレコードが全て表示される。
- 他にも、下記のプロパティがある。
equals =
not !=
lt <
lte <=
gt >
gte >=

## LIKE検索
- contains: 指定した値を含む
- startsWith: 指定した値で始まる
- endsWidth: 指定した値でおわる。
- 下記のようにすると、users/find?name=ko とすると、koを含むものを検索できる。
```js
router.get("/find", async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).render("error");
  }
  const users = await prisma.user.findMany({
    where: { name: { contains: name } },
  });
  const data = {
    title: "ユーザー検索",
    content: users,
  }
  res.render("users/index", data);
});
```

## 複数の条件を設定（AND検索）
```js
where: {
  AND: [条件1, 条件2, ...]
}
```
- 使用例：
```js
findMany({
  where: {
    AND: [
      {age: { gte: min}},
      {age: { lte: max }}
    ]
  }
})
```
で、/users/find?min=20&max=40にアクセスすると、年齢が20以上40以下のレコードを検索できる。

## 複数の条件を設定（OR検索）
```js
where: {
  OR: [条件1, 条件2, ...]
}
```
- 使用例：
```js
findMany({
  where: {
    OR: [
      {name: { contains: name}},
      {mail: { contains: mail }}
    ]
  }
})
```
で、/users/find?name=taro&mail=hanakoにアクセスすると、nameにtaroが含まれるものとmailにhanakoを含むレコードを検索する。