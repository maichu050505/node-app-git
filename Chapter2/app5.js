const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

filePath = path.join(__dirname, "index.ejs");
const index_page = fs.readFileSync(filePath, "utf-8");

const server = http.createServer(getFromClient);

server.listen(3000);
console.log("Server start!");

// createServerの中身を関数化
function getFromClient(request, response) {
  const content = ejs.render(index_page); // レンダリング
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(content);
  response.end();
}
