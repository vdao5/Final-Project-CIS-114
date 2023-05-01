import NPS from "./nps.mjs";
import Component from "./component.mjs";
import "./nav.mjs";
import "./slideshow.mjs";
import "./disclosure.mjs";

class CPark extends Component {
    static stylesheets = ["/modules/css/park.css"];
    static html = `
    <div class="c-root">
        <div class="park-nav"></div>

        <div class="park-slideshow"></div>

        <div class="park-content"></div>
    </div>
    `;

    constructor() {
        super();
    }

    //connectedCallback is invoked each time the custom element is appended / connected
    async connectedCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const parkCode = urlParams.get("parkCode")

        // getPark check cached data, if (not found) => getPark2 fetch it directly from NPS
        this.parkData = NPS.getPark(parkCode) || await NPS.getPark2(parkCode);
        if (!this.parkData) return;

        const parkNav = this.shadowRoot.querySelector(".park-nav");
        parkNav.addEventListener("c-nav-connected", this.cNavConnected.bind(this));
        parkNav.innerHTML += "<c-nav></c-nav>";

        if (this.parkData.images.length > 0) {
            const parkSlideshow = this.shadowRoot.querySelector(".park-slideshow");
            parkSlideshow.addEventListener("c-slideshow-connected", this.cSlideshowConnected.bind(this));
            parkSlideshow.innerHTML += "<c-slideshow></c-slideshow>";
        }

        const parkContent = this.shadowRoot.querySelector(".park-content");
        parkContent.addEventListener("c-disclosure-connected", this.cDisclosureConnected.bind(this))
        parkContent.innerHTML += `
            <c-disclosure id="description"></c-disclosure>
            <c-disclosure id="information"></c-disclosure>
            <c-disclosure id="maps"></c-disclosure>
        `;
    }

    //build nav
    cNavConnected(evnt) {
        this.nav = evnt.detail;
        this.nav.navLogo.href = this.parkData.url;
        this.nav.navTitle.textContent = this.parkData.name;
        this.nav.navRight.innerHTML = `
            <li class="close-btn active"><a href="../">Back</a></li>
        `;
    }

    //build slideshow
    cSlideshowConnected(evnt) {
        this.slideshow = evnt.detail;
        this.slideshow.setImages(this.parkData.images);
    }

    //build content
    cDisclosureConnected(evnt) {
        const disclosure = evnt.detail;
        const id = disclosure.getAttribute("id");
        const park = this.parkData;

        if (id === "description") {
            this.parkDescription = disclosure;
            disclosure.setAttribute("extends-stylesheets", `["/modules/css/park-disclosure.css"]`);
            disclosure.disclosureDetails.open = true;
            disclosure.disclosureSummary.textContent = park.fullName;
            disclosure.disclosureContent.innerHTML = `
                <h2>${park.designation}</h2>
                <h3><a href="${park.url}">${park.name}</a></h3>
                <h4>${park.states}</h4>
                <p>${park.description}</p>
            `;
        }

        else if (id === "information") {
            this.parkInformation = disclosure;
            disclosure.setAttribute("extends-stylesheets", `["/modules/css/park-disclosure.css"]`);
            disclosure.disclosureDetails.open = true;
            disclosure.disclosureSummary.textContent = "Basic Information";
            disclosure.disclosureContent.innerHTML = "";

            if (park.addresses.length > 0) {
                let addresses = `<h2>Address</h2>`;
                addresses += `<ui>`;
                for (const address of park.addresses) {
                    addresses += `<li>${address.line1}, ${address.city}, ${address.stateCode} ${address.postalCode} (${address.type})</li>`;
                }
                addresses += `</ui>`;
                disclosure.disclosureContent.innerHTML += addresses
            }

            if (park.directionsInfo.length > 0) {
                disclosure.disclosureContent.innerHTML += `
                    <hr>
                    <h2>Directions</h2>
                    <p>${park.directionsInfo}<p>
                `;
                if (park.directionsUrl.length > 0) {
                    disclosure.disclosureContent.innerHTML += `
                        <a href="${park.directionsUrl}" class="btn">Directions Details</a>
                    `;
                }
            }

            if (park.weatherInfo.length > 0) {
                disclosure.disclosureContent.innerHTML += `
                    <hr>
                    <h2>Weather</h2>
                    <p>${park.weatherInfo}<p>
                `;
            }

            if (park.entranceFees.length > 0) {
                disclosure.disclosureContent.innerHTML += `
                    <hr>
                    <h2>Fees</h2>
                `;
                for (const fee of park.entranceFees) {
                    disclosure.disclosureContent.innerHTML += `
                        <h3>${fee.title} - $${fee.cost}</h3>
                        <p>${fee.description}</p>
                    `;
                }
            }
        }

        else if (id === "maps") {
            this.parkMaps = disclosure;
            disclosure.setAttribute("extends-stylesheets", `["/modules/css/park-disclosure.css"]`);
            disclosure.disclosureDetails.open = true;
            disclosure.disclosureSummary.textContent = `Maps`;

            const parkMap = document.createElement("div");
            parkMap.style = "width:100%;height:600px;";

            const position = new google.maps.LatLng(park.latitude, park.longitude);
            const map = new google.maps.Map(parkMap, {
                center: position,
                zoom: 12
            });
            const marker = new google.maps.Marker({
                position: position,
                map: map
            })

            disclosure.disclosureContent.appendChild(parkMap);
        }
    }
}

// define only once !!!
if (!customElements.get("c-park")) {
    customElements.define("c-park", CPark);
}