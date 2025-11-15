const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
// const url = require("url"); // url.parse()は非推奨なので不要

const filePath_index = path.join(__dirname, "index.ejs");
const index_page = fs.readFileSync(filePath_index, "utf-8");

const server = http.createServer(getFromClient);

server.listen(3000);
console.log("Server start!");

// createServerの中身を関数化
function getFromClient(request, response) {
  // url.parse()は非推奨。第二引数にtrueを入れるとクエリーパラメーターもパース処理される。
  //   var url = url.parse(request.url, true);
  const urlObj = new URL(request.url, `http://${request.headers.host}`);
  switch (urlObj.pathname) {
    case "/":
      let content = "これはIndexページです。";
      // 非推奨な方法。queryというプロパティに、パースされたクエリーパラメーターのオブジェクトが入っている。
      //   var query = url.query;

      // ?msg=○○ の値を取得
      // 非推奨な方法
      //   if (query.msg != undefined) {
      //     content += "あなたは、「" + query.msg + "」と送りました。";
      //   }

      // new URL(...) で作ったオブジェクトにはクエリ文字列は searchParams から取り出す。
      const msg = urlObj.searchParams.get("msg");
      if (msg) {
        content += "あなたは、「" + msg + "」と送りました。";
      }
      const html = ejs.render(index_page, {
        title: "index",
        content: content,
      });
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.write(html);
      response.end();
      break;
    default:
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("no page...");
      break;
  }
}
