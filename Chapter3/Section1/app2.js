const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
// const qs = require("querystring"); // 非推奨

const filePath_index = path.join(__dirname, "index2.ejs");
const index_page = fs.readFileSync(filePath_index, "utf-8");

const filePath_other = path.join(__dirname, "other.ejs");
const other_page = fs.readFileSync(filePath_other, "utf-8");

const filePath_style = path.join(__dirname, "style.css");
const style_css = fs.readFileSync(filePath_style, "utf-8");

const server = http.createServer(getFromClient);

server.listen(3000);
console.log("Server start!");

// createServerの中身を関数化
function getFromClient(request, response) {
  const urlObj = new URL(request.url, `http://${request.headers.host}`);
  switch (urlObj.pathname) {
    case "/":
      response_index(request, response); // 追加
      break;
    case "/other":
      response_other(request, response); // 追加
      break;
    case "/style.css":
      response.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
      response.write(style_css);
      response.end();
      break;
    default:
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("no page...");
      break;
  }
}

// 追加：indexのアクセス処理
function response_index(request, response) {
  const msg = "これはIndexページです。";
  let content = ejs.render(index_page, {
    title: "Index",
    content: msg,
  });
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.write(content);
  response.end();
}

// 追加：otherのアクセス処理
function response_other(request, response) {
  let msg = "これはOtherページです。";

  // POSTアクセス時の処理
  if (request.method === "POST") {
    let body = "";

    // データ受信のイベント処理
    // 本に書いてある方法：JavaScript の + 演算子はどっちかが string → もう片方も string に強制変換するという仕様のためJavaScript 側が勝手に toString してるので、たまたま動いてる。でも、たまたま動いているコードは危険なので非推奨。
    // request.on("data", (data) => {
    //   body += data;
    // });

    // 推奨の書き方は、.toString()をちゃんと書く。
    request.on("data", (data) => {
      body += data.toString();
    });

    // データ受信終了のイベント処理
    request.on("end", () => {
      // データのパース
      // 非推奨の書き方
      // const post_data = qs.parse(body);
      // msg += "あなたは、「" + post_data.msg + "」と書きました。";

      // 推奨の書き方は、new URLSearchParams(body)
      const params = new URLSearchParams(body);
      const userMsg = params.get("msg");
      msg += `あなたは、「${userMsg}」と書きました。`;

      let content = ejs.render(other_page, {
        title: "Other",
        content: msg,
      });
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.write(content);
      response.end();
    });

    // GETアクセス時の処理
  } else {
    msg = "ページがありません。";
    let content = ejs.render(other_page, {
      title: "Other",
      content: msg,
    });
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.write(content);
    response.end();
  }
}
