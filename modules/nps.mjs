"use strict"

export default class NPS {
	static home = "https://developer.nps.gov/api/v1";
	static key = "f1vYnqlEITiPjY0RWgzSlhjFwoCJfLpazqibkjeF";
	static parks;	//last query parks json data (cache)

	static getJson(url, params) {
		return fetch(`${url}?${new URLSearchParams(params)}&api_key=${NPS.key}`, {
			method: "GET",
			headers: { "Content-Type": "application/json" }
		}).then((response) => response.json())
	}

	static getParks(filter) {
		const url = `${NPS.home}/parks`;
		const nullParks = { total: 0, limit: 10, start: 0, data: [] };

		return NPS.getJson(url, filter)
			.then((parks) => NPS.parks = (parks || nullParks));
	}

	static getPark(parkCode) {
		return NPS.parks?.data?.find((parkData) => parkData.parkCode === parkCode);
	}

	static getPark2(parkCode) {
		const url = `${NPS.home}/parks`;

		return NPS.getJson(url, { parkCode: parkCode })
			.then((parks) => parks?.data?.find((park) => park.parkCode === parkCode));
	}
}
