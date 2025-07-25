---
search:
  exclude: true
---
# ラボ BTA3 - ユーザー エクスペリエンスの向上

このラボでは Powered by AI と呼ばれる、Teams AI ライブラリが提供する一連の機能について学び、それらをカスタム エンジン エージェントに組み込み、ユーザー エクスペリエンスを向上させます。

このラボで行うこと:

- Powered by AI 機能とは何かを学ぶ  
- フィードバック ループを有効化してユーザー フィードバックを収集する  
- Adaptive Cards を使って引用 (Citations) をカスタマイズする  
- AI 生成ラベルを有効化する  
- センシティビティ ラベルを有効化する  

<div class="lab-intro-video">
    <div style="flex: 1; min-width: 0;">
        <iframe  src="//www.youtube.com/embed/J7IZULJsagM" frameborder="0" allowfullscreen style="width: 100%; aspect-ratio: 16/9;">          
        </iframe>
          <div>このビデオでラボの概要を確認しましょう。</div>
    </div>
    <div style="flex: 1; min-width: 0;">
        ---8<--- "ja/b-labs-prelude.md"
    </div>
</div>

## はじめに

???+ info "Powered by AI とは？"
    Powered by AI は、Teams AI ライブラリが提供する一連の機能で、カスタム エンジン エージェントとの対話をより魅力的かつユーザー フレンドリーにします。主な機能は次のとおりです。

    * **フィードバック ループ:** ユーザーは AI の応答に対してサムズアップまたはサムズダウンで評価できます。このフィードバックは AI の精度と有用性を継続的に向上させます。  

    * **引用 (Citations):** AI が情報源への参照を提示し、透明性と信頼性を確保します。  

    * **AI 生成ラベル:** AI システムが生成したメッセージに「AI 生成」というラベルを付与し、ユーザーが AI と人間の応答を区別できるようにします。  

    * **センシティビティ情報:** 共有される情報が機密性を伴う場合、センシティビティ ラベルを表示し、組織外に共有できるかどうかを通知します。  

前回の演習では Retrieval-Augmented Generation (RAG) とそれをカスタム エンジン エージェントに統合する方法を学びました。本演習では Powered by AI 機能を活用してユーザー エクスペリエンスを向上させます。次の手順を実施します。

- フィードバック ループの実装  
- 引用のカスタマイズ  
- AI 生成メッセージのラベル付け  
- センシティビティ情報の表示  

これらの Powered by AI 機能を組み込むことで、カスタム エンジン エージェントの透明性、信頼性、ユーザー フレンドリ性が向上し、全体的なユーザー エクスペリエンスが強化されます。

## 演習 1: フィードバック ループを有効化する

この演習では、前のラボで作成したソース コードを続けて使用できます。

### 手順 1: アプリにフィードバック ループを統合する

プロジェクトの `src/app/app.ts` を開き、アプリケーション インスタンスを見つけて **ai** プロパティ内に `enable_feedback_loop: true` を追加します。更新後のアプリケーション インスタンスは次のようになります。

```javascript
const app = new Application({
  storage,
  ai: {
    planner,
    //feedback loop is enabled
    enable_feedback_loop: true
  },
});
```

フィードバックの応答を処理するために、`src/app/app.ts` に次のコード スニペットを追加してください。

```javascript
app.feedbackLoop(async (_context, _state, feedbackLoopData) => {
  if (feedbackLoopData.actionValue.reaction === 'like') {
      console.log('👍' + ' ' + feedbackLoopData.actionValue.feedback!);
  } else {
      console.log('👎' + ' ' + feedbackLoopData.actionValue.feedback!);
  }
});
```

<cc-end-step lab="bta3" exercise="1" step="1" />

### 手順 2: フィードバック ループ機能をテストする

Visual Studio Code の **Run and Debug** タブで **Debug in Teams (Edge)** または **Debug in Teams (Chrome)** を選択し、アプリのデバッグを開始します。ブラウザーで Microsoft Teams が開き、アプリの詳細が表示されたら **Add** を選択してチャットを開始します。

!!! tip "ヒント: この演習をローカルでテストする"
    Teams AI ライブラリの一部機能は Teams App Test Tool では動作しない場合があります。必ずローカルの Teams でテストとデバッグを行ってください。

