const express = require("express");
const router = express.Router();

// Markdown-itをインストール
const markdown = require("markdown-it");
const md = new markdown();

// Prismaをインストール
const { PrismaClient } = require("../generated/prisma");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./mydb.db",
});
const prisma = new PrismaClient({ adapter });

// ログインチェックの関数
function checkLogin(req, res) {
  if (req.session.login == null) {
    req.session.back = "/";
    return true;
  } else {
    return false;
  }
}

// ログインチェック
router.get("/check", (req, res) => {
  if (checkLogin(req, res)) {
    // ログインしていない場合は、result: falseを返す。
    res.status(401).json({ result: false });
  } else {
    // ログインしている場合は、result: trueを返す。
    res.json({ result: req.session.login.name });
  }
});

// 全データ取得
router.get("/all", async (req, res) => {
  if (checkLogin(req, res)) {
    res.status(401).json({ result: false });
    return;
  } 
  const markdata = await prisma.markdata.findMany({
    where: { accountId: Number(req.session.login.id) },
    orderBy: [
      { createdAt: "desc" }
    ],
  });
  res.json(markdata);
});

// 指定IDのMarkdataを取得
router.get("/mark/:id", async (req, res) => {
  if (checkLogin(req, res)) {
    res.status(401).json({ result: false });
    return;
  }
  const markdata = await prisma.markdata.findMany({
    where: {
      id: Number(req.params.id),
      accountId: Number(req.session.login.id),
    },
    orderBy: [{ createdAt: "desc" }],
  });
  // 結果が0件ならnull, 1件以上なら先頭だけ返す。
  const model =
    markdata != null // ①　配列そのものがnullでない場合
      ? markdata[0] != null // ②　先頭要素がnullでない場合
        ? markdata[0] // → trueなら先頭要素を返す。
        : null // → falseならnullを返す。
      : null; // ① がfalse（配列自体がない）ならnullを返す。
  // もしくは、三項演算子を使って、下記のように書くこともできる。条件 ? A : B。条件がtrueならA, falseならBを返す。
  // const model = markdata && markdata.length > 0 ? markdata[0] : null;
  res.json(model);
});

// Markdataの新規作成
router.post("/add", async (req, res) => {
  if (checkLogin(req, res)) {
    res.status(401).json({ result: false });
    return;
  }
  const { title, content } = req.body;
  const markdata = await prisma.markdata.create({
    data: { title, content, accountId: Number(req.session.login.id) },
  });
  res.json(markdata);
});

// Markdataの更新
router.post("/mark/edit", async (req, res) => {
  if (checkLogin(req, res)) {
    res.status(401).json({ result: false });
    return;
  }
  const { title, content } = req.body;
  const markdata = await prisma.markdata.update({
    where: { id: Number(req.body.id) },
    data: { title, content },
  });
  res.json(markdata);
});

// Markdataのレンダリング結果
router.post("/mark/render", async (req, res) => {
  if (checkLogin(req, res)) {
    res.status(401).json({ result: false });
    return;
  }
  const { source } = req.body; // クライアントから送られてきた Markdown テキストを受け取る。source に Markdown 文字列が入る。
  const ren = md.render(source); // Markdown-it で Markdown 文字列を HTML に変換する。（レンダリング）
  const result = { render: ren }; // 変換結果をJSのオブジェクトにする。
  res.json(result); // それをJSON形式でクライアントに返す。
});

module.exports = router;