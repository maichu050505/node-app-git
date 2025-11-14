const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

filePath = path.join(__dirname, "index2.ejs");
const index_page = fs.readFileSync(filePath, "utf-8");

var server = http.createServer(getFromClient);

server.listen(3000);
console.log("Server start!");

// createServerの中身を関数化
function getFromClient(request, response) {
  // レンダリング
  var content = ejs.render(index_page, {
    title: "Indexページ",
    content: "これはテンプレートを使ったサンプルページです。",
  });
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(content);
  response.end();
}
