import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [mkdata, setMkdata] = useState([]);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState("新規作成");
  const [editId, setEditId] = useState("");
  const [accountId, setAccountId] = useState("");

  // アカウントのチェック
  const getAccount = async () => {
    const response = await fetch("/api/check");
    const data = await response.json();
    if (data.result != false) {
      setAccountId(data.result);
      getAllData();
    } else {
      window.location.href = "/users/login"; // ログイン画面へリダイレクト
    }
  }

  // 全データの取得
  const getAllData = async () => {
    const response = await fetch("/api/all");
    const data = await response.json();
    setMkdata(data);
  }

  // 指定IDのデータの取得
  const getById = async (event) => {
    const response = await fetch("/api/mark/" + event.target.name);
    const data = await response.json();
    setTitle(data.title);
    setSource(data.content);
    setEditId(data.id);
    getRender(data.content);
    setMode("更新");
    document.getElementById("modebtn").value = "更新";
  }

  // Markdataのレンダリング結果の取得
  const getRender = async (source) => {
    const response = await fetch("/api/mark/render", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source: source }),
    });
    const data = await response.json();
    setContent(data.render);
  }
  // データの送信
  const sendData = () => {
    setTitle(document.getElementById("title").value);
    setSource(document.getElementById("source").value);
    if (mode == "新規作成") {
      create();
    } else {
      update();
    }
  }

  // レコードを新規作成する
  const create = async () => {
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
    setMode("新規作成");
    document.getElementById("modebtn").value = "作成";
  }

  // レコードを更新する
  const update = async () => {
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
    setTitle("");
    setSource("");
    setContent("");
    setEditId("");
    setMode("新規作成");
    document.getElementById("modebtn").value = "作成";
  }

  // タイトルの更新
  const changeTitle = (event) => {
    setTitle(event.target.value);
  }

  // ソースの更新
  const changeSource = (event) => {
    setSource(event.target.value);
  }

  // 副作用エフェクト
  useEffect(() => {
    getAccount();
    getAllData();
  }, []);

  return (
    <>
      <div className="App">
        <header>
          <h1 className="display-4 text-primary">Markdown管理アプリ</h1>
        </header>
        <div role="main">
          <p class="h5 my-4">
            Welcome to <span>{accountId}</span>!
          </p>

          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Title</th>
                </tr>
              </thead>
              <tbody>
                {mkdata.map((ob) => (
                  <tr>
                    <td>
                      <a className="text-dark" href="#" onClick={getById} name={ob.id}>{ob.title}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <hr />
          <div>
            <div class="form-group">
              <label for="title">Title</label>
              <input type="text" name="title" id="title" class="form-control" value={title} onChange={changeTitle} />
            </div>
            <div class="form-group">
              <label for="source">SOURCE</label>
              <textarea
                name="source"
                id="source"
                class="form-control"
                rows="8"
                value={source}
                onChange={changeSource}
              ></textarea>
            </div>
            <input
              id="modebtn"
              type="button"
              value={mode}
              class="btn btn-primary m-2"
              onClick={sendData}
            />
          </div>

          <div class="card mt-4">
            <div class="card-header text-center h5">Preview</div>
          </div>
          <div class="card-body">
            <div dangerouslySetInnerHTML={{ __html: content }}></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App
