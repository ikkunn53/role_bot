# チャンネル投稿ロール Bot

指定したテキスト／アナウンスチャンネルに投稿したメンバーへ、指定ロールを自動付与する Discord Bot です。本文だけでなく、**画像・ファイル・スタンプ等だけの投稿**も Discord 上ではメッセージとして届くため対象になります。Bot／Webhook の投稿は対象外です。

設定時とBot起動時に、取得できる全過去メッセージを100件ずつ確認します。同じユーザーは1回だけ処理するため、大量の投稿があっても不要なロール操作は行いません。そのため、Bot起動前または設定前に投稿済みのメンバーにもロールが付与されます。設定解除では、既に付与したロールを削除しません。

## 必要環境

- Node.js 18 以上
- Botを導入できる Discord サーバー

## Discord Developer Portal の設定

1. Application と Bot を作成し、Botトークンと Application ID を控えます。
2. **Bot > Privileged Gateway Intents** で `SERVER MEMBERS INTENT` を有効にします。`MESSAGE CONTENT INTENT` は不要です。
3. OAuth2 URL Generator でスコープ `bot` と `applications.commands` を選び、Bot権限として次を付けて招待します。
   - チャンネルを見る
   - メッセージ履歴を読む
   - ロールの管理
4. Discordの「サーバー設定 > ロール」で、**Botのロールを付与対象ロールより上**へ移動します。

## インストールとセットアップ

```bash
npm install
cp .env.example .env
```

`.env` に `DISCORD_TOKEN` と `DISCORD_CLIENT_ID` を記入します。`DISCORD_GUILD_ID` も記入すると対象サーバーへ即時反映され、空なら全導入サーバー向けのグローバル登録になります。環境変数を使えない場合は `config.example.json` を `config.json` にコピーして記入できます（環境変数が優先されます）。

次のセットアップコマンドは、Discordへスラッシュコマンドを登録します。トークンを再生成した場合を除き、通常は初回だけ実行します。

```bash
npm run setup
```

## 起動

```bash
npm start
```

設定は `data/settings.json` に自動保存されます。このファイルにはトークンは入りません。継続利用する場合は `data` ディレクトリを永続化してください。

## Discordコマンド（管理者専用）

- `/role-config set channel:#チャンネル role:@ロール` — 設定を保存し、バックグラウンドで過去投稿も処理
- `/role-config remove channel:#チャンネル` — 設定解除（付与済みロールは維持）
- `/role-config list` — サーバー内の設定一覧

Discord側の既定権限とBot側の再確認の両方で、管理者以外による設定変更を拒否します。Botがオフライン中の新規投稿も、次回起動時の過去投稿走査で処理されます。大量の履歴があるチャンネルでは初回走査に時間がかかります。

## テスト

```bash
npm test
```
