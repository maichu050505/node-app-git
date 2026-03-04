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
- formのactionは、/users/login にする。
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

### boards.jsを作成する
- routes/boards.jsを作成する。
#### ログイン状態かどうかチェックする関数。
```js
// ログインチェック関数
function checkLogin(req, res) {
  if (req.session.login == null) {
    req.session.back = "/boards";
    res.redirect("/users/login");
    return true;
  } else {
    return false;
  }
}
```
- セッションからloginという値がnullかどうかを調べている。
- users.jsで、ログイン成功時に`req.session.login = user;`のように req.session.login にユーザー情報を入れているので、nullならログインしていないということになる。その場合、ログインページにリダイレクトし、trueを返す。
- `req.session.back = "/boards";`で、ログイン後に戻るページのアドレスを入れておく。user.jsで、ログインが成功した時に、`const back = req.session.back;`で取り出し、`res.redirect(back);`でリダイレクトしている。

#### トップページにアクセスした処理
```js
// トップページにページ番号をつけてアクセス
router.get("/:page", async (req, res, next) => {
  if (checkLogin(req, res)) return;
  const page = Number(req.params.page);
  try {
    const boards = await prisma.board.findMany({
      skip: page * pnum,
      take: pnum,
      orderBy: [
        { createdAt: "desc" }
      ],
      include: {
        account: true,
      },
    });
    const data = {
      title: "Boards",
      login: req.session.login,
      content: boards,   // 本の brds に相当
      page: page,
    };
    res.render("boards/index", data);
  } catch (err) {
    next(err); // Expressのエラーハンドラへ
  }
});
```
- まず、ログインチェック関数で、ログインしているかどうかをチェックする。trueならログインしていないので、returnでおしまい。ログインチェック関数の`res.redirect("/users/login");`でログインページにリダイレクトする。
- `const page = Number(req.params.page);`で、/1 などのURLの末尾についたページ数を取得する。
- そして、Boardから指定のページのレコードを取り出す。
- `orderBy: [{ createdAt: "desc" }],`で、新しい投稿から順にソートを指定している。
- `include: { account: true, },`この部分で、関連づけられた他のモデル（連携モデル）を読み込む。このaccountというのは、Boardモデルの項目で、ここにUserが保管できるようになっている。このincludeにより、実際にUserがaccountに代入されるようになる。

#### メッセージの追加
- フォーム送信されたメッセージをBoardに追加する処理。下記の部分で実行している。
```js
await prisma.board.create({
  data: {
    accountId: req.session.login.id,
    message: req.body.msg,
  },
});
res.redirect("/boards");
```
- accountIdには、req.session.login.idで、セッションに保管されているログインユーザーのUserからidを取り出し設定している。
- messageには、req.body.messageで送信されたフォームのmsgを設定。
- これをcreateで保存後、/boadsにリダイレクトすれば作業完了。

#### ホームの表示
```js
// 利用者のホーム
router.get("/home/:user/:id/:page", async (req, res, next) => {
  if (checkLogin(req, res)) return;
  const id = Number(req.params.id);
  const page = Number(req.params.page);
  try {
    const boards = await prisma.board.findMany({
      where: { accountId: id },
      skip: page * pnum,
      take: pnum,
      orderBy: [
        { createdAt: "desc" }
      ],
      include: {
        account: true,
      },
    });
    const data = {
      title: "Boards",
      login: req.session.login,
      accountId: id,
      userName: req.params.user,
      content: boards,   // 本の brds に相当
      page: page,
      };     
      res.render("boards/home", data);
    } catch (err) {
      next(err); // Expressのエラーハンドラへ
    }
  });
```
- まず、`const id = req.params.id;`と、`const page = req.params.page;`で、ユーザーIDとページ番号をURLから取得し、変数に代入する。
- そして、これらのユーザーIDとページ番号を元に、Boardの該当レコードをfindManyで取り出す。
- includeでは、accountの項目（Userモデルの1件分のオブジェクト）も合わせて取り出す。
- schema.prismaのmodel Boardの意味は、
1. accountId: Board側の外部キー（どのUserかはこの数値で紐づく）
2. accout User @relation(...): このBoardは一人のUserに属するという関連の定義。
fields: [accountId]	このモデル（Board）側のカラム。ここに「どの User か」を表す値が入る。
references: [id]	相手モデル（User）側のカラム。User のどのフィールドを指すか。
- この定義があるから、include: { account: true }で、そのBoardに紐づくUserを一緒に取ることができる。
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
- 実際の返り値は、こんな感じ。
```js
{
  id: 1,
  message: "こんにちは",
  accountId: 5,           // 紐づく User の id
  account: {               // ← ここが「User モデルのオブジェクト」
    id: 5,
    name: "太郎",
    pass: "...",
    mail: "taro@example.com",
    age: 20,
    createdAt: ...,
    updatedAt: ...
  },
  createdAt: ...,
  updatedAt: ...
}
```

### boards.jsをapp.jsに組み込む。
```js
const boardsRouter = require("./routes/boards");
app.use("/boards", boardsRouter);
```

### テンプレートを作成する。
1. index.ejs: /boardsのトップページ
2. home.ejs: ホームページ
3. data_item.ejs: パーシャル

#### index.ejsを作成する
- views/boads/index.ejsを作成。
- 下記のように、投稿を送信できるformを設置。
```html
<form action="/boards/add" method="post">
  <div class="row">
    <div class="col-md-10">
      <input type="text" name="msg" id="msg" class="form-control" />
    </div>
    <div class="col-2">
      <input type="submit" value="送信" class="btn btn-primary" />
    </div>
  </div>
</form>
```
- 投稿メッセージは、下記のように、`<%- include("data_item", { val: content[i] }) %>`で、data_item.ejsを読み込み、引数にval: content[i]を渡している。このcontentがデータベースから取得したBoardモデルの配列。つまり、valにBoardモデルを設定して、data_item.ejsを呼び出している。
```html
<table class="table mt-5">
  <% for(let i in content) { %>
  <%- include("data_item", { val: content[i] }) %>
  <% } %>
</table>
```

#### home.ejsを作成。
- views/boards/home.ejsを作成する。
- これは、特定のユーザーの投稿を一覧表示するもの。
- メッセージの一覧部分は、contentから順にオブジェクトを取り出して、includeでdata_item.ejsを表示する。
```html
<table class="table mt-5">
  <% for(let i in content) { %>
    <%- include("data_item", { val: content[i] }) %>
  <% } %>
</table>
```

#### data_item.ejsを作成する。
- views/boards/data_item.ejsを作成。
- 渡されたBoardの内容を、tableタグのtrタグとして生成する。WordPressでループの中身をpartsに切り出すのと似ている。

### ログアウト処理を作る（本には書いていない）
- このアプリでは、
ログイン時: req.session.login = user[0]; でセッションにユーザー情報を保存。
ログインチェック: checkLogin で req.session.login == null かどうかで判定。
なので、ログアウト = req.session.login を消す（セッションを破棄する） ことです。
典型的な実装例
routes/users.js に、ログアウト用のルートを 1 つ追加する。
```js
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err); // エラーハンドラへ
    }
    // 必要ならクッキーも消す
    // res.clearCookie("connect.sid");
    res.redirect("/users/login"); // または "/" など好きな場所へ
  });
  res.redirect("/users/login");
});
```

あとは、テンプレート側に、`<a href="/users/logout">ログアウト</a>`をつければログアウトできる。
