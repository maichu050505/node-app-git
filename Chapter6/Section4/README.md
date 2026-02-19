# orderByによるレコードのソート
- findManyの引数のオプションにorderByという項目を設定する。
```js
{
  orderBy: [...],
  where: {...},
}
```
- orderByは配列の形で用意する。`{フィールド: 並び順}`
- 並び順の値は、asc: 小さいものから並べる。desc: 大きいものから並べる。
- 実際の使用例：
```js
// idが指定されていない場合は一覧画面を表示、指定されている場合は詳細画面を表示
router.get("/", async (req, res) => {
  const id = +req.query.id;
  if (!id) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { name: "asc" }, // name順にソート
      });
      const data = {
        title: "ユーザー一覧",
        content: users,
        isDetailView: false, // 詳細画面を表示しているかどうかを判断するためのフラグ
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
      isDetailView: true, // 詳細画面を表示しているかどうかを判断するためのフラグ
    };
    res.render("users/index", data);
    }
  }
);
```

## skipとtakeによるページネーション
- skip: 指定した数だけレコードをスキップする。例）skip: 10とすると、最初の10レコードをスキップ。11番目からレコードを取得。
- take: 取得するレコード数を指定。10レコードだけ取り出したい場合は、take: 10とする。
- 使用例：
```js
// ページネーションの実装 users?page=番号のようにクエリでページ番号を指定する。
const pagesize = 3; // 1ページに表示するレコード数

// idが指定されていない場合は一覧画面を表示、指定されている場合は詳細画面を表示
router.get("/", async (req, res) => {
  const id = +req.query.id;
  if (!id) {
    const page = req.query.page ? +req.query.page : 0; // ページ番号
    try {
      const users = await prisma.user.findMany({
        orderBy: { name: "asc" },
        skip: page * pagesize,
        take: pagesize,
      });
      const data = {
        title: "ユーザー一覧",
        content: users,
        isDetailView: false, // 詳細画面を表示しているかどうかを判断するためのフラグ
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
      isDetailView: true, // 詳細画面を表示しているかどうかを判断するためのフラグ
    };
    res.render("users/index", data);
  }
}
);
```

## カーソルによるページネーション
- カーソルとは、現在、どのレコードを表示しているかという表示位置を示す値。
- `cursor: {レコードの指定}`
- `cursor: { id: 1}`
- findManyの引数のオプジェクトに、このような形でcursorを用意すると、その場所からレコードを作成する。skipは不要。
- 使用例：/users/にアクセスすると1~3番目を表示、リロードすると、4~6番目を表示。
```js
// ページネーションの実装 users?page=番号のようにクエリでページ番号を指定する。
const pagesize = 3; // 1ページに表示するレコード数
let cursor = null; // カーソル

// idが指定されていない場合は一覧画面を表示、指定されている場合は詳細画面を表示
router.get("/", async (req, res) => {
  const id = +req.query.id;
  if (!id) {
    const page = req.query.page ? +req.query.page : 0; // ページ番号
    try {
      const findManyArgs = {
        orderBy: { id: "asc" },
        // cursor: { id: cursor },
        take: pagesize,
      };
      // 2ページ目以降は「カーソル行」を飛ばして「次から」取る
      if (cursor != null) {
        findManyArgs.cursor = { id: cursor }; 
        findManyArgs.skip = 1; // カーソル行を飛ばして「次から」取る。cursor: { id: 3 } だけだと3~5番目を表示してしまう。
      }
      const users = await prisma.user.findMany(findManyArgs);

      if (users.length > 0) {
        cursor = users[users.length - 1].id; // 次のカーソル行を設定。今表示した 3 件のうち、最後のレコードの id を cursor に保存している。
      } else {
        cursor = null; // 終端なら先頭に戻す
      }
      const data = {
        title: "ユーザー一覧",
        content: users,
        isDetailView: false, // 詳細画面を表示しているかどうかを判断するためのフラグ
      };
      res.render("users/index", data);
    } catch (error) {
      console.error(error);
      res.status(500).render("error", {
        message: error.message || "エラーが発生しました",
        error: {
          status: 500,
          stack: error.stack || "", // エラーのスタックトレース。エラーが起きた場合に、どのファイルのどの行で例外が起きたかを表示する。
        },
      });
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
      isDetailView: true, // 詳細画面を表示しているかどうかを判断するためのフラグ
    };
    res.render("users/index", data);
  }
}
);
```

## ミドルウェアの利用
- ミドルウェアとは、Prisma でクエリを実行するたびに、その前後に共通の処理を挟む仕組み。
- 例: 全クエリをログに出す、実行時間を計る、特定のモデルだけ条件を足す、など

### ミドルウェアの作成
```js
prisma.$use(async (params, next) => {
  // ---- 実行前の処理 ----
  const result = await next(params);
  // ---- 実行後の処理 ----
  return result;
})
```
- コードの意味：
prisma.$use(...): 「この Prisma インスタンスで、これから書く関数をミドルウェアとして登録する」
params：これから実行されるクエリの情報（どのモデルか、どの操作か、引数は何か、など）
next：「実際にそのクエリを実行する関数」。next(params) を呼ぶと DB にクエリが飛ぶ
await next(params)：クエリを実行し、その結果（返ってきたデータ） が result に入る
return result：その結果をそのまま（または加工して）返す。これが prisma.user.findMany() などの戻り値になる
- つまり:
await next(params) の前 → クエリが DB に送られる「前」の処理
await next(params) → ここで実際にクエリが実行される
await next(params) の後 → クエリ結果を受け取った「後」の処理
return result → 呼び出し元（例: const users = await prisma.user.findMany(...)）に返す値
- ただし、この書き方はレガシー寄り。今は、Prisma Client Extensions（拡張）が推奨されている。
- Prisma Client Extensionの使用例：
```js
const { PrismaClient } = require("../generated/prisma");
// ... adapter など ...

const prisma = new PrismaClient({ adapter });

const extendedPrisma = prisma.$extends({
  name: "logQueries",
  query: {
    user: {
      async findMany({ args, query }) {
        console.log("findMany の前", args);
        const result = await query(args);
        console.log("findMany の後", result.length, "件");
        return result;
      },
    },
  },
});

// 以降は extendedPrisma を使う
const users = await extendedPrisma.user.findMany({ take: 10 });
```

- $use（ミドルウェア）は、すべての操作が同じ 1 本の関数に渡るが、$extends（Client Extensions）は、モデル・操作ごとに定義できる。

# 様々なSQLデータベースの設定
- Prismaでは、データベースの設定は、prisma/schema.prismaに記述されている。このファイルのdatasource dbの情報を元に、使用するデータベースが決まる。
- SQLite3の場合：
```
datasource db {
  provider = "sqlite"
}
```
- MySQLの場合
```
datasource db {
  provider = "mysql"
}
```
- PostgreSQLの場合
```
datasource db {
  provider = "postgresql"
}
```
- url（ファイルパス）の値は、.envに、`DATABASE_URL="file:./mydb.db"`などと記述。
