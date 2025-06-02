<div class="cc-lab-toc e-path">
  <img src="/copilot-camp/assets/images/path-icons/E-path-heading.png"></img>
  <div>
    <p>Do these labs if you want to build a Declarative agent where Microsoft 365 provides the AI model and orchestration</p>
    <ul>
      <li><a href="/copilot-camp/pages/extend-m365-copilot/00-prerequisites/">E0 - Setup</a></li>
      <li><a href="/copilot-camp/pages/extend-m365-copilot/01-declarative-copilot/">E1 - First declarative agent</a></li>
      <li><a href="/copilot-camp/pages/extend-m365-copilot/02-build-the-api/">E2 - Build an API</a></li>
      <li><a href="/copilot-camp/pages/extend-m365-copilot/03-add-declarative-agent/">E3 - Add a declarative agent and API plugin</a></li>
      <li><a href="/copilot-camp/pages/extend-m365-copilot/04-enhance-api-plugin/">E4 - Enhance the API and plugin</a></li>
      <li><a href="/copilot-camp/pages/extend-m365-copilot/05-add-adaptive-card/">E5 - Add adaptive cards</a></li>
      <li><a href="/copilot-camp/pages/extend-m365-copilot/06a-add-authentication-ttk/">E6a - Add Entra ID authentication (Microsoft 365 Agents Toolkit)</a></li>
      <li><a href="/copilot-camp/pages/extend-m365-copilot/06b-add-authentication/">E6b - Add Entra ID authentication (manual setup)</a></li>
      <li><a href="/copilot-camp/pages/extend-m365-copilot/06c-add-sso/">E6c - Add Entra ID authentication (Single sign-on)</a></li>
      <li><a href="/copilot-camp/pages/extend-m365-copilot/EB-add-graphconnector/">Bonus - Add Copilot Connector</a></li>
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
        if (location.href.includes(anchor.href)) {
            const span = document.createElement("span");
            span.innerHTML = "YOU&nbsp;ARE&nbsp;HERE";
            li.appendChild(span);
        }
    }    
}
})();
</script>

