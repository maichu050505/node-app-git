var express = require("express");
var router = express.Router();

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

// idが指定されていない場合は一覧画面を表示、指定されている場合は詳細画面を表示
router.get("/", async (req, res) => {
  const id = +req.query.id;
  if (!id) {
    try {
      const users = await prisma.user.findMany();
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

module.exports = router;
