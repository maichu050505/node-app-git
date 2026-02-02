# Express Validatorを使ったパリデーション

- npm install express-validator でインストールする。
- views/hello/add.ejsを修正。新規作成のページ。<input type="text" name="name" id="name" class="form-control" value="<%= form.name %>" />のように、inputにvalue属性を追加。
- valueには、form.xxxxという値を設定。サーバー側でformという変数に、フォームの値を用意しておいて、それをvalueに設定して表示される。= フォームの再入力への対応。
- routes/hello.jsを修正。
