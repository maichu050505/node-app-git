var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  const data = {
    title: "Hello!",
    content: "これはサンプルのコンテンツです。<br>this is sample content.",
  };
  res.render("hello", data);
});

module.exports = router;
