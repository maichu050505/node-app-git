const express = require("express");
const router = express.Router();

// 追加
const sqlite3 = require("sqlite3");

// データベースオブジェクトの取得
const path = require("path");
const dbPath = path.join(__dirname, "../../../mydb.db"); // データベースファイルのパス
console.log("Using DB:", dbPath);
const db = new sqlite3.Database(dbPath);

// GETアクセスの処理
router.get("/add", (req, res) => {
  res.render("hello/add", { title: "Hello/Add", content: "新しいレコードを入力" });
});

// POSTアクセスの処理
router.post("/add", (req, res, next) => {
  const { name, mail, age } = req.body;
  // const name = req.body.name;
  // const mail = req.body.mail;
  // const age = req.body.age;

  db.run(
    "INSERT INTO mydata (name, mail, age) VALUES (?, ?, ?)",
    [name, mail, age],
    function (err) {
      if (err) return next(err); // エラーはExpressのエラーハンドラへ
      res.redirect("/hello/"); // 成功したらリダイレクト
    },
  );
});

module.exports = router;
