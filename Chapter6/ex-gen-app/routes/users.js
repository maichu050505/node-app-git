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

module.exports = router;
