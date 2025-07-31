---
search:
  exclude: true
---
# ラボ  E3 - 宣言型エージェントと API プラグインの追加

このラボでは、前のラボで作成した API プラグインと特定の SharePoint ファイルを基盤とする宣言型エージェントを追加します。

<div class="lab-intro-video">
    <div style="flex: 1; min-width: 0;">
        <iframe  src="//www.youtube.com/embed/XO2aG3YPbPc" frameborder="0" allowfullscreen style="width: 100%; aspect-ratio: 16/9;">          
        </iframe>
          <div>このビデオでラボの概要を素早く確認できます。</div>
              <div class="note-box">
            📘 <strong>Note:</strong> このラボは前のラボである Lab  E2 を基盤としています。ラボ  E2–E6 は同じフォルダーで作業を継続できますが、参照用にソリューション フォルダーも用意されています。  
    このラボの完成済みソリューションは <a src="https://github.com/microsoft/copilot-camp/tree/main/src/extend-m365-copilot/path-e-lab03-build-declarative-agent/trey-research-lab03-END" target="_blank">/src/extend-m365-copilot/path-e-lab03-build-declarative-agent/trey-research-lab03-END</a> フォルダーにあります。
        </div>
        </div>
    <div style="flex: 1; min-width: 0;">
  ---8<--- "ja/e-labs-prelude.md"
    </div>
</div>

## 演習  1: サンプル ドキュメントのアップロード

この手順では、宣言型エージェントがユーザー プロンプトに応答するために使用するサンプル ドキュメントをアップロードします。これには Statement of Work などのコンサルティング ドキュメントと、コンサルタントとしての稼働時間を記録した簡単なスプレッドシートが含まれます。

### 手順  1: SharePoint サイトの作成

