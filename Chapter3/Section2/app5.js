const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const { escape } = require("querystring");

const filePath_index = path.join(__dirname, "index5.ejs");
const index_page = fs.readFileSync(filePath_index, "utf-8");

const filePath_other = path.join(__dirname, "other.ejs");
const other_page = fs.readFileSync(filePath_other, "utf-8");

const filePath_style = path.join(__dirname, "style.css");
const style_css = fs.readFileSync(filePath_style, "utf-8");

const server = http.createServer(getFromClient);

server.listen(3000);
console.log("Server start!");

// 追加
let data = { msg: "no message...." };

// createServerの中身を関数化
function getFromClient(request, response) {
  const urlObj = new URL(request.url, `http://${request.headers.host}`);
  switch (urlObj.pathname) {
    case "/":
      response_index(request, response); // 追加
      break;
    case "/other":
      response_other(request, response);
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
  // POSTアクセス時の処理
  if (request.method === "POST") {
    let body = ""; // ここに、フォーム送信されたデータが文字列として入る。

    // データ受信のイベント処理
    // 本の書き方
    // request.on("data", (data) => {
    //   body += data;
    // });
    // 推奨の書き方は、.toString()をちゃんと書く。
    request.on("data", (data) => {
      body += data.toString();
    });

    // データ受信終了のイベント処理
    request.on("end", () => {
      // 本の書き方は、
      // data = qs.parse(body);
      const params = new URLSearchParams(body);
      data.msg = params.get("msg") ?? "";
      console.log(data); // { msg: 'フォームから送信された内容' } のように表示される。例）msg=%E3%83%86%E3%82%B9%E3%83%88
      console.log(params.get("msg")); // フォームから送信された内容だけが表示される。例）テスト

      // クッキーの保存
      setCookie("msg", data.msg, response);

      write_index(request, response); // index書き出し処理
    });
  } else {
    write_index(request, response); // index書き出し処理
  }
}

// indexの表示の作成
function write_index(request, response) {
  const msg = "これはIndexページです。伝言を表示します。";
  let cookie_data = getCookie("msg", request); // 追加：クッキー取得
  let content = ejs.render(index_page, {
    title: "Index",
    content: msg,
    data: data,
    cookie_data: cookie_data,
    filename: filePath_index, // index.ejs のフルパスを渡す！
  });
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.write(content);
  response.end();
}

// クッキーの値を設定
// 本の書き方
// function setCookie(key, value, response) {
//   // クッキーの保存
//   const cookie = escape(value);
//   response.setHeader("Set-Cookie", [key + "=" + cookie]);
// }
function setCookie(key, value, response) {
  const cookie = encodeURIComponent(value);
  response.setHeader("Set-Cookie", `${key}=${cookie}; Path=/; HttpOnly; SameSite=Lax`);
}

// クッキーの値を取得
// 本の書き方: unescapeが非推奨
// function getCookie(key, request) {
//   const cookie_data = request.headers.cookie != undefined ? request.headers.cookie : "";
//   const data = cookie_data.split("; ");
//   for (let i in data) {
//     if (data[i].startsWith(key + "=")) {
//       const result = data[i].substring((key + "=").length + 1);
//       return unescape(result);
//     }
//   }
//   return "";
// }
function getCookie(key, request) {
  const cookieHeader = request.headers.cookie ?? "";
  const pairs = cookieHeader.split("; ");

  for (const p of pairs) {
    if (p.startsWith(key + "=")) {
      const raw = p.substring((key + "=").length); // ← +1しない
      return decodeURIComponent(raw);
    }
  }
  return "";
}

// 追加：otherのアクセス処理
function response_other(request, response) {
  const msg = "これはOtherページです。";
  let content = ejs.render(other_page, {
    title: "Other",
    content: msg,
    data: data,
    filename: filePath_other, // other.ejs のフルパスを渡す！
  });
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.write(content);
  response.end();
}
