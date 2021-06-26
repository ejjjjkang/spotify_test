var thumbsize = 14;

function initialize() {
	const form = document.getElementById("form");
	form.addEventListener("submit", searchSpotify);
}

function getHashParams() {
	var hashParams = {};
	var e,
		r = /([^&;=]+)=?([^&;]*)/g,
		q = window.location.hash.substring(1);
	while ((e = r.exec(q))) {
		hashParams[e[1]] = decodeURIComponent(e[2]);
	}
	return hashParams;
}

var params = getHashParams();

var access_token = params.access_token,
	refresh_token = params.refresh_token,
	error = params.error;

var artist_name;

const searchSpotify = async (event) => {
	var inputData = document.getElementById("artist").value;

	if (inputData) {
		event.preventDefault();
		await axios
			.get(
				"https://api.spotify.com/v1/search?",

				{
					params: {
						q: inputData,
						type: "artist",
					},
					headers: {
						Authorization: "Bearer " + access_token,
					},
					json: true,
				},
			)
			.then((response) => {
				if (response.data.artists.items) {
					console.log(response.data.artists);
					document.getElementById("result").innerHTML +=
						response.data.artists.items;
					artist_name = response.data.artists.items[0];
				} else {
					document.getElementById("result").innerHTML += "There is no result";
				}
			})
			.catch((error) => {
				console.log(error.response);
			});
	}
};

const recommendValue = async () => {
	if (artist_name) {
		await axios
			.get(
				"https://api.spotify.com/v1/recommendations?" +
					"seed_artists=" +
					encodeURIComponent(artist_name.id) +
					"&min_dancability=" +
					encodeURIComponent(10) +
					"&max_danceability=" +
					encodeURIComponent(20),
				{
					headers: {
						Authorization: "Bearer " + access_token,
					},
				},
			)
			.then((response) => {
				for (let i = 0; i < response.data.tracks.length; i++) {
					document.getElementById(
						"recommendation",
					).innerHTML += `<img src="${response.data.tracks[i].album.images[0].url}" width="220" height="220">`;
				}
			})
			.catch((error) => {
				console.log(error.response);
			});
	}
};

if (access_token) {
	var id;
	axios({
		method: "GET",
		url: "https://api.spotify.com/v1/me",
		headers: {
			Authorization: "Bearer " + access_token,
		},
		json: true,
	}).then((res) => {
		id = res.data.id;
		document.getElementsByClassName("loggedin")[0].style.visibility = "visible";
		document.getElementsByClassName("login")[0].style.visibility = "hidden";

		document.getElementById("myName").innerHTML = res.data.display_name;
		document.getElementById("product").innerHTML = res.data.product;
		initialize();

		//test
		document.getElementById(
			"recommendation",
		).innerHTML += `<button onclick="recommendValue()">Show recommended music list</button>`;
	});
}

function draw(slider, splitvalue) {
	/* set function vars */
	var min = slider.querySelector(".min");
	var max = slider.querySelector(".max");
	var lower = slider.querySelector(".lower");
	var upper = slider.querySelector(".upper");
	var legend = slider.querySelector(".legend");
	var thumbsize = parseInt(slider.getAttribute("data-thumbsize"));
	var rangewidth = parseInt(slider.getAttribute("data-rangewidth"));
	var rangemin = parseInt(slider.getAttribute("data-rangemin"));
	var rangemax = parseInt(slider.getAttribute("data-rangemax"));

	/* set min and max attributes */
	min.setAttribute("max", splitvalue);
	max.setAttribute("min", splitvalue);

	/* set css */
	min.style.width =
		parseInt(
			thumbsize +
				((splitvalue - rangemin) / (rangemax - rangemin)) *
					(rangewidth - 2 * thumbsize),
		) + "px";
	max.style.width =
		parseInt(
			thumbsize +
				((rangemax - splitvalue) / (rangemax - rangemin)) *
					(rangewidth - 2 * thumbsize),
		) + "px";
	min.style.left = "0px";
	max.style.left = parseInt(min.style.width) + "px";
	min.style.top = lower.offsetHeight + "px";
	max.style.top = lower.offsetHeight + "px";
	legend.style.marginTop = min.offsetHeight + "px";
	slider.style.height =
		lower.offsetHeight + min.offsetHeight + legend.offsetHeight + "px";

	/* correct for 1 off at the end */
	if (max.value > rangemax - 1) max.setAttribute("data-value", rangemax);

	/* write value and labels */
	max.value = max.getAttribute("data-value");
	min.value = min.getAttribute("data-value");
	lower.innerHTML = min.getAttribute("data-value");
	upper.innerHTML = max.getAttribute("data-value");
}

function init(slider) {
	/* set function vars */
	var min = slider.querySelector(".min");
	var max = slider.querySelector(".max");
	var rangemin = parseInt(min.getAttribute("min"));
	var rangemax = parseInt(max.getAttribute("max"));
	var avgvalue = (rangemin + rangemax) / 2;
	var legendnum = slider.getAttribute("data-legendnum");

	/* set data-values */
	min.setAttribute("data-value", rangemin);
	max.setAttribute("data-value", rangemax);

	/* set data vars */
	slider.setAttribute("data-rangemin", rangemin);
	slider.setAttribute("data-rangemax", rangemax);
	slider.setAttribute("data-thumbsize", thumbsize);
	slider.setAttribute("data-rangewidth", slider.offsetWidth);

	/* write labels */
	var lower = document.createElement("span");
	var upper = document.createElement("span");
	lower.classList.add("lower", "value");
	upper.classList.add("upper", "value");
	lower.appendChild(document.createTextNode(rangemin));
	upper.appendChild(document.createTextNode(rangemax));
	slider.insertBefore(lower, min.previousElementSibling);
	slider.insertBefore(upper, min.previousElementSibling);

	/* write legend */
	var legend = document.createElement("div");
	legend.classList.add("legend");
	var legendvalues = [];
	for (var i = 0; i < legendnum; i++) {
		legendvalues[i] = document.createElement("div");
		var val = Math.round(
			rangemin + (i / (legendnum - 1)) * (rangemax - rangemin),
		);
		legendvalues[i].appendChild(document.createTextNode(val));
		legend.appendChild(legendvalues[i]);
	}
	slider.appendChild(legend);

	/* draw */
	draw(slider, avgvalue);

	/* events */
	min.addEventListener("input", function () {
		update(min);
	});
	max.addEventListener("input", function () {
		update(max);
	});
}

function update(el) {
	/* set function vars */
	var slider = el.parentElement;
	var min = slider.querySelector("#min");
	var max = slider.querySelector("#max");
	var minvalue = Math.floor(min.value);
	var maxvalue = Math.floor(max.value);

	/* set inactive values before draw */
	min.setAttribute("data-value", minvalue);
	max.setAttribute("data-value", maxvalue);

	var avgvalue = (minvalue + maxvalue) / 2;

	/* draw */
	draw(slider, avgvalue);
}

var sliders = document.querySelectorAll(".min-max-slider");
sliders.forEach(function (slider) {
	init(slider);
});
