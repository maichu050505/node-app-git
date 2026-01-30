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
router.get("/", (req, res) => {
  db.all("SELECT * FROM mydata", (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    res.render("hello/index", {
      title: "Hello",
      content: rows,
    });
  });
});

router.get("/show", (req, res) => {
  const id = req.query.id; // クエリパラメータからidを取得。クエリパラメータが、?id=9の時、req.query.id = 9 になる。
  db.get("SELECT * FROM mydata WHERE id = ?", [id], (err, row) => {
    if (err) return next(err);

    if (!row) {
      return res.status(404).send("データが見つかりません");
    }

    res.render("hello/show", {
      title: "Hello/Show",
      content: "id = " + id + " のレコード",
      mydata: row,
    });
  });
});

// GETアクセスの処理（本の書き方）
// router.get("/", (req, res) => {
//   // データベースのシリアライズ
//   db.serialize(() => {
//     // SQL文の実行
//     db.all("SELECT * FROM mydata", (err, rows) => {
//       if (!err) {
//         var data = {
//           title: "Hello",
//           content: rows, // 取得したレコードデータ
//         };
//         // hello.ejsのレンダリング
//         res.render("hello", data);
//       }
//     });
//   });
// });

module.exports = router;
