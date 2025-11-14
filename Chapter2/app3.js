const http = require("http");
const fs = require("fs");
const path = require("path");

var server = http.createServer((request, response) => {
  const filePath = path.join(__dirname, "index.html"); // ← app3.js と同じディレクトリ内
  fs.readFile(filePath, "utf8", (error, data) => {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(data);
    response.end();
  });
});

server.listen(3000);
console.log("Server start!");
