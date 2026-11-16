# FP STUDY 14

FP3級（3級ファイナンシャル・プランニング技能検定）を、スマートフォンで14日間学ぶ非公式アプリです。全14日・42章・解説付きのオリジナル100問を収録しています。

| 日 | 内容 |
| --- | --- |
| Day 1–2 | ライフプランニングと資金計画：家計表、6つの係数、社会保険、年金、ローン |
| Day 3–4 | リスク管理：生命・損害保険、必要保障額、医療保障、保険金の税目 |
| Day 5–6 | 金融資産運用：金利、債券、株式、投資信託、為替、NISA |
| Day 7–8 | タックスプランニング：所得区分、控除、損益通算、年末調整と申告 |
| Day 9–10 | 不動産：登記、土地評価、契約、面積制限、取引にかかる税 |
| Day 11–12 | 相続・事業承継：法定相続分、遺言、相続税、贈与税、財産評価 |
| Day 13 | 3科目を想定した実技12問。日本FP協会の資産設計提案業務、金財の個人資産相談業務・保険顧客資産相談業務 |
| Day 14 | 学科6分野＋資料読解の総合16問 |

Day 1〜12は各6問。○×・3択・資料付き問題にはすべて解説があり、間違えた問題を復習できます。成績は分野別に確認できます。アプリ上の「1日達成」は全章読了と確認テスト80%以上で、本試験の合格基準とは異なります。教材は受検対策のための架空事例と独自問題です。公式問題の転載や個別の投資・税務・保険の助言は含みません。

教材の制度・金額は原則として**2026年4月1日を基準**に学習用に整理しています。受検日ごとの適用日は[日本FP協会の試験日程](https://www.jafp.or.jp/exam/schedule/)または[金財の法令基準日](https://products.kinzai.or.jp/exam-fp/law/)で確認してください。学科と各実技の正式な範囲・出題形式は[日本FP協会の試験範囲](https://www.jafp.or.jp/exam/subjects_03/)、[日本FP協会の試験要綱](https://jafp.or.jp/exam/outline/)、[金財の3級案内](https://products.kinzai.or.jp/exam-fp/3kyu/)に掲載されています。制度の参考資料は、各講義末尾の「参考資料（オンライン）」から開けます。

## Macで開く

Node.js 22.12以降が必要です。このフォルダで次を実行します。

```sh
npm ci
npm run dev
```

ターミナルに表示されたURLを開きます。インストールとオフライン動作を確認するには、開発サーバーの代わりに本番ビルドを使います。

```sh
npm run build
npm run preview -- --port 4175
```

## GitHub Pagesで公開してiPhoneに入れる

1. 既存のAI学習アプリと別に、GitHubに `fp-study-14` などのリポジトリを作ります。
2. このプロジェクトのソースをそのリポジトリの `main` に送ります。ビルド済みファイルや `node_modules` を送る必要はありません。
3. GitHubの **Settings → Pages → Source → GitHub Actions** を選びます。初回は **Actions → Deploy to GitHub Pages → Run workflow**。以後は `main` へのpushで更新されます。
4. GitHub PagesのHTTPS URLをiPhoneのSafariで開き、**共有 → ホーム画面に追加**。追加したアイコンからオンラインで一度開くと、教材をオフラインでも利用できます。

初回の公開用設定は [deploy.yml](.github/workflows/deploy.yml) に入っています。GitHub Pagesのサブパスをビルド・PWAスコープ・ブラウザテストに反映します。ローカルの `127.0.0.1` はMac内の確認用です。

進捗、テストの途中状態、誤答、テーマはこのアプリ専用のIndexedDBに保存します。AI学習アプリとは独立しており、両方を同じGitHub Pagesドメインで公開しても学習記録は分かれます。端末間では同期されません。

## 教材・動作を検証する

```sh
npm run validate:content
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`src/data/day01.json`〜`day14.json` に講義と問題を、`src/data/curriculum.json` に日程を置いています。実技資料は教材内の `cases` に定義し、問題の `caseId` で参照します。IDは学習記録の参照に使われるため、同じ問題・章を改訂するだけなら維持してください。[教材JSONの構造](docs/course.schema.json)を変更したら `node --import tsx scripts/export-schema.ts` で更新します。
