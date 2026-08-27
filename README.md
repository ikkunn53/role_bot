# チャンネル投稿ロール Bot

[![サービス利用規約](https://img.shields.io/badge/サービス利用規約-確認-blue)](https://github.com/ikkunn53/role_bot/blob/main/TERMS.md)
[![プライバシーポリシー](https://img.shields.io/badge/プライバシーポリシー-確認-blue)](https://github.com/ikkunn53/role_bot/blob/main/PRIVACY.md)

指定したテキスト／アナウンスチャンネルに投稿したメンバーへ、指定ロールを自動付与する Discord Bot です。本文だけでなく、**画像・ファイル・スタンプ等だけの投稿**も Discord 上ではメッセージとして届くため対象になります。Bot／Webhook の投稿は対象外です。

設定時とBot起動時に、取得できる全過去メッセージを100件ずつ確認します。同じユーザーは1回だけ処理するため、大量の投稿があっても不要なロール操作は行いません。そのため、Bot起動前または設定前に投稿済みのメンバーにもロールが付与されます。設定解除では、既に付与したロールを削除しません。

## 利用規約とプライバシー

- [サービス利用規約](https://github.com/ikkunn53/role_bot/blob/main/TERMS.md)
- [プライバシーポリシー](https://github.com/ikkunn53/role_bot/blob/main/PRIVACY.md)

Discord Developer Portal の「Terms of Service URL」と「Privacy Policy URL」には、それぞれ上記の公開URLを登録してください。

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

### Privileged Intent 申請の記入例

Discord Developer Portal から Intent の利用申請を求められた場合は、**Server Members Intent だけ**を選択します。Presence Intent と Message Content Intent はこの Bot では使用しません。以下は実装に合わせた記入例です。実際の運用方法や公開先に合わせて調整してください。

**アプリケーションの詳細**

> この Bot は、Discord サーバー管理者が指定したテキストまたはアナウンスチャンネルへ投稿したメンバーに、指定したロールを自動付与します。管理者はスラッシュコマンドでチャンネルとロールの組み合わせを登録・解除・確認できます。Bot の起動時と設定時には対象チャンネルの取得可能な過去メッセージも走査し、過去の投稿者にも同じロールを付与します。Bot または Webhook による投稿は対象外です。

**利用者のデータを利用するか**: `はい`

**Server Members Intent を必要とする理由**

> Bot は、設定されたチャンネルの新規メッセージと過去メッセージの投稿者をサーバーメンバーとして取得し、そのメンバーが対象ロールを持っているか確認した上で、持っていない場合にロールを付与するために Server Members Intent を使用します。メンバー情報はこのロール付与処理にのみ使用します。Bot が永続保存するのは、管理者が設定したサーバー ID、チャンネル ID、ロール ID のみで、メンバー ID やメッセージ本文は保存しません。

**メンバーデータをキャッシュするか**: `はい`

> Discord との接続中は discord.js がメンバー情報をプロセスのメモリ上に一時的にキャッシュします。このキャッシュはロールの有無確認と付与に使用し、データベースや設定ファイルには永続保存しません。Bot のプロセスを終了すると破棄されます。

審査用スクリーンショットには、`/role-config set`の実行結果と、対象メンバーにロールが付与されたことが分かるサーバー画面を掲載してください。画像は審査担当者が閲覧できる URL で共有し、トークン、個人的な会話、不要なユーザー情報は写さないでください。

## インストールとセットアップ

### Windows（簡単セットアップ）

1. [Node.js公式サイト](https://nodejs.org/)からNode.js 18以上をインストールします。
2. このフォルダーにある **`setup.bat` をダブルクリック**します。
3. 表示に従ってBot Token、Application ID、Server IDを入力します。
4. ライブラリのインストールとDiscordコマンド登録が自動で完了します。

セットアップは基本的に初回の1回だけです。次回からは **`start.bat` をダブルクリック**するだけで起動できます。Botの使用中は、表示された黒いウィンドウを閉じないでください。終了する場合はそのウィンドウで `Ctrl+C` を押します。

既に `.env` が存在する場合、`setup.bat` は設定を上書きしません。設定値を変更するときは `.env` を編集するか、削除してから `setup.bat` をもう一度実行してください。

### コマンドでセットアップする場合

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
