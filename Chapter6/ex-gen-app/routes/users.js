var express = require("express");
var router = express.Router();

const { PrismaClient } = require("../generated/prisma");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./mydb.db",
});
const prisma = new PrismaClient({ adapter });

// 一覧画面の表示
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

// 本の書き方 thenを使った場合
// router.get("/", async (req, res) => {
//   prisma.user.findMany().then((users) => {
//     const data = {
//       title: "ユーザー一覧",
//       content: users,
//     };
//     res.render("users/index", data);
//   });
// });

module.exports = router;
