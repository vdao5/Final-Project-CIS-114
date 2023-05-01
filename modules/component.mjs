"use strict"

export default class Component extends HTMLElement {
    static #templates = {}; //private static templates container

    get template() {
        const key = this.constructor.name;  //key: class name
        if (!(key in Component.#templates)) {
            let tmpl = document.createElement("template");
            if (this.constructor.html) {
                tmpl.innerHTML = this.constructor.html;
            }

            if (this.constructor.stylesheets) {
                for (const stylesheet of this.constructor.stylesheets) {
                    tmpl.innerHTML += `<link href="${stylesheet}" rel="stylesheet">`;
                }
            }

            Component.#templates[key] = tmpl;
        }

        return Component.#templates[key];
    }

    constructor() {
        super();

        //Create shadow root then append it with a copy of the template content
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(this.template.content.cloneNode(true));
    }

    static get observedAttributes() {
        return ["extends-stylesheets"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue) this.renderAttributes();
    }

    renderAttributes() {
        let extendsStylesheets = this.getAttribute("extends-stylesheets");
        if (extendsStylesheets) {
            this.shadowRoot.querySelectorAll(".extends-stylesheet").forEach(element => element.remove());

            this.shadowRoot.append(...JSON.parse(extendsStylesheets).map(value => {
                let link = document.createElement("link");
                link.href = value;
                link.rel = "stylesheet";
                link.classList.add("extends-stylesheet");
                return link;
            }));

            this.removeAttribute("extends-stylesheets");
            return true;
        }
    }
}