let accountId = "";
let mkdata = [];
let title = "";
let source = "";
let content = "";
let editId = "";
let mode = "新規作成";

// 表示の更新
function refresh() {
  document.getElementById("accountId").textContent = accountId;
  document.getElementById("title").value = title;
  document.getElementById("source").value = source;
  document.getElementById("content").innerHTML = content;
  // document.getElementById("editId").value = editId;
  // document.getElementById("mode").value = mode;
}

// データの更新
function refreshData() {
  let con = "";
  mkdata.map((ob) => {
    con += "<tr><td>";
    con += '<a className="text-dark" href="#" onClick="getById(event)" name="' + ob.id + '">';
    con += ob.title + "</a>";
    con += "</td></tr>";
  });
  document.getElementById("datacontainer").innerHTML = con;
}

// アカウントのチェック
async function getAccount() {
  const response = await fetch("/api/check");
  const data = await response.json();
  if (data.result != false) {
    accountId = data.result;
    getAllData();
  } else {
    window.location.href = "/users/login"; // ログイン画面へリダイレクト
  }
}

// 全データの取得
async function getAllData() {
  const response = await fetch("/api/all");
  const data = await response.json();
  mkdata = data;
  refreshData();
}

// 指定IDのデータの取得
async function getById(event) {
  const response = await fetch("/api/mark/" + event.target.name);
  const data = await response.json();
  title = data.title;
  source = data.content;
  editId = data.id;
  getRender(data.content);
  mode = "更新";
  refresh();
  document.getElementById("modebtn").value = "更新";
}

// Markdataのレンダリング結果の取得
async function getRender(source) {
  const response = await fetch("/api/mark/render", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source: source }),
  });
  const data = await response.json();
  content = data.render;
  refresh();
}
// データの送信
function sendData() {
  title = document.getElementById("title").value;
  source = document.getElementById("source").value;
  if (mode == "新規作成") {
    create();
  } else {
    update();
  }
}

// レコードを新規作成する
async function create() {
  const data = {
    title: title,
    content: source,
    accountId: accountId,
  };
  await fetch("/api/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  getAllData();
  mode = "新規作成";
  refresh();
  document.getElementById("modebtn").value = "作成";
}

// レコードを更新する
async function update() {
  const data = {
    title: title,
    content: source,
    id: editId,
  };
  await fetch("/api/mark/edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  getAllData();

  // フォーム用の状態をリセット
  title = "";
  source = "";
  content = "";
  editId = "";
  mode = "新規作成";

  refresh();
  document.getElementById("modebtn").value = "作成";
}

// ページ読み込み後にイベント登録
window.addEventListener("load", () => {
  // コンテンツを更新するとプレビューもリアルタイムで更新する
  const sourceEl = document.getElementById("source");
  if (!sourceEl) return;

  sourceEl.addEventListener("input", async (e) => {
    const text = e.target.value;
    source = text;           // グローバル変数も更新（今の設計に揃えるなら）
    await getRender(text);   // 既存のAPI呼び出しでプレビュー更新
  });
});