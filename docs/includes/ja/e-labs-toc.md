<div class="cc-lab-toc e-path">
    <img src="/copilot-camp/assets/images/path-icons/E-path-heading.png"></img>
    <div>
        <p>Microsoft 365 が AI モデルとオーケストレーションを提供する宣言型 エージェントを構築したい場合は、これらの ラボ を実施してください。</p>
        <ul id="lab-toc">
            <li><strong><a href="/copilot-camp/pages/extend-m365-copilot/index">🏁 ようこそ</a></strong></li>
            <li><strong>🔧 セットアップ</strong>
                <ul>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/00-prerequisites">ラボ E0 - セットアップ</a></li>
                </ul>
            </li>
            <li><strong>🧰 宣言型 エージェントの基礎</strong>
                <ul>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/01-typespec-declarative-agent">ラボ E1 - 詳細な宣言型 エージェントを構築する</a>
                    </li>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/01a-geolocator">ラボ E1a - Geo ロケーターゲーム</a></li>
                </ul>
            </li>
            <li><strong>🛠️ API をゼロから構築して統合する</strong>
                <ul>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/02-build-the-api">ラボ E2 - API を構築する</a></li>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/03-add-declarative-agent">ラボ E3 - 宣言型 エージェント + API を追加する</a></li>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/04-enhance-api-plugin">ラボ E4 - API + プラグインを拡張する</a></li>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/05-add-adaptive-card">ラボ E5 - Adaptive Cards を追加する</a></li>
                </ul>
            </li>
            <li><strong>🔐 認証</strong>
                <ul>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/06a-add-authentication-ttk">ラボ E6a - Toolkit</a></li>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/06b-add-authentication">ラボ E6b - 手動</a></li>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/06c-add-sso">ラボ E6c - SSO</a></li>
                </ul>
            </li>
            <li><strong>🔌 統合</strong>
                <ul>
                    <li><a href="/copilot-camp/pages/extend-m365-copilot/07-add-graphconnector">ラボ EB - Graph Connector を追加する</a></li>
                </ul>
            </li>
        </ul>
    </div>
</div>

<script>
(() => {

// This script decorates the table of contents with a "you are here" indicator.
const toc = document.getElementsByClassName('cc-lab-toc');
for (const div of toc) {
    const lis = div.querySelectorAll('li');
    for (const li of lis) {
        const anchor = li.querySelector('a');
        if (anchor) {            // Get the last segment of the current URL path
            const currentPath = window.location.pathname.slice(0, -1).split('/').pop();

            // Get the last segment of the link path
            const linkPath = anchor.getAttribute('href').split('/').pop().replace('.md', '');

            // Compare the last segments
            if (currentPath === linkPath) {
                const existingSpan = document.querySelector('span.you-are-here');
                if (existingSpan) {
                    existingSpan.remove();
                }
                const span = document.createElement("span");
                span.innerHTML = "YOU&nbsp;ARE&nbsp;HERE";
                span.className = "you-are-here";
                li.appendChild(span);
            }
        }
    }
}
})();
</script>