フィードバック ループをテストする前に、「Hi」や「Suggest me .NET developers who can speak Spanish.」のように入力します。カスタム エンジン エージェントの応答の左下にサムズアップとサムズダウンのボタンが表示されるはずです。

![The UI of a chat with the custom engine agent when the Feedback Loop is enabled. There are thumbs up and down buttons just below the response, to allow users to provide feedback.](../../../assets/images/custom-engine-03/thumbs-up-down.png)

次にフィードバック ループをテストします。いずれかのボタンをクリックすると、フィードバック カードがポップアップ表示されます。テキスト フィールドにフィードバックを入力し、**Submit** をクリックします。

![The UI of a chat with the custom engine agent when the Feedback Loop is enabled and the user selects any of the thumbs up or down buttons. There is a popup dialog to provide a detailed text-based feedback and a 'Submit' button to send it.](../../../assets/images/custom-engine-03/feedback-card.png)

フィードバックが記録されたか確認するため、Visual Studio Code に戻りターミナルを確認します。サムズアップ／ダウンの結果とコメントが表示されます。

![The terminal window of Visual Studio Code showing the user's feedback with a thumb up and the feedback text 'Copilot Camp rocks!'](../../../assets/images/custom-engine-03/feedback-output.png)

!!! tip "デバッグでフィードバック ループを深掘り"
    コードをデバッグすると動作を詳細に理解できます。`app.feedbackLoop` にブレークポイントを設定し、サムズアップまたはサムズダウンをクリックしてテストしてください。`feedbackLoopData.actionValue.reaction` にリアクションが、`feedbackLoopData.actionValue.feedback` にテキスト フィードバックが格納されていることを確認できます。

<cc-end-step lab="bta3" exercise="1" step="2" />

## 演習 2: Adaptive Cards で引用をカスタマイズする

カスタム エンジン エージェントでデータ ソースを定義すると、Teams AI ライブラリは自動的に引用を有効化し関連ドキュメントを参照します。現在の挙動を確認するため、「Suggest me .NET developers who can speak Spanish.」のように入力してみてください。引用にカーソルを合わせるとドキュメントの冒頭が表示されることがわかります。

![The UI of a chat with the custom engine agent when citations are enabled. There is a citation mark beside a content in the response and a popup callout to show the initial part of the referenced document.](../../../assets/images/custom-engine-03/current-citation.png)

本演習では、この引用体験をさらにカスタマイズし、Adaptive Cards を利用して引用の表示方法を変更します。

### 手順 1: 引用用の Adaptive Card を作成する

`src/app/` フォルダーに **card.ts** という新しいファイルを作成し、次のコード スニペットを追加します。

```javascript
import { AdaptiveCard, Message, Utilities } from '@microsoft/teams-ai';
/**
 * Create an adaptive card from a prompt response.
 * @param {Message<string>} response The prompt response to create the card from.
 * @returns {AdaptiveCard} The response card.
 */

//Adaptive card to display the response and citations
export function createResponseCard(response: Message<string>): AdaptiveCard {
    const citationCards = response.context?.citations.map((citation, i) => ({
            type: 'Action.ShowCard',
            title: `${i+1}`,
            card: {
                type: 'AdaptiveCard',
                body: [
                    {
                        type: 'TextBlock',
                        text: citation.title,
                        fontType: 'Default',
                        weight: 'Bolder'
                    },
                    {
                        type: 'TextBlock',
                        text: citation.content,
                        wrap: true
                    }
                ]
            }
        }));
    
    const text = Utilities.formatCitationsResponse(response.content!);
    return {
        type: 'AdaptiveCard',
        body: [
            {
                type: 'TextBlock',
                text: text,
                wrap: true
            },
            {
                type: 'TextBlock',
                text: 'Citations',
                wrap: true,
                fontType: 'Default',
                weight: 'Bolder'
            },
            {
                type: 'ActionSet',
                actions: citationCards
            }
        ],
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        version: '1.5'
    };
}
```

この Adaptive Card は引用を `Action.ShowCard` ボタンとしてリスト表示し、クリックすると詳細を表示します。回答のメイン コンテンツと引用ボタンを併せて表示し、ユーザーが引用をクリックすることで全文を確認できるようにします。

<cc-end-step lab="bta3" exercise="2" step="1" />

### 手順 2: PredictedSayCommand を使用して引用体験をカスタマイズする

??? info "`PredictedSayCommand` は何をするのですか？"
    **PredictedSayCommand** は AI システムが実行する応答ディレクティブです。PredictedSayCommand をカスタマイズすることで、引用やフィードバック ループなど Powered by AI 機能をカスタム エンジン エージェントのアクティビティに細かく統合できます。

`src/app/app.ts` を開き、Adaptive Card をインポートするために次のスニペットをコードの先頭に追加します。

```javascript
import { createResponseCard } from './card';
```

`botbuilder` のインポートに `CardFactory` を追加し、更新後は次のようになります。

```javascript
import { CardFactory, MemoryStorage, MessageFactory, TurnContext } from "botbuilder";
```

"@microsoft/teams-ai" のインポートに `AI` と `PredictedSayCommand` を追加し、更新後は次のようになります。

```javascript
import { Application, ActionPlanner, OpenAIModel, PromptManager, AI, PredictedSayCommand} from "@microsoft/teams-ai";
```

引用をカスタマイズするために、`src/app/app.ts` に次の PredictedSayCommand アクションを追加します。

```javascript
app.ai.action<PredictedSayCommand>(AI.SayCommandActionName, async (context, state, data, action) => {
  let activity;
  if (data.response.context && data.response.context.citations.length > 0 ) {
      const attachment = CardFactory.adaptiveCard(createResponseCard(data.response));
      activity = MessageFactory.attachment(attachment);
  }
  else {
      activity = MessageFactory.text(data.response.content);
  }

  activity.entities = [
    {
        type: "https://schema.org/Message",
        "@type": "Message",
        "@context": "https://schema.org",
        "@id": ""
    }
  ];
  activity.channelData = {
    feedbackLoopEnabled: true
  };

  await context.sendActivity(activity);

  return "success";
 
});
```

<cc-end-step lab="bta3" exercise="2" step="2" />

### 手順 3: カスタマイズした引用体験をテストする

Visual Studio Code の **Run and Debug** タブから **Debug in Teams (Edge)** または **Debug in Teams (Chrome)** を選択してデバッグを開始します。ブラウザーで Microsoft Teams が開き、アプリの詳細が表示されたら **Add** を選択してチャットを開始します。

!!! tip "ヒント: この演習をローカルでテストする"
    Teams AI ライブラリの一部機能は Teams App Test Tool では動作しない場合があります。必ずローカルの Teams でテストとデバッグを行ってください。

「Hi」や「Hello」で Career Genie に挨拶した後、「Can you suggest any candidates for a senior developer position with 7+ year experience that requires Japanese speaking?」のような質問をしてみてください。

![An animation showing the behavior of citations in a custom engine agent. There is a prompt and a response that provides three citations. Each citation shows the actual resume for each employee referenced in the answer.](../../../assets/images/custom-engine-03/customized-citation.gif)

Adaptive Cards でカスタマイズされた引用体験では、引用ごとにボタンが表示されます。各ボタンをクリックするとドキュメント ビューが展開され、候補者の履歴書の詳細を確認できます。

<cc-end-step lab="bta3" exercise="2" step="3" />

## 演習 3: AI 生成ラベルを有効化する

この演習では、`PredictedSayCommand` を使用してユーザー エクスペリエンスをさらにカスタマイズし、AI と人間の応答を区別できるように「AI 生成」ラベルを有効化します。

### 手順 1: PredictedSayCommand で AI 生成ラベルを有効化する

`src/app/app.ts` を開き、`PredictedSayCommand` アクションを見つけて、`activity.entities` 内に次のコード スニペットを追加します。

```javascript
// Generated by AI label
additionalType: ["AIGeneratedContent"]
```

更新後の `activity.entities` は次のようになります。

```javascript
activity.entities = [
    {
        type: "https://schema.org/Message",
        "@type": "Message",
        "@context": "https://schema.org",
        "@id": "",
        // Generated by AI label
        additionalType: ["AIGeneratedContent"],
    },
    
];
```

<cc-end-step lab="bta3" exercise="3" step="1" />

### 手順 2: AI 生成ラベルをテストする

Visual Studio Code の **Run and Debug** タブで **Debug in Teams (Edge)** または **Debug in Teams (Chrome)** を選択し、デバッグを開始します。ブラウザーで Microsoft Teams が開き、アプリの詳細が表示されたら **Add** を選択してチャットを開始します。

!!! tip "ヒント: この演習をローカルでテストする"
    Teams AI ライブラリの一部機能は Teams App Test Tool では動作しない場合があります。必ずローカルの Teams でテストとデバッグを行ってください。

Career Genie に挨拶するだけで、「AI generated」ラベルがメッセージの上部に表示されることを確認できます。

![The UI of a chat with the custom engine agent when the Generated by AI label is enabled. At the top of the answer there is a label showing that the content is 'AI generated'.](../../../assets/images/custom-engine-03/ai-generated.png)

<cc-end-step lab="bta3" exercise="3" step="2" />

## 演習 4: センシティビティ ラベルを有効化する

最後の演習では、`PredictedSayCommand` を利用してセンシティビティ ラベルを有効化します。Career Genie は人事業務の専門家として機密情報を共有するケースが多いため、AI 生成メッセージの上部にセンシティビティ ラベルを表示し、組織外への共有可否を示します。

### 手順 1: PredictedSayCommand でセンシティビティ ラベルを有効化する

`src/app/app.ts` を開き、`PredictedSayCommand` アクションを見つけて `activity.entities` 内に次のコード スニペットを追加します。

```javascript
// Sensitivity label
usageInfo: {
    "@type": "CreativeWork",
    name: "Confidential",
    description: "Sensitive information, do not share outside of your organization.",
}
```

更新後の `activity.entities` は次のようになります。

```javascript
activity.entities = [
    {
        type: "https://schema.org/Message",
        "@type": "Message",
        "@context": "https://schema.org",
        "@id": "",
        // Generated by AI label
        additionalType: ["AIGeneratedContent"],
        // Sensitivity label
        usageInfo: {
          "@type": "CreativeWork",
          name: "Confidential",
          description: "Sensitive information, do not share outside of your organization.",
        }
    },
    
  ];
```

<cc-end-step lab="bta3" exercise="4" step="1" />

### 手順 2: センシティビティ ラベルをテストする

Visual Studio Code の **Run and Debug** タブで **Debug in Teams (Edge)** または **Debug in Teams (Chrome)** を選択し、デバッグを開始します。ブラウザーで Microsoft Teams が開き、アプリの詳細が表示されたら **Add** を選択してチャットを開始します。

!!! tip "ヒント: この演習をローカルでテストする"
    Teams AI ライブラリの一部機能は Teams App Test Tool では動作しない場合があります。必ずローカルの Teams でテストとデバッグを行ってください。

Career Genie に挨拶するか、「Can you suggest a candidate who is suitable for spanish speaking role that requires at least 2 years of .NET experience?」のような質問をしてみてください。

![The UI of a chat with the custom engine agent when the Sensitivity label is enabled. At the top of the answer, next to the 'AI generated' label, there is a sensitivity shield label highlighted. There is also a card with specific guidance that appears when hoovering over the sensitivity label.](../../../assets/images/custom-engine-03/sensitivity-label.png)

Career Genie のメッセージ上部に「AI Generated」ラベルの隣にセンシティビティ ラベルが表示されます。ラベルにカーソルを合わせて、組織固有のガイダンスを確認してください。

<cc-end-step lab="bta3" exercise="4" step="2" />

---8<--- "ja/b-congratulations.md"

Powered by AI キットを使ったラボ BTA3 ‑ ユーザー エクスペリエンスの向上を完了しました！ さらに深く学びたい場合は、このラボのソース コードが [Copilot Developer Camp リポジトリ](https://github.com/microsoft/copilot-camp/tree/main/src/custom-engine-agent/Lab03-Powered-by-AI/CareerGenie){target=_blank} にあります。

次はラボ BTA4 ‑ 認証を使用してソリューションを保護する に進みましょう。**Next** を選択してください。

<cc-next url="../04-authentication" />

<img src="https://m365-visitor-stats.azurewebsites.net/copilot-camp/custom-engine/teams-ai/03-powered-by-ai" />