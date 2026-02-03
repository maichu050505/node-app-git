# Prisma を使おう

## Prisma とは

- SQL を見ることなく、JavaScript のメソッドを呼び出してデータベースにアクセスできるやり方
- npm からインストールして利用する。
- Prisma は Node.js の「ORM」プログラム。ORM とは、Object-Relational Mapping の略で、プログラミング言語のオブジェクト(Object)と、データベースの構造(Relational)をマッピングし、相互にやり取りできるようにするもの。

## Prisma のインストール

- 本には、`npm install prisma -g`と書いてあるけど、グローバルではなくプロジェクトにローカルインストール（プロジェクトディレクトリでインストール）することが推奨されている。
- プロジェクトディレクトリで、`npm install prisma --save-dev`でインストールし、`npx prisma init`で初期化。（グローバルの場合は、`prisma init`で初期化）
- prisma フォルダと.env ファイルが生成される。

## データベースの設定

- Prisma では、プロジェクト内の prisma フォルダ内に必要なファイルをまとめて保管する。SQLite3 のデータベースファイルも、この prisma フォルダに作成される。
- すでにある mydb.db ファイルをそのままデータベースファイルとして利用したい場合は、prisma フォルダ内に移動させる。必ずバックアップをとってから移動させる！！
- すでにある mydb.db は、そのまま Database オブジェクトで利用し、Prisma 用には新たにデータベースファイルを作って使いたい場合は、mydb.db をプロジェクトディレクトリ直下に置いておいても OK。データベースファイルが prisma フォルダー内に無い場合、Prisma は新たにデータベースファイルを作成する。

## .env を修正する

`DATABASE_URL="file:./mydb.db"`と書き換える。これで、prisma フォルダ内の mydb.db データベースファイルを使用するようになる。

## schima.prisma を編集する

- prisma/schima.prisma を修正する。
- Prisma の設定ファイル。
- デフォルトは、下記のように書いてある。

```
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

- // ... existing code ...

- generator client とは、Prisma Client（データベースにアクセスするためのライブラリ）のコードを自動で生成する設定。`npx prisma generate` を実行すると、この設定に基づいてコードが作られる。provider は生成に使うツールを指定し、"prisma-client" が標準。output は生成先のフォルダを指定する。特に理由がなければ、このまま使えば OK。
- datasource db とは、データベースの設定。provider でデータベースの種類（"sqlite", "postgresql", "mysql" など）を指定する。古い本では `url = env("DATABASE_URL")` を schema.prisma の datasource db に書くと書いてあるが、Prisma v7 以降では `url` は `prisma.config.ts` で設定する（schema.prisma からは削除された）。provider だけを schema.prisma に書けば OK。

```
datasource db {
  provider = "sqlite"
}
```

## prisma.config.ts について

- Prisma v7 では、設定ファイル（prisma.config.\*）が必須。ただし、TypeScript は必須ではない。
- JavaScript 版を使う場合は、prisma.config.ts を prisma.config.js と名前を変更すれば OK。
- 実務では TypeScript 版を使うのが一般的だが、今は学習目的で JavaScript 版を使う。
- TypeScript 版を使う場合は、`npm install --save-dev @types/node typescript dotenv`する。
- prisma.config.\*で、下記のようにデータベースの URL が指定されている。

```js
datasource: {
  url: process.env["DATABASE_URL"],
},
```

## モデルを生成する

- Prisma では、データベースで利用する「テーブル」は「モデル」として定義する。
- shema.prisma で、モデルを定義する。書き方は、

```
model モデル名 {
  フィールド 型 オプション
  ーーーー必要なだけ記述ーーーー
}
```

- 主なオプション：

1. @id: プライマリキーとして使われる項目
2. @default: デフォルトで設定される値
3. @unique: 同じ値が複数存在しない
4. @updatedAt: 更新日時
