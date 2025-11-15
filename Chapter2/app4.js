const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer(getFromClient);

server.listen(3000);
console.log("Server start!");

// createServerの中身を関数化
function getFromClient(req, res) {
  request = req;
  response = res;
  filePath = path.join(__dirname, "index.html");
  fs.readFile(filePath, "utf8", (error, data) => {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(data);
    response.end();
  });
}
