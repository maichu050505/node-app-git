const express = require("express");
const router = express.Router();

// 追加
const sqlite3 = require("sqlite3");

// バリデーション用
const { check, validationResult } = require("express-validator");

// データベースオブジェクトの取得
const path = require("path");
const dbPath = path.join(__dirname, "../../../mydb.db"); // データベースファイルのパス
console.log("Using DB:", dbPath);
const db = new sqlite3.Database(dbPath);

// 一覧画面の表示
router.get("/", (req, res) => {
  db.all("SELECT * FROM mydata", (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    res.render("hello/index", {
      title: "Hello",
      content: rows,
      find: "", // 検索文字列用
    });
  });
});

// 詳細画面の表示
router.get("/show", (req, res, next) => {
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

// 新規追加画面の表示
router.get("/add", (req, res) => {
  res.render("hello/add", {
    title: "Hello/Add",
    content: "新しいレコードを入力",
    form: { name: "", mail: "", age: 0 }, // 初期値を空に設定
  });
});

// 新規追加内容の保存
router.post(
  "/add",
  [
    check("name", "お名前は必ず入力してください。").notEmpty().escape(),
    check("mail", "メールアドレスは有効なメールアドレスを入力してください。").isEmail().escape(),
    check("age", "年齢は0以上の整数を入力してください。").isInt({ min: 0 }),
    check("age", "年齢はゼロ以上120以下で入力してください。").custom((value) => {
      return value >= 0 && value <= 120;
    }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // バリデーションエラーがある場合
      let result = "<ul class='text-danger'>";
      const result_arr = errors.array();
      for (let n in result_arr) {
        result += "<li>" + result_arr[n].msg + "</li>";
      }
      result += "</ul>";
      const data = {
        title: "Hello/Add",
        content: result,
        form: req.body,
      };
      return res.render("hello/add", data);
    } else {
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
        }
      );
    }
  }
);

// 編集画面の表示
router.get("/edit", (req, res, next) => {
  const id = req.query.id;
  db.get("SELECT * FROM mydata WHERE id = ?", [id], (err, row) => {
    if (err) return next(err);

    if (!row) {
      return res.status(404).send("データが見つかりません");
    }
    res.render("hello/edit", {
      title: "Hello/Edit",
      content: "id = " + id + " のレコードを編集",
      mydata: row,
    });
  });
});

// 編集内容の保存
router.post("/edit", (req, res, next) => {
  const { id, name, mail, age } = req.body;
  // const id = req.body.id;
  // const name = req.body.name;
  // const mail = req.body.mail;
  // const age = req.body.age;

  db.run(
    "UPDATE mydata SET name = ?, mail = ?, age = ? WHERE id = ?",
    [name, mail, age, id],
    (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/hello"); // 更新後、一覧画面へリダイレクト
    }
  );
});

// 削除画面の表示
router.get("/delete", (req, res, next) => {
  const id = req.query.id; // クエリパラメータからidを取得。getなのでreq.query.id
  db.get("SELECT * FROM mydata WHERE id = ?", [id], (err, row) => {
    if (err) return next(err);

    if (!row) {
      return res.status(404).send("データが見つかりません");
    }
    res.render("hello/delete", {
      title: "Hello/Delete",
      content: "id = " + id + " のレコードを削除",
      mydata: row,
    });
  });
});

// 削除処理
router.post("/delete", (req, res, next) => {
  const id = req.body.id; // postなのでreq.body.id。postなのでフォームのbodyから取得。
  db.run("DELETE FROM mydata WHERE id = ?", [id], (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/hello"); // 削除後、一覧画面へリダイレクト
  });
});

// 検索処理（条件文をそのまま受け取る危険な実装例）
router.get("/find", (req, res) => {
  const find = req.query.find;
  const q = "SELECT * FROM mydata WHERE ";
  db.all(q + find, [], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    res.render("hello/index", {
      title: "Hello",
      content: rows,
      find: find,
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
