const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../generated/prisma");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./mydb.db",
});
const prisma = new PrismaClient({ adapter });

// 一覧画面の表示
// router.get("/", async (req, res) => {
//   try {
//     const users = await prisma.user.findMany();
//     const data = {
//       title: "ユーザー一覧",
//       content: users,
//     };
//     res.render("users/index", data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).render("error");
//     // または適切なエラーハンドリング
//   }
// });

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

// 新規追加画面の表示
router.get("/add", (req, res) => {
  res.render("users/add", {
    title: "ユーザー追加",
    content: "新しいレコードを入力",
    form: { name: "", password: "", mail: "", age: 0 }, // 初期値を空に設定
  });
});

// 新規追加画面の処理
router.post("/add", async (req, res) => {
  const { name, password, mail, age } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, pass: password, mail, age: Number(age) ?? 0 },
    });
    res.redirect("/users/");
  } catch (error) {
    console.error(error);
    res.status(500).render("error");
  }
});

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
    user: user,
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
        content: "名前かパスワードに問題があります。再度入力してください。",
      };
      res.render("users/login", data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("error");
  }
});

module.exports = router;
