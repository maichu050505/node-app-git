# モデル連携とDB版メッセージボード

## 複数モデルの連携
- モデルとモデルの連携で使われているのが「リレーション」という機能。
- リレーションはモデルの関係を表すもの。例えば、投稿メッセージのモデルは、それぞれのメッセージが、この人が投稿したというユーザーモデルの情報と関連づいている。

### リレーションの4つの方式
- 1対1（One To One）方式：例えば、住民票データと図書カードのデータ。１人に1枚ずつ図書カードは発行されている。
- 1対多(One To Many)方式：例えば、図書カードと図書館の蔵書データ。１人の人は、図書館で複数の本を借りることができるが、1つの本は同時に複数の人に貸し出すことはできない。
- 多対1(Many To One)方式: 図書館の蔵書データから見ると、複数の本が同じ１人の人に貸し出されることがある。
- 多対多(Many To Many)方式：図書カードと図書館の貸し出し記録。一人の人が多数の図書を借りられるし、1冊の図書は複数の人に貸し出される。

### Prismaのリレーション設定
- 相手側モデルを保管する項目を作る。複数の場合は配列を保管する項目を作る。
- 1対1（One To One）方式: 
```
model A {
  modelB B
}

model B {
  modelA A
}
```

- 1対多(One To Many)方式 / 多対1(Many To One)方式 ：
```
model A {
  modelB B[]
}
model B {
  modelA A
}
```

- 多対多(Many To Many)方式：
```
model A {
  modelB B[]
}
model B {
  modelA A[]
}
```
- これに加えて、連携先モデルのIDを保管する項目も必要。
```
model A {
  modelB B[]
}
model B {
  aId int // AモデルのID
  modelA A
}
```
- Bモデル側に、連携先のAモデルのレコードIDを保管する項目を用意する。

## メッセージボードアプリ（Twitterみたいな）の作成

### 必要なファイル
- モデル: UserとBoard
1. User: 既存のUserモデル
2. Board: メッセージの管理用

- ルーティング処理
1. users.js: Userを扱うusers.jsにログイン機能を追加する
2. board.js: メッセージボードのメイン部分。

- ビュー（テンプレート）
1. users/login.ejs: ログイン用のテンプレート
2. boards/index.ejs: メッセージボードのメインページ。
3. boards/home.ejs: 利用者のページ。
4. boards/data_item.ejs: 表示項目のバーシャル。ヘッダー、フッターなどの部品の切り出し。

### Boardモデルの作成
- 必要な項目：
1. id: レコードに割り当てられる識別用の値。
2. message: 投稿したメッセージのテキスト。
3. account: 投稿したユーザーのUserオブジェクト。accountIdの値を元にUserモデルから取得される。
4. accountId: accountのUserオブジェクトのid値。連携に必要なのはこの値。
5. createdAt: 作成日時。
6. updatedAt: 更新日時。

- Boardモデルを記述する。
```
model Board {
  id Int @id @default(autoincrement())
  message String
  account User @relation(fields: [accountId], references: [id])
  accountId Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- @relationによるリレーションの設定
`@relation(fields: 連携先のIDが保管されたフィールド, references: 連携先のIDフィールド)`
- 従モデル側に用意する。
- model Userに、`message Board[]`を追加する。

### 連携モデルの主従関係
- Userモデルは、Boardモデルがなくても使える。BoardモデルはUserとの連携がないと機能しない。つまり、Userが主で、Boardが従。
- @relationオプションは、従モデル側に用意する。連携しないと役割を果たせない側に用意する。
- @relationのない連携項目（例えば、Userモデルのmessage Board[]）は、findManyなどで取得する際は、includeというオプションを指定することで取得できる。

### ミグレーションの実行
`npx prisma migrate dev --name initial`
- 生成されたmigration.sqlの内容
```sql
CREATE TABLE "Board" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Board_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
```
- 注意：Userモデルは、`message Board[]`を追加したけど、messageというカラムは追加されない。Prismaによって値を割り当てるのに使われるだけ。

### Prisma Studioでデータベースを確認する
`npx prisma studio`を実行。

### セッション（session）を使うための前提設定
ログイン処理で `req.session` を使うには、先に express-session を導入し、アプリ全体でセッションミドルウェアを有効にしておく必要がある。設定しないと `req.session` が undefined になり、`Cannot set properties of undefined (setting 'login')` のようなエラーになる。

#### 1. express-session のインストール
```bash
npm install express-session
```

#### 2. app.js でセッションを有効にする
- **require を追加する**（他の require の近くに）
```js
const session = require("express-session");
```

- **ミドルウェアを追加する**  
  `cookieParser()` の**後**、ルーター（`app.use("/", indexRouter)` など）の**前**に書く。
```js
app.use(
  session({
    secret: "あなたの秘密の文字列", // 本番では環境変数（例: process.env.SESSION_SECRET）に出すとよい
    resave: false,
    saveUninitialized: false,
  })
);
```

この順番にすると、すべてのルートで `req.session` が使えるようになる。

#### 3. ルーター側での扱い
- **routes/users.js などで `express-session` を require する必要はない。**
- セッションは app.js で一度だけ有効にすれば、どのルートからも `req.session` にそのままアクセスできる。

### ログイン処理を作成する
- routes/users.jsに下記を追加。
```js
// ログイン画面の表示
router.get("/login", (req, res) => {
  res.render("users/login", {
    title: "ログイン",
    content: "ログイン画面",
  });
});

