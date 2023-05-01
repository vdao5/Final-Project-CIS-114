"use strict"

import Component from "./component.mjs";

export default class CDisclosure extends Component {
    static stylesheets = ["/modules/css/disclosure.css"];
    static html = `
    <div class="c-root">
        <details class="disclosure-details">
            <summary class="disclosure-summary"></summary>
            <div class="disclosure-content"></div>
        </details>
    </div>
    `;

    constructor() {
        super();
    }

    connectedCallback() {
        this.disclosureDetails = this.shadowRoot.querySelector(".disclosure-details");
        this.disclosureSummary = this.shadowRoot.querySelector(".disclosure-summary");
        this.disclosureContent = this.shadowRoot.querySelector(".disclosure-content");

        const event = new CustomEvent("c-disclosure-connected", { detail: this });
        this.parentElement.dispatchEvent(event);
    }
}

// define only once !!!
if (!customElements.get("c-disclosure")) {
    customElements.define("c-disclosure", CDisclosure);
}