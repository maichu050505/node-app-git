const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const url = require("url");

filePath_index = path.join(__dirname, "index2.ejs");
const index_page = fs.readFileSync(filePath_index, "utf-8");
filePath_other = path.join(__dirname, "other.ejs");
const other_page = fs.readFileSync(filePath_other, "utf-8");
filePath_css = path.join(__dirname, "style.css");
const style_css = fs.readFileSync(filePath_css, "utf-8");

const server = http.createServer(getFromClient);

server.listen(3000);
console.log("Server start!");

// createServerの中身を関数化
function getFromClient(request, response) {
  // url.parse()は非推奨
  //   var url = url.parse(request.url);
  const url = new URL(request.url, `http://${request.headers.host}`);
  switch (url.pathname) {
    case "/":
      // レンダリング
      const content = ejs.render(index_page, {
        title: "Index",
        content: "これはテンプレートを使ったサンプルページです。",
      });
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(content);
      response.end();
      break;
    case "/style.css":
      response.writeHead(200, { "Content-Type": "text/css" });
      response.write(style_css);
      response.end();
      break;
    case "/other":
      const html = ejs.render(other_page, {
        title: "Other",
        content: "これは新しく用意したページです。",
      });
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(html);
      response.end();
      break;
    default:
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.end("no page...");
      break;
  }
}
