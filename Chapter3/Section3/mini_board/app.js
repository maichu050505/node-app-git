const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

const filePath_index = path.join(__dirname, "index.ejs");
const index_page = fs.readFileSync(filePath_index, "utf-8");

const filePath_login = path.join(__dirname, "login.ejs");
const login_page = fs.readFileSync(filePath_login, "utf-8");

const max_num = 10; // メッセージの最大保存数
const filename = "mydata.txt"; // データ保存ファイル名
let message_data = []; // メッセージ保存用配列
readFromFile(filename); // ファイルからデータ読み込み

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
    case "/login":
      response_login(request, response);
      break;
    default:
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("no page...");
      break;
  }
}

// ログインのアクセス処理
function response_login(request, response) {
  let content = ejs.render(login_page, {});
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.write(content);
  response.end();
}

// indexのアクセス処理
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
      const id = (params.get("id") ?? "").trim();
      const msg = (params.get("msg") ?? "").trim();
      if (!id || !msg) {
        response.writeHead(303, { Location: "/" });
        response.end();
        return;
      }
      addToData(id, msg, filename);
      // 二重送信防止：POSTの後はリダイレクト（PRG）
      response.writeHead(303, { Location: "/" });
      response.end();
    });
    return;
  }
  // GET のとき
  write_index(request, response);
}

// indexの表示の作成
function write_index(request, response) {
  const msg = "何かメッセージを書いてください。";
  // ★ ここで整形する ★
  const data = message_data
    .filter(Boolean)
    .map(safeParse)
    .filter((obj) => obj && obj.msg)
    .map(({ id, msg }) => ({ id, msg }));
  let content = ejs.render(index_page, {
    title: "Index",
    content: msg,
    data: data, // ← 整形済みデータ
    filename: "data_item",
  });
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.write(content);
  response.end();
}

// テキストファイルをロード
function readFromFile(fname) {
  fs.readFile(fname, "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        message_data = [];
        return;
      }
      throw err;
    }
    message_data = data.split("\n").filter(Boolean); // 読み込んだdataのテキストを「\n」（改行）で分割し配列にする。
  });
}

// データを追加してファイルに保存
function addToData(id, msg, fname) {
  const obj = { id, msg }; // 送信されてきたデータをオブジェクトにまとめる。
  const obj_str = JSON.stringify(obj); // JSONオブジェクトのstringifyというメソッドで、JSオブジェクトをテキストに変換
  console.log("add data: " + obj_str);
  message_data.unshift(obj_str); // unshiftメソッドで、配列の最初に値を追加する。（最後に追加したものが最初に位置する）
  if (message_data.length > max_num) {
    // message_dataのデータ数がmax_num以上になっているかチェックし、もしそれ以上なら
    message_data.pop(); // message_dataの最後のデータを削除する
  }
  saveToFile(fname);
}

// データをファイルに保存
function saveToFile(fname) {
  const data_str = message_data.join("\n");
  fs.writeFile(fname, data_str, (err) => {
    if (err) {
      throw err;
    }
  });
}

// 安全にJSONをパースする関数
function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
