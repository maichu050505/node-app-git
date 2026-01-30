const express = require("express");
const router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  const name = req.query.name || "ゲスト";
  const mail = req.query.mail || "未登録";
  const data = {
    title: "Hello!",
    content: `こんにちは、${name}さん。メールアドレスは${mail}ですね。`,
  };
  res.render("hello", data);
});

router.post("/post", function (req, res, next) {
  const msg = req.body["message"] || "メッセージはありません";
  const data = {
    title: "Hello!",
    content: `あなたのメッセージ：${msg}`,
  };
  res.render("hello", data);
});

module.exports = router;
