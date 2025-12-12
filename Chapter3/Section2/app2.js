const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

const filePath_index = path.join(__dirname, "index2.ejs");
const index_page = fs.readFileSync(filePath_index, "utf-8");

const filePath_style = path.join(__dirname, "style.css");
const style_css = fs.readFileSync(filePath_style, "utf-8");

const server = http.createServer(getFromClient);

server.listen(3000);
console.log("Server start!");

// 追加
let data = {
  Taro: "090-9999-9999",
  Hanako: "080-888-888",
  Sachiko: "070777-777",
  Ichiro: "060-666-666",
};

// createServerの中身を関数化
function getFromClient(request, response) {
  const urlObj = new URL(request.url, `http://${request.headers.host}`);
  switch (urlObj.pathname) {
    case "/":
      response_index(request, response); // 追加
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
    data: data,
    filename: filePath_index, // index.ejs のフルパスを渡す！
  });
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.write(content);
  response.end();
}