[Microsoft 365 app](https://www.office.com/){target=_blank} などで、ワッフル メニュー 1️⃣ をクリックし、 "SharePoint" 2️⃣ を選択します。

![The UI of Microsoft 365 with the waffle menu expanded and the SharePoint workload highlighted.](../assets/images/extend-m365-copilot-05/upload-docs-01.png)

次に "Create Site" 1️⃣ をクリックし、 "Team site" 2️⃣ を選択します。

![The UI to create a new SharePoint Online site, with 'Team Site' template suggested.](../assets/images/extend-m365-copilot-05/upload-docs-02.png)

Standard team site テンプレートを選択すると、サイトのプレビューが表示されます。"Use Template" をクリックして続行します。

![The UI to select the 'Standard' site template for the target site.](../assets/images/extend-m365-copilot-05/upload-docs-03.png)

サイト名に "Trey Research legal documents" などを入力 1️⃣ し、 "Next" 2️⃣ をクリックします。

![The UI to provide name, description, and other details for the target site to create.](../assets/images/extend-m365-copilot-05/upload-docs-05.png)

プライバシー設定と言語を選択し、 "Create Site" をクリックします。

![The UI to select the privacy settings and the language for the target site.](../assets/images/extend-m365-copilot-05/upload-docs-06.png)

数秒後、新しい SharePoint サイトが表示されます。

<cc-end-step lab="e3" exercise="1" step="1" />

### 手順  2: サンプル ドキュメントのアップロード

Documents Web パーツで "See all" を選択し、ドキュメント ライブラリ ページを表示します。

![The home page of the site with the Documents web part and the 'See all' link highlighted.](../assets/images/extend-m365-copilot-05/upload-docs-07.png)

次にツールバーの "Upload" 1️⃣ をクリックし、 "Files" 2️⃣ を選択します。

![The command bar of the document library with the 'Upload' menu expanded and the 'Files' option selected.](../assets/images/extend-m365-copilot-05/upload-docs-08.png)

作業フォルダーに移動すると **sampleDocs** ディレクトリがあります。すべてのサンプル ドキュメントを選択 1️⃣ し、 "Open" 2️⃣ をクリックします。

サイト URL は `https://<your-tenant>.sharepoint.com/sites/TreyResearchlegaldocuments` のようになります。次の演習で使用するためメモしておいてください。

![The file system browsing dialog to select the files to upload.](../assets/images/extend-m365-copilot-05/upload-docs-09.png)

<cc-end-step lab="e3" exercise="1" step="2" />

## 演習  2: 宣言型エージェントの作成

### 手順  1: 宣言型エージェント JSON をプロジェクトに追加

**appPackage** フォルダー内に **trey-declarative-agent.json** という新しいファイルを作成します。このファイルに次の JSON をコピーし、保存します。

```json
{
    "$schema": "https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.3/schema.json",
    "version": "v1.3",
    "name": "Trey Genie Local",
    "description": "You are a handy assistant for consultants at Trey Research, a boutique consultancy specializing in software development and clinical trials. ",
    "instructions": "You are consulting agent. Greet users professionally and introduce yourself as the Trey Genie. Offer assistance with their consulting projects and hours. Remind users of the Trey motto, 'Always be Billing!'. Your primary role is to support consultants by helping them manage their projects and hours. Using the TreyResearch action, you can: You can assist users in retrieving consultant profiles or project details for administrative purposes but do not participate in decisions related to hiring, performance evaluation, or assignments. You can assist users to find consultants data based on their names, project assignments, skills, roles, and certifications. You can assist users to retrieve project details based on the project or client name. You can assist users to charge hours to a project. You can assist users to add a consultant to a project. If a user inquires about the hours they have billed, charged, or worked on a project, rephrase the request to ask about the hours they have delivered. Additionally, you may provide general consulting advice. If there is any confusion, encourage users to consult their Managing Consultant. Avoid providing legal advice.",
    "conversation_starters": [
        {
            "title": "Find consultants",
            "text": "Find consultants with TypeScript skills"
        },
        {
            "title": "My Projects",
            "text": "What projects am I assigned to?"
        },
        {
            "title": "My Hours",
            "text": "How many hours have I delivered on projects this month?"
        }
    ],
    "capabilities": [
        {
            "name": "OneDriveAndSharePoint",
            "items_by_url": [
                {
                    "url": "${{SHAREPOINT_DOCS_URL}}"
                }
            ]
        }
    ],
    "actions": [
        {
            "id": "treyresearch",
            "file": "trey-plugin.json"
        }
    ]
}
```

このファイルには宣言型エージェントの name、description、instructions が含まれています。instructions では Copilot に「常に Trey のモットー ‘Always be Billing!’ をユーザーに思い出させる」と指示している点に注目してください。次の演習で Copilot にプロンプトを送ると、この表現が確認できます。

<cc-end-step lab="e3" exercise="2" step="1" />

### 手順  2: SharePoint サイトの URL を宣言型エージェントに追加

"Capabilities" には SharePoint ファイル コンテナーが含まれています。Microsoft 365 Copilot は SharePoint や OneDrive 内のドキュメントを参照できますが、この宣言型エージェントは Exercise  1 で作成した Trey Research Legal Documents サイト内のファイルのみを参照します。

```json
"capabilities": [
    {
        "name": "OneDriveAndSharePoint",
        "items_by_url": [
            {
                    "url": "${{SHAREPOINT_DOCS_URL}}"
            }
        ]
    }
],
```

SharePoint URL は環境変数 `SHAREPOINT_DOCS_URL` になっているため、**env** フォルダー内の **.env.local** ファイルに追加する必要があります。ファイルの末尾に次の行を追加し、ご自分の SharePoint URL に置き換えてください。

```text
SHAREPOINT_DOCS_URL=https://mytenant.sharepoint.com/sites/TreyResearchLegaldocuments
```

<cc-end-step lab="e3" exercise="2" step="2" />

### 手順  3: API プラグイン ファイルを確認

**trey-declarative-agent.json** ファイルには "actions" セクションがあり、宣言型エージェントが Trey Research API にアクセスするよう指示しています。

```json
"actions": [
    {
        "id": "treyresearch",
        "file": "trey-plugin.json"
    }
]
```

ここでは **trey-plugin.json** がどのように API を Copilot に説明し、REST 呼び出しを可能にしているかを確認します。

これら  2 つのファイルは API を Copilot に説明するために使用されます。Lab  2 でダウンロードしたプロジェクトに既に含まれているので、今確認できます。

* [**appPackage/trey-definition.json**](https://github.com/microsoft/copilot-camp/blob/main/src/extend-m365-copilot/path-e-lab03-build-declarative-agent/trey-research-lab03-END/appPackage/trey-definition.json){target=_blank} - 業界標準の REST API 仕様である [OpenAPI Specification (OAS)](https://swagger.io/specification/){target=_blank}（いわゆる Swagger）ファイル  
* [**appPackage/trey-plugin.json**](https://github.com/microsoft/copilot-camp/blob/main/src/extend-m365-copilot/path-e-lab03-build-declarative-agent/trey-research-lab03-END/appPackage/trey-plugin.json){target=_blank} - OAS ファイルでは記述されない Copilot 固有の詳細を含むファイル

まずはこれらのファイルを確認しましょう。次のいくつかのラボで、ソリューションに機能を追加しながらより深く理解していきます。

**appPackage/trey-definition.json** にはアプリケーションの概要が記載されています。ここにはサーバー URL が含まれており、Agents Toolkit が [developer tunnel](https://learn.microsoft.com/azure/developer/dev-tunnels/){target=_blank} を作成してローカル API をインターネットに公開し、`${{OPENAPI_SERVER_URL}}` トークンを公開 URL に置き換えます。その後、API の各リソース パス、HTTP 動詞、パラメーターを説明しています。詳細な説明に注目してください。Copilot が API の使い方を理解するために重要です。

```json
{
  "openapi": "3.0.1",
  "info": {
      "version": "1.0.0",
      "title": "Trey Research API",
      "description": "API to streamline consultant assignment and project management."
  },
  "servers": [
      {
          "url": "${{OPENAPI_SERVER_URL}}/api/",
          "description": "Production server"
      }
  ],
  "paths": {
      "/consultants/": {
          "get": {
              "operationId": "getConsultants",
              "summary": "Get consultants working at Trey Research based on consultant name, project name, certifications, skills, roles and hours available",
              "description": "Returns detailed information about consultants identified from filters like name of the consultant, name of project, certifications, skills, roles and hours available. Multiple filters can be used in combination to refine the list of consultants returned",
              "parameters": [
                  {
                      "name": "consultantName",
                      "in": "query",
                      "description": "Name of the consultant to retrieve",
                      "required": false,
                      "schema": {
                          "type": "string"
                      }
                  },
      ...
```

**appPackage/trey-plugin.json** には Copilot 固有の詳細が記載されています。API 呼び出しを Copilot が利用しやすい functions に分割しています。たとえば、`/consultants` へのすべての GET 要求は、さまざまなパラメーターでコンサルタントを検索し、`getConsultants` 関数としてグループ化されています。

```json
  "functions": [
    {
      "name": "getConsultants",
      "description": "Returns detailed information about consultants identified from filters like name of the consultant, name of project, certifications, skills, roles and hours available. Multiple filters can be used in combination to refine the list of consultants returned",
      "capabilities": {
        "response_semantics": {
          "data_path": "$.results",
          "properties": {
            "title": "$.name",
            "subtitle": "$.id",
            "url": "$.consultantPhotoUrl"
          }
        }
      }
    },
```

下の方に runtime 設定があります。

```json
"runtimes": [
  {
    "type": "OpenApi",
    "auth": {
      "type": "None"
    },
    "spec": {
      "url": "trey-definition.json"
    },
    "run_for_functions": [
      "getConsultants",
      "getUserInformation",
      "postBillhours"
    ]
  }
],
```

ここで **trey-definition.json** ファイルへの参照と、利用可能な関数の一覧を定義しています。

<cc-end-step lab="e3" exercise="2" step="3" />

### 手順  4: 宣言型エージェントをアプリ マニフェストに追加

**appPackage** ディレクトリ内の **manifest.json** を開き、`staticTabs` オブジェクトの直前に次の `copilotAgents` オブジェクトを追加して、先ほど作成した宣言型エージェント JSON ファイルを参照させます。

```json
  "copilotAgents": {
    "declarativeAgents": [
      {
        "id": "treygenie",
        "file": "trey-declarative-agent.json"
      }
    ]
  }, 
```

忘れずに保存してください。

<cc-end-step lab="e3" exercise="2" step="4" />

### 手順  5: ダミー機能をアプリ マニフェストから削除

Lab  E2 の初期ソリューションには宣言型エージェントがまだ無かったため、機能がない状態ではマニフェストをインストールできませんでした。そこで "Copilot Developer Camp" ホームページを指す静的タブという "ダミー" 機能を追加していました。  
これは Teams、Outlook、Microsoft 365 app ([https://office.com](https://office.com){target=_blank}) 内のタブで Copilot Developer Camp Web サイトを表示するためのものです。

もし [Teams App Camp](https://aka.ms/app-camp){target=_blank} を試したことがあればよくご存じかと思います。そうでなければ気にせず、以下の行を **manifest.json** から削除してください。もう不要です。

```json
"staticTabs": [
  {
    "entityId": "index",
    "name": "Copilot Camp",
    "contentUrl": "https://microsoft.github.io/copilot-camp/",
    "websiteUrl": "https://microsoft.github.io/copilot-camp/",
    "scopes": [
      "personal"
    ]
  }
],
"validDomains": [
  "microsoft.github.io"
],
```

<cc-end-step lab="e3" exercise="2" step="5" />

## 演習  3: 宣言型エージェントの実行とテスト

### 手順  1: 新しいプロジェクトの実行

まだデバッガーが起動している場合は停止して、完全に再デプロイします。

その後、F5 キーを押すか再生ボタンをクリックしてデバッガーを起動し、Copilot ユーザー インターフェイスに戻ります。

<cc-end-step lab="e3" exercise="3" step="1" />

### 手順  2: 宣言型エージェントのテスト

Copilot チャットを開き、右側のフライアウト 1️⃣ で以前のチャットと宣言型エージェントを表示し、Trey Genie Local エージェント 2️⃣ を選択します。

![Microsoft 365 Copilot showing the Trey Genie agent in action. On the right side there is the custom declarative agent, together with other agents. In the main body of the page there are the conversation starters and the textbox to provide a prompt to the agent.](../assets/images/extend-m365-copilot-05/run-declarative-copilot-01.png)

たとえば "Please list my projects along with details from the Statement of Work doc" と入力してみてください。  
API プラグインから取得したプロジェクトの一覧が表示され、各プロジェクトの Statement of Work からの詳細が追加されているはずです 1️⃣。Copilot が Trey Research のモットー 2️⃣ やドキュメントへの参照 3️⃣ を含めている点に注目してください。参照をクリックするとドキュメントを確認できます。

![The output of the declarative agent with information about projects the user is working on, reference documents from the SharePoint site, and the motto 'Always be Billing!'](../assets/images/extend-m365-copilot-05/run-declarative-copilot-02.png)

!!! note
    SharePoint ドキュメントが参照されない場合は、ファイルへのアクセスに問題がある可能性があります。Search がサイトをインデックスする時間は十分でしたか？ エンド ユーザーはサイトにアクセスできますか？ 管理者がサイトを Search の対象外にしていませんか？  
    Copilot 以外で次のような検索を試してください。  

    `woodgrove path:"https://<tenant>.sharepoint.com/sites/<sitename>"`  

    `<tenant>` と `<sitename>` を Capability に指定したテナント名とサイト名に置き換えてください。Woodgrove のドキュメントが  3 件表示されるはずです。表示されない場合は Search をトラブルシュートしてください。Copilot もファイルを見つけられません。

<cc-end-step lab="e3" exercise="3" step="2" />

---8<--- "ja/e-congratulations.md"

宣言型エージェントを API プラグインに追加し終えました。次は、API とエージェント用プラグインを拡張しましょう。

<cc-next />

<img src="https://m365-visitor-stats.azurewebsites.net/copilot-camp/extend-m365-copilot/03-add-declarative-copilot--ja" />