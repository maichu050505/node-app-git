const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../generated/prisma");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { skip } = require("../generated/prisma/runtime/client");
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./mydb.db",
});
const prisma = new PrismaClient({ adapter });

const pnum = 5; // 1ページに表示するレコード数

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

// トップページ
router.get("/", (req, res) => {
  res.redirect('boards/0');
});

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

// メッセージフォームの送信処理
router.post("/add", async (req, res, next) => {
  if (checkLogin(req, res)) return;
  try {
    await prisma.board.create({
      data: {
        accountId: req.session.login.id,
        message: req.body.msg,
      },
    });
    res.redirect("/boards");
  } catch (error) {
    console.error(error);
    res.redirect("/boards/add");
  }
});

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
  
module.exports = router;