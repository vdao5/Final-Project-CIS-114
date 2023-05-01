"use strict"

import Component from "./component.mjs";
import NPS from "./nps.mjs";
import "./brief.mjs";
import "./nav.mjs";

const states = { "": "", AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CZ: "Canal Zone", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", GU: "Guam", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", PR: "Puerto Rico", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VI: "Virgin Islands", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming" };

class CParks extends Component {
    static stylesheets = ["/modules/css/parks.css"];
    static html = `
    <div class="c-root">
        <div class="parks-nav">
        </div>

        <div class="parks-list">
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
            <ul class="briefs-list">
            </ul>
        </div>
    </div>
    `;

    //Save filter data in sessionStorage. It wont be lost after reloading / switching (parks <-> park)
    //filter getter: get data from sessionStorage as a json string, then convert it to an object
    get filter() {
        const sessionData = sessionStorage.getItem("filter");
        if (!sessionData) {
            const defaultFilter = { limit: "10" };
            this.filter = defaultFilter;
            return defaultFilter;
        }

        return JSON.parse(sessionData);
    }
    //filter setter: object -> json string
    set filter(newValue) {
        sessionStorage.setItem("filter", JSON.stringify(newValue));
    }

    constructor() {
        super();
    }

    //connectedCallback is invoked each time the custom element is appended / connected
    connectedCallback() {
        this.ldsRing = this.shadowRoot.querySelector(".lds-ring");
        this.briefsList = this.shadowRoot.querySelector(".briefs-list");

        //wait for c-nav dispatch "connected" to continue
        const parksNav = this.shadowRoot.querySelector(".parks-nav");
        parksNav.addEventListener("c-nav-connected", this.cNavConnected.bind(this));
        parksNav.innerHTML += "<c-nav></c-nav>";

    }

    //cNavConnected is invoked each time the c-nav is appended / connected
    cNavConnected(evnt) {
        this.nav = evnt.detail;
        this.nav.setAttribute("extends-stylesheets", `["/modules/css/parks-nav.css"]`);
        this.nav.navTitle.textContent = "National Parks"
        this.nav.navCenter.innerHTML = `
            <div class="filter-dropdown" style="margin-top: 43px;">
                <form class="filter-form">
                    <input name="q" type="search" placeholder="Search.." class="search-input">

                    State:
                    <select name="stateCode" class="states-select">
                    </select>

                    Limit:
                    <select name="limit" class="limit-select">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>

                    <button type="submit" class="btn filter-submit">Apply</button>
                </form>
            </div>
            <li class="active filter-btn">Filter</li>

            <li class="page-back"><</li>
            <li class="page-next">></li>

            <li>
                <span>Page:</span>
                <select class="page-select"></select>
            </li>
        `;

        this.filterBtn = this.nav.navCenter.querySelector(".filter-btn");
        this.filterForm = this.nav.navCenter.querySelector(".filter-form");
        this.filterDropdown = this.nav.navCenter.querySelector(".filter-dropdown");
        this.filterSubmit = this.nav.navCenter.querySelector(".filter-submit");
        this.searchInput = this.nav.navCenter.querySelector(".search-input");
        this.stateSelect = this.nav.navCenter.querySelector(".states-select");
        this.limitSelect = this.nav.navCenter.querySelector(".limit-select");
        this.pageSelect = this.nav.navCenter.querySelector(".page-select");
        this.pageBack = this.nav.navCenter.querySelector(".page-back");
        this.pageNext = this.nav.navCenter.querySelector(".page-next");

        // Filter Button Toggle
        this.filterBtn.addEventListener("click", (evnt) => {
            this.filterDropdown.classList.toggle("show");
        });

        // Filter > States Select Options
        for (const value in states) {
            let option = document.createElement("option");
            option.value = value;
            option.textContent = states[value];
            this.stateSelect.appendChild(option);
        }

        // Filter > Submit Button
        this.filterForm.addEventListener("submit", (evnt) => {
            evnt.preventDefault();

            this.filterDropdown.classList.toggle("show");
            let filter = {};
            new FormData(evnt.target).forEach((value, key) => {
                if (value.trim().length > 0) {
                    filter[key] = value;
                }
            });
            this.filter = filter;

            this.updateParksList();
        });

        // Page Select Change Event
        this.pageSelect.addEventListener("change", () => {
            const page = Number(this.pageSelect.value);

            const filter = this.filter;
            filter.start = (page - 1) * NPS.parks.limit;
            this.filter = filter;

            this.updateParksList();
        });

        // Page Back Button Click Event
        this.pageBack.addEventListener("click", (evnt) => {
            if (evnt.target.classList.contains("active")) {
                const page = Number(this.pageSelect.value) - 1;
                this.pageSelect.value = page;

                const filter = this.filter;
                filter.start = (page - 1) * NPS.parks.limit;
                this.filter = filter;

                this.updateParksList();
            }
        });

        // Page Next Button Click Event
        this.pageNext.addEventListener("click", (evnt) => {
            if (evnt.target.classList.contains("active")) {
                const page = Number(this.pageSelect.value) + 1;
                this.pageSelect.value = page;

                const filter = this.filter;
                filter.start = (page - 1) * NPS.parks.limit;
                this.filter = filter;

                this.updateParksList();
            }
        });

        this.updateParksList();
    }

    // clear the page before getting new parks list data
    clearPage() {
        this.pageBack.classList.remove("active");
        this.pageNext.classList.remove("active");
        while (this.pageSelect.firstChild) {
            this.pageSelect.removeChild(this.pageSelect.lastChild);
        }

        while (this.briefsList.firstChild) {
            this.briefsList.removeChild(this.briefsList.lastChild);
        }
    }

    // display / hide loading ring
    showLoading(flag = true) {
        this.ldsRing.style.display = (flag ? "block" : "none");
    }

    // fetch parks data from NPS using filter data
    updateParksList() {
        this.showLoading();
        this.clearPage();

        NPS.getParks(this.filter)
            .then((_) => {
                //append() a list is better than appendChild() * n-times
                const briefs = NPS.parks.data.map((parkData) => {
                    let brief = document.createElement("li");
                    brief.innerHTML = `<c-brief id="${parkData.parkCode}"/>`;

                    return brief;
                });
                this.briefsList.append(...briefs);

                this.updateFilterForm();
                this.updatePage();
                this.showLoading(false)
            })
            .catch(console.error)
    }

    //update input values of the filter-form
    updateFilterForm() {
        const filter = this.filter;
        if (filter.q) this.searchInput.value = filter.q;
        if (filter.stateCode) this.stateSelect.value = filter.stateCode;
        if (filter.limit) this.limitSelect.value = filter.limit;
    }

    // update pages select options & buttons 
    updatePage() {
        const pageCurrent = Math.floor(NPS.parks.start / NPS.parks.limit) + 1;
        const pagesTotal = Math.ceil(NPS.parks.total / NPS.parks.limit);

        //append() a list is better than appendChild() * n-times
        const pages = [...Array(pagesTotal)].map((_, index) => {
            let option = document.createElement("option");

            option.textContent = index + 1;
            option.value = index + 1;

            return option;
        });
        this.pageSelect.append(...pages);

        this.pageSelect.value = pageCurrent;
        if (pageCurrent > 1) this.pageBack.classList.add("active");
        if (pageCurrent < pagesTotal) this.pageNext.classList.add("active");
    }
}

// define only once !!!
if (!customElements.get("c-parks")) {
    customElements.define("c-parks", CParks);
}