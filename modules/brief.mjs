"use strict"
import NPS from "./nps.mjs";
import Component from "./component.mjs"
import "./disclosure.mjs";

export default class CBrief extends Component {
    //static stylesheets = [];
    static html = `
    <div class="c-root">
    </div>
    `;

    constructor() {
        super();
    }

    connectedCallback() {
        const cRoot = this.shadowRoot.querySelector(".c-root");
        cRoot.addEventListener("c-disclosure-connected", this.cDisclosureConnected.bind(this));
        cRoot.innerHTML += "<c-disclosure></c-disclosure>";
    }

    cDisclosureConnected(evnt) {
        this.disclosure = evnt.detail;
        this.disclosure.setAttribute("extends-stylesheets", `["/modules/css/brief-disclosure.css"]`);

        const park = NPS.getPark(this.getAttribute("id"));
        if (park) {
            this.disclosure.disclosureSummary.textContent = park.fullName;
            this.disclosure.disclosureContent.innerHTML = `
                <h2>${park.designation}</h2>
                <h3><a href="${park.url}">${park.name}</a></h3>
                <h4>${park.states}</h4>
                <p>${park.description}</p>
                <a href="/park?parkCode=${park.parkCode}" class="btn">READ MORE</a>
                <img lazysrc="${park.images[0].url}" atl="${park.images[0].altText}">
            `;

            //NPS images are big & heavy. So we only load it lazily only when the closure opened 
            const lazyImageHandler = (evnt) => {
                //evnt.target: disclosureSummary -> parentElement: disclosureDetails
                let img = evnt.target.parentElement.querySelector("img");
                let lazysrc = img.getAttribute("lazysrc");
                if (lazysrc) {
                    img.src = lazysrc;

                    img.removeAttribute("lazysrc");
                    evnt.target.removeEventListener('click', lazyImageHandler);
                }
            };
            this.disclosure.disclosureSummary.addEventListener('click', lazyImageHandler);
        }
    }
}

if (!customElements.get("c-brief")) { // define only once !!!
    customElements.define("c-brief", CBrief);
}