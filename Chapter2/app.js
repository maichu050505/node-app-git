// httpオブジェクトを読み込む
const http = require("http");

// サーバーオブジェクトの作成
var server = http.createServer((request, response) => {
  response.end('<h1 style="color:blue;">Hello World</h1>');
});

// serverを待ち受け状態にする（サーバーの起動）
server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
