---
search:
  exclude: true
---
# ラボ E6c - Entra ID 認証を使用した Single Sign-on の追加

このラボでは、Microsoft Entra ID SSO 認証を追加し、 ユーザー が既存の Entra ID 資格情報で認証できるようにします。


<div class="lab-intro-video">
    <div style="flex: 1; min-width: 0;">
        <iframe  src="//www.youtube.com/embed/1IhyztqkuJo" frameborder="0" allowfullscreen style="width: 100%; aspect-ratio: 16/9;">          
        </iframe>
          <div>このビデオでラボの概要を短時間で確認できます。</div>
            <div class="note-box">
            📘 <strong>注:</strong>   このラボは前回のラボ E5 を基にしています。ラボ E5 を完了済みであれば、同じフォルダーで作業を続けてかまいません。未完了の場合は <a src="https://github.com/microsoft/copilot-camp/tree/main/src/extend-m365-copilot/path-e-lab05-add-adaptive-cards/trey-research-lab05-END" target="_blank">/src/extend-m365-copilot/path-e-lab05-add-adaptive-cards/trey-research-lab05-END</a> のソリューション フォルダーをコピーして作業してください。  
    このラボの完成版は <a src="https://github.com/microsoft/copilot-camp/tree/main/src/extend-m365-copilot/path-e-lab06c-add-sso/trey-research-lab06c-END" target="_blank">/src/extend-m365-copilot/path-e-lab06c-add-sso/trey-research-lab06c-END</a> フォルダーにあります。
        </div>
    </div>
    <div style="flex: 1; min-width: 0;">
  ---8<--- "ja/e-labs-prelude.md"
    </div>
</div>

!!! note
    完成版のサンプルでは永続的な developer tunnel を使用しています。persistent developer tunnel を使用しない場合は調整が必要です。Exercise 1 を参照してください。


このラボでは API を登録する際に、後の手順で利用するために Entra ID ポータルと Teams Developer Portal からいくつかの値を保存する必要があります。保存する項目は次のとおりです。

~~~text
API Base URL: 
API's Entra ID application ID: 
API's Tenant ID: 
SSO Client registration: 
API ID URI: 
~~~

## Exercise 1: 永続的 developer tunnel の設定 (オプション)

既定では Agents Toolkit はプロジェクトを開始するたびに新しい developer tunnel (つまりローカル API への新しい URL) を作成します。通常は Agents Toolkit が自動で URL を更新するため問題ありませんが、このラボでは手動設定のため、デバッガーを開始するたびに Entra ID と Teams Developer Portal の URL を手動で更新する必要があります。そのため、URL が変わらない永続的な developer tunnel を設定すると便利です。

??? Note "persistent tunnel を設定したくない場合はこちら ▶▶▶"
    この Exercise をスキップして Agents Toolkit が提供する developer tunnel を使用しても構いません。プロジェクトが起動したら、ターミナル タブ 1️⃣ で "Start local tunnel" ターミナル 2️⃣ を選択し、Forwarding URL 3️⃣ をコピーします。この URL はプロジェクトを開始するたびに変わるため、アプリ登録の reply URL (Exercise 2 Step 1) と Teams Developer Portal の URL (Exercise 5 Step 1) を手動で更新する必要があります。  
    ![Developer tunnel URL](../../assets/images/extend-m365-copilot-06/oauth-A0.png)

### Step 1: developer tunnel CLI のインストール

