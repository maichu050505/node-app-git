# Express Validator を使ったパリデーション

- npm install express-validator でインストールする。
- views/hello/add.ejs を修正。新規作成のページ。<input type="text" name="name" id="name" class="form-control" value="<%= form.name %>" />のように、input に value 属性を追加。
- value には、form.xxxx という値を設定。サーバー側で form という変数に、フォームの値を用意しておいて、それを value に設定して表示される。= フォームの再入力への対応。
- routes/hello.js を修正。

```js
const { check, validationResult } = require("express-validator");

// 新規追加画面の表示
router.get("/add", (req, res) => {
  res.render("hello/add", {
    title: "Hello/Add",
    content: "新しいレコードを入力",
    form: { name: "", mail: "", age: 0 }, // 初期値を空に設定
  });
});

// 新規追加内容の保存
router.post(
  "/add",
  // バリデーションの設定
  [
    check("name", "お名前は必ず入力してください。").notEmpty(),
    check("mail", "メールアドレスは有効なメールアドレスを入力してください。").isEmail(),
    check("age", "年齢は0以上の整数を入力してください。").isInt({ min: 0 }),
  ],
  (req, res, next) => {
    // バリデーションのチェックを実行した結果を Result というオブジェクトとして返す。
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // バリデーションエラーがある場合
      let result = "<ul class='text-danger'>";
      const ressult_arr = errors.array();
      for (let n in ressult_arr) {
        result += "<li>" + ressult_arr[n].msg + "</li>";
      }
      result += "</ul>";
      const data = {
        title: "Hello/Add",
        content: result,
        form: req.body,
      };
      return res.render("hello/add", data);
    } else {
      const { name, mail, age } = req.body;
      // const name = req.body.name;
      // const mail = req.body.mail;
      // const age = req.body.age;

      db.run(
        "INSERT INTO mydata (name, mail, age) VALUES (?, ?, ?)",
        [name, mail, age],
        function (err) {
          if (err) return next(err); // エラーはExpressのエラーハンドラへ
          res.redirect("/hello/"); // 成功したらリダイレクト
        }
      );
    }
  }
);
```

- check はバリデーションのチェックを行う関数。validationResult は、バリデーションの実行結果に関する情報などを管理する ResultFactory というオブジェクトを生成する関数。
- router.post('/add', [バリデーションの設定], (req, res, next) => {})
- バリデーションの設定は、以下のように、check 関数を呼び出した結果をまとめている。

```js
[
  check("name", "お名前は必ず入力してください。").notEmpty(),
  check("mail", "メールアドレスは有効なメールアドレスを入力してください。").isEmail(),
  check("age", "年齢は0以上の整数を入力してください。").isInt({ min: 0 }),
];
```

- check(name 属性, エラーメッセージ).メソッド();
- この check 関数は、ValidationChain というオブジェクトを返す。
- ValidationChain オブジェクトには、バリデーターと呼ばれる、バリデーションのチェック内容となるメソッドが用意されている。

1. notEmpty(): 値が空かどうか
2. isEmail(): 値がメールアドレスかどうか
3. isInt(): 値が整数値かどうか

- バリデーションの結果の処理
  `const errors = validationResult(req);`
- validationResult は、引数に関数のリクエストを扱う req オブジェクトを指定して呼び出す。これにより、バリデーションのチェックを実行した結果を Result というオブジェクトとして返す。この Result には、エラー情報を管理する Error オブジェクトが保管されている。この Result に Error があるかどうかは、isEmpty メソッドで確認できる。
- ` if (!errors.isEmpty() ) {}`
- エラーがなければ isEmpty の戻り値は true になる。何かエラーがあれば、false になる。
- ここでは isEmpty の戻り値が false の場合のみ、エラーの処理を行っている。
- errors の array は、エラー情報を Error オブジェクトの配列として取り出す。
- `const result_arr = errors.array();`

```js
for (let n in result_arr) {
  result += "<li>" + result_arr[n].msg + "</li>";
}
```

- result_arr[n]で、Error オブジェクトが得られる。その msg の値を<li></li>で囲って result にまとめる。.msg は、check 関数の第二引数で指定したエラーメッセージ。
- render するとき、`form: req.body,`のように、form にフォームの値を設定する。req.body にフォームの内容が保存されている。そのまま form に設定しておけば、テンプレート側で`value="<%= form.name %>"`のように設定できる。

## バリデーションの使い方まとめ

1. チェック項目を追加する
   `check(項目の name 属性, エラーメッセージ).バリデーション用メソッド()
2. チェックの実行
   `const errors = validationResult(req);`
3. エラーのチェック

```js
if (!errors.isEmpty()) {
  エラー発生時の処理;
}
```

4. エラーの処理

```js
const result_arr = errors.array();
for (let n in result_arr) {
  result += "<li>" + result_arr[n].msg + "</li>";
}
```

## 用意されているバリデーション用メソッド

- isEmail(): メールアドレスかどうか
- isInt(): 整数かどうか
- isString(): テキストかどうか
- isArray(): 配列かどうか
- notEmpty(): 空でないかどうか
- contains(): 引数のテキストの中に含まれているかどうか
- exists(): その項目が存在するかどうか

## サニタイズ用メソッド

- サニタイズとは、データの無効化のための処理。例えば、HTML タグや JavaScript コードが送信されると危険なので、無効化する処理をする。
- `ValidationChainオブジェクト.escape()`
- 使い方例：

```js
[
  check("name", "お名前は必ず入力してください。").notEmpty().escape(),
  check("mail", "メールアドレスは有効なメールアドレスを入力してください。").isEmail().escape(),
  check("age", "年齢は0以上の整数を入力してください。").isInt({ min: 0 }),
];
```

## カスタムバリデーション

- 独自に定義したバリデーションを追加する場合は、custom というメソッドを使う。
- `check().custom(value => {処理})`
- custom は引数に関数を指定する。この関数は、チェックする値を引数に持つシンプルな関数。戻り値は真偽値であり、true を返せば問題なし、false を返すと問題あり。
- 使用例：

```js
[
  check("name", "お名前は必ず入力してください。").notEmpty().escape(),
  check("mail", "メールアドレスは有効なメールアドレスを入力してください。").isEmail().escape(),
  check("age", "年齢は0以上の整数を入力してください。").isInt({ min: 0 }),
  check("age", "年齢はゼロ以上120以下で入力してください。").custom((value) => {
    return value >= 0 && value <= 120;
  }),
];
```
