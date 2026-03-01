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
router.get("/hello2", (req, res, next) => {
  let rows = "";
  db.each(
    "SELECT * FROM mydata",
    (err, row) => {
      if (err) return next(err);
      rows += "<tr><th>" + row.id + "</th><td>" + row.name + "</td></tr>";
    },
    (err, count) => {
      if (err) return next(err);
      res.render("hello/hello2", { title: "Hello2", content: rows });
    },
  );
});

module.exports = router;