// ログイン処理
router.post("/login", async (req, res) => {
  const { name, pass } = req.body;
  try {
    // 条件: nameとpassの両方が一致するレコードだけ取得。戻り値は、条件に合うレコードの配列。(0件なら空配列[]。)
    const user = await prisma.user.findMany({
      where: { name, pass },
    });
    // user が存在し、かつ最初の要素も存在する場合（= name と pass が一致する User がいる場合）
    if (user != null && user[0] != null) {
      // ログイン情報をセッションに保存する。
      req.session.login = user[0];
      // ログイン前のページにリダイレクトする。
      let back = req.session.back; // ログイン前のページを取得する。
      if (back == null) {
        back = "/";
      }
      res.redirect(back);
    } else {
      const data = {
        title: "ログイン",
        content: "名前かパスワードに問題があります。再度入力してください。"
      }
      res.render("users/login", data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("error");
  }
});
```
- ポイントは、findUniqueではなく、findManyでnameとpassを元にレコードを検索して取り出す。
- findUniqueは、@idや@uniqueなど、一意と定義されているフィールドか、もしくは複合ユニーク（@@unique([a, b])でしか検索できない。nameは@unique(一意)だけど、passは一意ではない。なので、findMany（もしくはfindFirst）を使う必要がある。
- 別の書き方（findUnique を使う場合）:
name は @unique なので、name だけで 取得して、パスワードはコードで比較する方法なら findUnique が使えます。
```js
const user = await prisma.user.findUnique({
  where: { name },
});
if (user != null && user.pass === pass) {
  req.session.login = user;
  // ...
}
```
- なぜ「user と user[0] の両方を見る」と「name と pass が一致する User がいた」になるか。
1. 一致するレコードが1件以上あるとき
user は例えば` [{ id: 1, name: "太郎", pass: "xxx", ... }] `のような長さ1以上の配列になる。
→ user[0] はその1件目のオブジェクト（存在する）
→ 「user が存在し、かつ最初の要素も存在する」＝「name と pass が一致する User が少なくとも1件いた」という意味になる。

2. 一致するレコードが0件のとき
findMany は [] を返す。
→ user は配列なので user != null は true
→ しかし user[0] は「存在しない要素」なので undefined
→ user[0] != null が false になり、「一致する User はいなかった」と分かる。
つまり、
「最初の要素が存在する」＝配列の長さが 1 以上＝where: { name, pass } に合うレコードが1件以上ある
だから、「user が存在し、かつ最初の要素も存在する」ときは、name と pass が一致する User が存在したと言えます。

### login.ejsを作成する。
- views/users/login.ejsを作成する。
```html
<form method="post" action="/users/login">
  <div class="form-group">
    <label for="name">お名前</label>
    <input type="text" name="name" id="name" class="form-control" />
  </div>
  <div class="form-group">
    <label for="password">パスワード</label>
    <input type="password" name="password" id="password" class="form-control" />
  </div>
  <input type="submit" value="ログイン" class="btn btn-primary" />
</form>
<p class="mt-4">
  <a href="/boards">&lt;&lt; TOPへに戻る</a> | <a href="/users/add">アカウントの作成 &gt;&gt;</a>
</p>
```

### 

