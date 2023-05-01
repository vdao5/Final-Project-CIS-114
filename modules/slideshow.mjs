"use strict"

import Component from "./component.mjs"

class CSlideshow extends Component {
    static stylesheets = ["/modules/css/slideshow.css"];
    static html = `
    <div class="c-root">
        <div class="slideshow">
            <img class="slide">

            <div class="caption">
            </div>

            <div class="indicators-bar">
            </div>
        </div>
    </div>
    `;

    constructor() {
        super();
    }

    connectedCallback() {
        this.slide = this.shadowRoot.querySelector(".slide");
        this.slide.onload = () => { this.slide.isLoaded = true; }
        this.slide.onerror = () => { this.slide.isLoaded = true; }

        this.caption = this.shadowRoot.querySelector(".caption");
        this.indicatorsBar = this.shadowRoot.querySelector(".indicators-bar");

        const event = new CustomEvent("c-slideshow-connected", { detail: this });
        this.parentElement.dispatchEvent(event);
    }

    clearImages() {
        clearInterval(this.slide.interval);
        this.slide.src = "";
        this.slide.alt = "";
        this.caption.textContent = "";
        this.indicators = [];
        while (this.indicatorsBar.firstChild) {
            this.indicatorsBar.removeChild(this.indicatorsBar.lastChild);
        }
    }

    setImages(images) {
        const slideInterval = () => {
            //wait for the current image completely loaded or throw not able to load error
            if (this.slide.isLoaded) {
                this.current = (this.current + 1) % this.indicators.length;
                this.updateSlide();
            }
        };
        const indicatorClick = (evnt) => {
            clearInterval(this.slide.interval);
            this.current = evnt.target.idx;
            this.updateSlide();
            this.slide.interval = setInterval(slideInterval, 5000);
        };

        this.clearImages();

        if (images.length > 0) {
            this.indicators = images.map((image, index) => {
                let indicator = document.createElement("span");
                indicator.classList.add("indicator");
                indicator.img = image;
                indicator.idx = index;
                indicator.addEventListener("click", indicatorClick);

                return indicator;
            });
            this.indicatorsBar.append(...this.indicators);
            this.current = 0;
            this.updateSlide();

            this.slide.interval = setInterval(slideInterval, 5000);
        }
    }

    updateSlide() {
        if (this.current < 0 || this.current >= this.indicators.length) return;

        this.indicators.forEach(indicator => {
            if (indicator.idx != this.current) {
                indicator.classList.remove("active");
            }
            else {
                indicator.classList.add("active");
                this.slide.isLoaded = false;
                this.slide.src = indicator.img.url;
                this.slide.alt = indicator.img.alt;
                this.caption.textContent = indicator.img.caption;
            }
        });
    }
}

// define only once !!!
if (!customElements.get("c-slideshow")) {
    customElements.define("c-slideshow", CSlideshow);
}