以下のコマンドで developer tunnel をインストールします。[Developer Tunnel の詳細手順とダウンロード リンクはこちら](https://learn.microsoft.com/azure/developer/dev-tunnels/get-started){target=_blank}。 

| OS | コマンド |
| --- | --- |
| Windows | `winget install Microsoft.devtunnel` |
| Mac OS | `brew install --cask devtunnel` |
| Linux | `curl -sL https://aka.ms/DevTunnelCliInstall | bash` |

!!! tip
    環境変数を更新するため、コマンド ラインを再起動する必要がある場合があります。

インストール後、ログインします。Microsoft 365 アカウントでログイン可能です。

~~~sh
devtunnel user login
~~~

このラボの演習中は devtunnel コマンドを実行したままにしておいてください。再起動が必要な場合は `devtunnel user login` を再実行します。

<cc-end-step lab="e6c" exercise="1" step="1" />

### Step 2: トンネルの作成とホスト

次に Azure Functions のローカル ポート (7071) へ永続的なトンネルを設定します。必要に応じて "mytunnel" を任意の名前に置き換えてください。

~~~sh
devtunnel create mytunnel -a --host-header unchanged
devtunnel port create mytunnel -p 7071
devtunnel host mytunnel
~~~

コマンド ラインに接続情報が表示されます。

![The devtunnel running in a console window showing the hosting port, the connect via browser URL, and the URL to inspect network activity.](../../assets/images/extend-m365-copilot-06/devtunnel-output.png)

「Connect via browser」URL をコピーし、「API Base URL」として保存します。

<cc-end-step lab="e6c" exercise="1" step="2" />

### Step 3: プロジェクトで動的に作成されるトンネルを無効化

ローカルでプロジェクトが実行中であれば停止します。その後 [\.vscode\tasks.json](https://github.com/microsoft/copilot-camp/blob/main/src/extend-m365-copilot/path-e-lab06-add-auth/trey-research-lab06-END/.vscode/tasks.json){target=_blank} を編集し、"Start Teams App Locally" タスクを探します。"Start local tunnel" の dependency をコメントアウトし、代わりに "Start Azurite emulator" を追加します。最終的なタスクは次のようになります。

~~~json
{
    "label": "Start Teams App Locally",
    "dependsOn": [
        "Validate prerequisites",
        //"Start local tunnel",
        "Start Azurite emulator",
        "Create resources",
        "Build project",
        "Start application"
    ],
    "dependsOrder": "sequence"
},
~~~
<cc-end-step lab="e6c" exercise="1" step="3" />

### Step 4: server URL を手動で上書き

**env/.env.local** を開き、`OPENAPI_SERVER_URL` の値を永続的トンネルの URL に変更します。この値が後ほど必要となる `API base URL` です。

<cc-end-step lab="e6c" exercise="1" step="4" />

## Exercise 2: API 用の Entra ID アプリ登録

### Step 1: 新しい Entra ID アプリ登録の追加

[Microsoft 365 管理センター](https://portal.office.com/AdminPortal/){target=_blank} から、または直接 [https://entra.microsoft.com/](https://entra.microsoft.com/){target=_blank} へ移動し、Entra ID 管理センターを開きます。開発テナントでログインしていることを確認してください。

「Identity」1️⃣、「Applications」2️⃣、「App registrations」3️⃣ の順にクリックし、「+」4️⃣ をクリックして新しいアプリ登録を追加します。

![The Microsoft Entra admin center showing the list of applications registered and the button to create a 'New regitration'.](../../assets/images/extend-m365-copilot-06/oauth-A2.png)

アプリケーションに「Trey API Service」などのわかりやすい名前を付けます 1️⃣。[Supported account types] では「Accounts in this organizational directory only (Microsoft only - single tenant)」2️⃣ を選択します。

「Register」3️⃣ をクリックします。

![The app registration page, where you can provide the application name, supported application types, and redirect URI. There is also the 'Register' button to select.](../../assets/images/extend-m365-copilot-06c/oauth-A4.png)

<cc-end-step lab="e6c" exercise="2" step="1" />

### Step 2: アプリ情報のコピー

`API's Entra ID application ID` となる Application ID (Client ID) 1️⃣ と、`API's Tenant ID` となる Directory (tenant) ID 2️⃣ をコピーして保存します。

![The app registration page, where you see overview to copy the Application ID](../../assets/images/extend-m365-copilot-06c/oauth-A5.png)

<cc-end-step lab="e6c" exercise="2" step="2" />


## Exercise 3: Teams Developer Portal で Microsoft Entra SSO クライアント ID を登録

これで API は Entra ID に登録されましたが、Microsoft 365 にはまだ認識されていません。追加の資格情報を要求せずにセキュアに API を接続できるよう、Teams Developer Portal に登録しましょう。

### Step 1: Teams Developer Portal で SSO クライアントを登録

[https://dev.teams.microsoft.com](https://dev.teams.microsoft.com){target=_blank} にアクセスし、「Tools」1️⃣、「Microsoft Entra SSO client ID registration」2️⃣ を選択します。

![The Entra ID SSO config page in Teams developer portal](../../assets/images/extend-m365-copilot-06c/oauth-A6.png)

**Register client ID** を選択し、以下の値を入力します。

| 項目 | 値 |
| --- | --- |
| Name | 後でわかりやすい名前 |
| Base URL| API base URL |
| Restrict usage by org | "My organization only" を選択 |
| Restrict usage by app | "Any Teams app" を選択 |
| Client (application) ID | API's Entra ID application ID |

![The Entra ID SSO config page in Teams developer portal with new registration details filled](../../assets/images/extend-m365-copilot-06c/oauth-A7.png)



**Save** を選択すると、**Microsoft Entra SSO registration ID** と **Application ID URI** が生成されます。後で plugin manifest ファイルを構成するためにコピーしておきます。

![Teams deveoper portal Entra SSO configuration](../../assets/images/extend-m365-copilot-06c/oauth-A8.png)

!!! Note "persistent developer tunnel URL を使用していない場合..."
    ...アプリケーションを Agents Toolkit で起動するたびに新しいトンネル URL になるため、「Base URL」フィールドを最新の URL に更新する必要があります。

<cc-end-step lab="e6c" exercise="3" step="1" />


## Exercise 4: アプリケーション パッケージの更新

### Step 1: Plugin ファイルの更新

Visual Studio Code で作業フォルダーを開きます。**appPackage** フォルダーにある **trey-plugin.json** を開きます。ここには Copilot が必要とするものの、Open API Specification (OAS) に含まれていない情報が保存されています。

`Runtimes` の下に `auth` プロパティがあり、`"None"` が設定されています。これを次のように変更し、Copilot に **Microsoft Entra SSO registration ID** を使用して認証するよう伝えます。

~~~json
"auth": {
  "type": "OAuthPluginVault",
  "reference_id": "<Microsoft Entra SSO registration ID>"
},
~~~

<cc-end-step lab="e6c" exercise="4" step="1" />


## Exercise 5: API の Entra アプリ登録を更新

### Step 1: Application ID URI の更新 
- [Microsoft Entra 管理センター](https://entra.microsoft.com/){target=_blank} に戻り、API の Entra アプリ登録 (**Trey API Service**) を開きます。  
- **Expose an API** を開き、**Application ID URI** を追加/編集します。Teams Developer Portal で生成された **Application ID URI** を貼り付け、**Save** を選択します。

<cc-end-step lab="e6c" exercise="5" step="1" />


### Step 2: API Scope の追加

API を呼び出す権限を表す API Scope を公開する必要があります。この例では「access_as_user」というシンプルなスコープを作成します。

「Add a scope」で scope name に "access_as_user" を入力 1️⃣。残りのフィールドを次のように入力します。

| 項目 | 値 |
| --- | --- |
| Who can consent? | Admins and users |
| Admin consent display name | Access My API as the user |
| Admin consent description | Allows an API to access My API as a user |
| User consent display name | Access My API as you |
| User consent description | Allows an app to access My API as you |
| State | Enabled |

完了したら「Add Scope」2️⃣ をクリックします。

![Access as user scope](../../assets/images/extend-m365-copilot-06c/oauth-A9.png)

<cc-end-step lab="e6c" exercise="5" step="2" />

### Step 3: authorized client apps の追加

同じ **Expose an API** ページで **Add a client application** 1️⃣ を選択し、Microsoft のエンタープライズ トークン ストアのクライアント ID `ab3be6b7-f5df-413d-ac2d-abf1e3fd9c0b` 2️⃣ を追加します。access scope を選択して 3️⃣、**Add application** 4️⃣ を選択します。

![Add authorized client apps](../../assets/images/extend-m365-copilot-06c/oauth-A10.png)

<cc-end-step lab="e6c" exercise="5" step="3" />

### Step 4: 認証用 Redirect URI

左ナビゲーションで **Authentication** 1️⃣ を開き、**Add a platform** 2️⃣ を選択し、**Web** 3️⃣ を選択します。 

![Add web platform](../../assets/images/extend-m365-copilot-06c/oauth-A11.png)

**Redirect URIs** に `https://teams.microsoft.com/api/platform/v1.0/oAuthConsentRedirect` を貼り付け 1️⃣、**Configure** 2️⃣ を選択します。

![Add web platform with Redirect URL](../../assets/images/extend-m365-copilot-06c/oauth-A12.png)

<cc-end-step lab="e6c" exercise="5" step="4" />

## Exercise 6: アプリケーション コードの更新

### Step 1: JWT 検証ライブラリのインストール

作業ディレクトリで次のコマンドを実行します。

~~~sh
npm i jwt-validate
~~~

これにより Entra ID 認証トークンを検証するライブラリがインストールされます。

!!! warning
    Microsoft は NodeJS 用の公式サポート ライブラリを提供していませんが、[詳細なドキュメント](https://learn.microsoft.com/entra/identity-platform/access-tokens#validate-tokens){target=_blank} に従って独自に実装する方法を案内しています。また [Andrew Connell 氏](https://www.voitanos.io/pages/about/#whos-behind-voitanos){target=_blank} による[参考記事](https://www.voitanos.io/blog/validating-entra-id-generated-oauth-tokens/){target=_blank} もあります。本ラボでは [Waldek Mastykarz 氏](https://github.com/waldekmastykarz){target=_blank} が提供する [コミュニティ ライブラリ](https://www.npmjs.com/package/jwt-validate){target=_blank} を使用します。MIT ライセンスで提供されており Microsoft のサポート対象外ですので、自己責任でご利用ください。

<cc-end-step lab="e6c" exercise="6" step="1" />

### Step 2: 環境変数の追加

作業ディレクトリの **env** フォルダーにある **.env.local** を開き、次の行を追加します。

~~~text
APP_ID_URI=<Application ID URI>
API_TENANT_ID=<Directory (tenant) ID>
~~~

!!! Note "Application ID URI を手動で生成する場合"
    Application ID URI が表示されない場合は一時的に以下の手順で構築してください:  
    1. [Base64 Decode and Encode](https://www.base64decode.org/) を開きます。  
    2. Exercise 3 Step 1 で生成された auth registration ID を貼り付けてデコードします。  
    3. デコード後の 2 つ目の部分 (## 以降) を使用し、`api://auth-<AuthConfigID_Decoded_SecondPart>` の形式で作成します。例: `api://auth-16cfcd90-803e-40ba-8106-356aa4927bb9`  
    ![Generating Application ID URI manually](../../assets/images/extend-m365-copilot-06c/oauth-A13.png)
  
Agents Toolkit で実行されるコード内でこれらの値を利用できるように、作業フォルダーのルートにある **teamsapp.local.yml** も更新します。コメント "Generate runtime environment variables" を探し、STORAGE_ACCOUNT_CONNECTION_STRING の下に新しい値を追加します。

~~~yaml
        APP_ID_URI: ${{APP_ID_URI}}
        API_TENANT_ID: ${{API_TENANT_ID}}
~~~

完成した yaml は次のようになります。

~~~yaml
  - uses: file/createOrUpdateEnvironmentFile
    with:
      target: ./.localConfigs
      envs:
        STORAGE_ACCOUNT_CONNECTION_STRING: ${{SECRET_STORAGE_ACCOUNT_CONNECTION_STRING}},
        APP_ID_URI: ${{APP_ID_URI}}
        API_TENANT_ID: ${{API_TENANT_ID}}
~~~

<cc-end-step lab="e6c" exercise="6" step="2" />

### Step 3: identity service の更新

これで SSO が動作し有効なアクセストークンが取得できますが、トークンが有効かどうかコード側で確認しないとセキュアではありません。この手順ではトークンを検証し、ユーザー 名や ID などの情報を抽出するコードを追加します。

**src/services** フォルダーの **IdentityService.ts** を開きます。  
ファイル冒頭の他の `import` 文と並べて次を追加します。

~~~typescript
import { TokenValidator, ValidateTokenOptions, getEntraJwksUri } from 'jwt-validate';
~~~

次に `class Identity` の直下にこの行を追加します。

~~~typescript
    private validator: TokenValidator;
~~~

次のコメントを探します。

~~~typescript
// ** INSERT REQUEST VALIDATION HERE (see Lab E6) **
~~~

コメントを次のコードで置き換えます。

~~~typescript
// Try to validate the token and get user's basic information
try {
    const { APP_ID_URI, API_TENANT_ID } = process.env;
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
        throw new HttpError(401, "Authorization token not found");
    }

    // create a new token validator for the Microsoft Entra common tenant
    if (!this.validator) {
        // We need a new validator object which we will continue to use on subsequent
        // requests so it can cache the Entra ID signing keys
        // For multitenant, use:
        // const entraJwksUri = await getEntraJwksUri();
        const entraJwksUri = await getEntraJwksUri(API_TENANT_ID);
        this.validator = new TokenValidator({
            jwksUri: entraJwksUri
        });
        console.log ("Token validator created");
    }

 
    const options: ValidateTokenOptions = {
                audience: APP_ID_URI, 
                issuer: `https://sts.windows.net/${API_TENANT_ID}/`,              
                scp: ["access_as_user"],
            
            };

    // validate the token
    const validToken = await this.validator.validateToken(token, options);

    userId = validToken.oid;
    userName = validToken.name;
    userEmail = validToken.upn;
    console.log(`Request ${this.requestNumber++}: Token is valid for user ${userName} (${userId})`);
}
catch (ex) {
    // Token is missing or invalid - return a 401 error
    console.error(ex);
    throw new HttpError(401, "Unauthorized");
}
~~~

!!! Note "コードから学ぶ"
    まず `Authorization` ヘッダーからトークンを取得しています。このヘッダーは "Bearer <space> token" の形式のため、JavaScript の `split(" ")` でトークン部分のみを取得します。  

    認証失敗時は例外を投げ、Azure Function が 401 エラーを返します。  

    次に `jwt-validate` ライブラリ用の validator を作成します。この呼び出しでは Entra ID の署名キーを取得するため async 処理となります。  

    さらに `ValidateTokenOptions` オブジェクトを設定し、ライブラリは以下を検証します:  
    * _audience_ が API の URI と一致すること  
    * _issuer_ が自テナントのセキュリティ トークン サービスであること  
    * _scope_ が `"access_as_user"` と一致すること  

    トークンが有効な場合、ライブラリはユーザー ID、名前、メールなどを含む claims を返します。

!!! Note "マルチテナント アプリの場合"
    マルチテナント アプリ用のトークン検証については上記コード内のコメントを参照してください。

コードが `userId` を取得した後、Consultant レコードを検索します。元のコードでは Avery Howard の ID がハードコードされていましたが、現在はログイン ユーザーの ID を使用し、データベースに存在しない場合は新規作成します。

初回実行時には、ログイン ユーザーの Consultant が既定のスキル、ロールで作成されるはずです。デモ用に変更したい場合は [Azure Storage Explorer](https://azure.microsoft.com/en-us/products/storage/storage-explorer/){target=_blank} で編集できます。  

![The Azure Storage Explorer in action while editing the Consultant table. The actual current user is highlighted.](../../assets/images/extend-m365-copilot-06/oauth-azure-storage-explorer.png)

Project assignments は `Assignment` テーブルに保存され、project ID と consultant ID を参照します。

<cc-end-step lab="e6c" exercise="6" step="3" />

### Step 4: ライブラリのバージョン問題の回避策

現時点では `jwt-validate` パッケージが `@types/jsonwebtoken` で型エラーを投げます。回避策としてプロジェクト ルートの **tsconfig.json** を編集し、`"skipLibCheck": true` を追加してください。ライブラリの将来バージョンで修正される予定です。

<cc-end-step lab="e6c" exercise="6" step="4" />

## Exercise 7: アプリケーションのテスト

アプリケーションをテストする前に、`appPackage\manifest.json` の manifest version を更新します。

1. `appPackage` フォルダーの `manifest.json` を開きます。  
2. JSON 内の `version` フィールドを見つけます。現在は次のようになっています:  

```json
"version": "1.0.0"
```

3. バージョン番号を小さくインクリメントします。例:  

```json
"version": "1.0.1"
```

4. 変更後にファイルを保存します。

### Step 1: アプリケーションの再起動

アプリケーションを再起動し、Copilot アプリで Trey Genie を開きます。

プロンプト例: 「私が担当しているプロジェクトは？」  
エージェントを許可すると、以下のようにサインインを求められます (初回のみ)。

![Sign in button](../../assets/images/extend-m365-copilot-06c/oauth-A14.png)

ボタンを選択すると、アプリケーションの API に現在のユーザーとしてアクセスする許可が求められるので、"Accept" を選択します。

![Accept permission](../../assets/images/extend-m365-copilot-06c/oauth-A15.png)

これ以降、ユーザー は毎回サインインすることなくスムーズにエージェントと対話できます。

![Single sign on](../../assets/images/extend-m365-copilot-06c/oauth-A16.gif)


<cc-end-step lab="e6c" exercise="7" step="1" />

---8<--- "ja/e-congratulations.md"

ラボ E6c「SSO の追加」を完了しました！

さらにチャレンジしたい場合は、ソリューションに Copilot Connector を追加してみましょう。

<cc-next url="../07-add-graphconnector" />

<img src="https://pnptelemetry.azurewebsites.net/copilot-camp/extend-m365-copilot/06c-add-sso--ja" />