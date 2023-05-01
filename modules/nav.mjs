"use strict"
import Component from "./component.mjs";
import "./disclosure.mjs";

export default class CNav extends Component {
    static stylesheets = ["/modules/css/nav.css"];
    static html = `
    <div class="c-root">
        <ul class="nav-list">
            <div class="nav-left">
                <li> 
                    <a href="https://www.nps.gov/" class="nav-logo"></a>
                    <span class="nav-title"></span>
                </li>
            </div>

            <div class="nav-center">
            </div>

            <div class="nav-right">
            </div>
        </ul>
    </div>
    `;

    constructor() {
        super();
    }

    connectedCallback() {
        this.navLeft = this.shadowRoot.querySelector(".nav-left");
        this.navCenter = this.shadowRoot.querySelector(".nav-center");
        this.navRight = this.shadowRoot.querySelector(".nav-right");
        this.navLogo = this.shadowRoot.querySelector(".nav-logo");
        this.navTitle = this.shadowRoot.querySelector(".nav-title");

        const event = new CustomEvent("c-nav-connected", { detail: this });
        this.parentElement.dispatchEvent(event);
    }
}

// define only once !!!
if (!customElements.get("c-nav")) {
    customElements.define("c-nav", CNav);
}