# 超簡単メッセージボード（掲示板）を作ろう

## 仕様

- 本格的なメッセージボードは、サーバーにデータベースなどを設置して動かすが、ここでは送信したデータを配列にまとめておくという形で作る。
- メッセージは最大 10 個まで保存され、それ以上になると古い順から削除される。
- 初めてアクセスした時には ID を入力する。

## メッセージボードに必要なもの

- 投稿データをファイルに保存する。今回はテキストファイルにデータを保存して、それを読み込んで使う。
- 自分の ID をローカルストレージに保管する。ローカルストレージは、ブラウザにデータを保存するための機能。ただ、クライアント側でしか動かない。
  なので、Node.js のプログラムの中からローカルストレージは使えない。
- 必要なファイル：
  - app.js
  - index.ejs: メッセージボードの表示ページのテンプレート
  - login.ejs: ログインページのテンプレート
  - data_item.ejs: テーブル表示のパーシャル用テンプレート（部品用テンプレート、HTML の断片）
  - mydata.txt: データを保管しておくテキストファイル

1. mini_board フォルダを作成
2. mini_board フォルダ内に、index.ejs を作成

   - script タグ内に、

   ```js
   window.addEventListener("DOMContentLoaded", () => {
     // ローカルストレージからIDを取得
     const id = localStorage.getItem("id");
     // IDがなければログイン画面へ移動
     if (!id) {
       location.href = "/login"; // 絶対パス
       return;
     }
     // 取得したIDを画面のp#idに表示＆フォームの非表示フィールドにセット
     document.querySelector("#id").textContent = `ID:${id}`;
     document.querySelector("#id_input").value = id;
   });
   ```

   - 非表示フィールド
     <input type="hidden" id="id_input" name="id" value="" />
     は、フォームを送信するときに ID の値を一緒に送るために用意している。
     ローカルストレージはクライアント側の機能で、サーバー側では使えない。
     そこで、メッセージを送信する際、ID も一緒に送ることで、何という ID のクライアントが送信してきたかをサーバー側に伝える。
     と、本には書いてあるが、実務では、
     hidden を使っても良いのは、ページ ID、並び順、表示状態、一時的な UI 情報など改ざんされても問題ない情報だけ。
     ユーザー ID、権限、価格、管理フラグなどは入れてはいけない。
     代わりに、Cookie セッション（HttpOnly）、認証トークン（Cookie）、サーバー側のログイン状態などを使う。

3. テーブルのパーシャルテンプレート(data_item.ejs)を作成
   本では、

```js
<% if (var != '') { %> <% let obj = JSON.parse(val); %>
<tr>
  <td><%= obj.id %></td>
  <td><%= obj.msg %></td>
</tr>
<% } %>
```

このように書いているけど、
データの空チェックや整形はサーバー側（app.js）でして、信用されたデータだけをテンプレートに渡す方が良い。
（index.ejs 側で data という変数にまとめられているデータは、各データをテキストの形として保存している。まずはそれが空ではないかチェックしている）
（JSON.parse(val);で、JSON 形式のテキストをもとにオブジェクトを生成している。）
なので テンプレート側で条件分岐しない。

```js
<tr>
  <td><%= obj.id %></td>
  <td><%= obj.msg %></td>
</tr>
```

テンプレートはここだけで良い。
app.js（サーバー側）の write_index 関数で整形する。

```js
function safeParse(json) {
  try {
    return JSON.parse(json); // ここでJSON.parse(整形)
  } catch {
    return null;
  }
}

const data = messages
  .filter(Boolean) // falsy（'', null, undefined）をまとめて除外
  .map(safeParse)
  .filter((obj) => obj && obj.msg) // obj が null じゃない, obj.msg が 空じゃないものだけを残す。
  .map(({ id, msg }) => ({ id, msg })); // オブジェクトからidとmsgという必要なものだけを取り出して新しいオブジェクトを作る。

res.render("index", { data });
```

4. login.ejs を作成
   script 部分

````js
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#loginForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = document.querySelector("#id_input").value.trim();
        if (!id) return;

        localStorage.setItem("id", id);
        location.replace("/");
    });
});
- 本では、
```html
<input type="text" id="id_input">
<button onclick="setId();">送信</button>
````

```js
function setId() {
  const id = document.querySelector("#id_input").value;
  localStorage.setItem("id", id);
  location.href = "/";
}
```

このように書いているけど、onClick は使わない方が良い。（関数名を変えたら HTML も変えないといけないから。）

```html
<form id="loginForm">
  <input type="text" id="id_input" name="id" />
  <button type="submit">送信</button>
</form>
```

```js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#loginForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.querySelector("#id_input").value.trim();
    if (!id) return;

    // ローカルストレージに値を保存（localStorage.setItem(キー, 値);
    localStorage.setItem("id", id);
    location.replace("/");
  });
});
```

こう書いた方が良い。
ただ、実務では「ログイン情報」をローカルストレージに保存しない！！
ローカルストレージは JavaScript から自由に読める ので、もし XSS（スクリプト注入） されたら即アウト。
トークン盗まれる → なりすましされる　 → 被害がサーバー側まで波及
実務では、HttpOnly Cookie + セッションまたは JWT などトークン方式でも HttpOnly Cookie を使う。
ローカルストレージは、UI や一時情報のみに使う。
例）ダークモード ON/OFF、フィルター状態、下書き、モーダルを閉じたかどうか

5. データファイルの用意(mydata.txt)
   送られてきたメッセージをまとめて保存しておくファイル。特に何も記載しないでおく。

6. mini_board フォルダで、npm install ejs を実行。
   ちなみに場所を間違えたら、npm uninstall ejs で取り消せる

7. app.js を作成

### フィアルのロード

```js
const max_num = 10; // メッセージの最大保存数
const filename = "mydata.txt"; // データ保存ファイル名
let message_data = []; // メッセージ保存用配列
readFromFile(filename); // ファイルからデータ読み込み

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
```

### データの更新

response_index の request に追加されている end イベントでは、全部のデータを受け取ったら addToData というメソッドを呼び出している。

```js
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
```

### 配列を保存する

- message_data は、テキストの配列です。これを保存するには、配列を 1 つのテキストにまとめて、それを保存する。

```js
// データをファイルに保存
function saveToFile(fname) {
  const data_str = message_data.join("\n"); // message_dataを1つのテキストに変換する。joinは配列を1つにまとめる。引数には区切り文字を入れる。「\n」は改行。つまり、配列の1つ1つの値を改行して1つのテキストにまとめる。
  // fs.writeFileメソッドでファイルを保存。第一引数には保存するファイル名、第二引数には保存するテキスト、第三引数には保存後の処理を指定。
  fs.writeFile(fname, data_str, (err) => {
    // エラーが発生した時の処理
    if (err) {
      throw err;
    }
  });
}
```
