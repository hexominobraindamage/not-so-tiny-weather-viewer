const apiKey = "c4f58d4cdd136760eb52085ad054767f"; //just because i already have one
const locationFetch = document.querySelector(".get-location-auto");
const searchQuery = new URLSearchParams(location.search);
const query = searchQuery.get("q")?.trim();

const locationInput = document.querySelector("[get-location]");
const locationButton = document.querySelector("#searchBtn");
const refreshButton = document.querySelector(".refresh");
const saveButton = document.querySelector("[save-location]");
const clearButton = document.querySelector("[clear-location]");
const reloadButton = document.querySelector("[get-saved-location]");

let lat, lon; // Declare global variables for latitude and longitude

let statecode = ""; // Declare statecode variable
let countrycode = ""; // Declare countrycode variable

document.addEventListener("DOMContentLoaded", () => {
  loadData();
});
// Call loadData on page load to check for saved data
locationInput.addEventListener("input", (e) => {
  const cityname = e.target.value.trim().toLowerCase();
  locationInput.value = cityname;
});
locationButton.addEventListener("click", () => {
  document.querySelector(".crystalize").classList.remove("hide");
  const cityname = locationInput.value.trim().toLowerCase();
  latlongFetch(cityname, statecode, countrycode).then(() => {
    getWeather(lat, lon); // Call getWeather only after latlongFetch resolves
    getForecast(lat, lon);
  });
});

refreshButton.addEventListener("click", () => {
  document.querySelector(".crystalize").classList.remove("hide");
  locationInput.value = "";
  document.querySelector(".electro-charged").classList.add("hide");
  document.querySelector(".crystalize").classList.add("hide");
  document.querySelector(".refresh").classList.remove("hide");
  getWeather(lat, lon); // Call getWeather with the last known lat/lon, if there is none then we just hide this button altogether
  getForecast(lat, lon); 
});

reloadButton.addEventListener("click", () => {
  document.querySelector(".crystalize").classList.remove("hide");
  const savedLocationName = localStorage.getItem("locationName");
  const savedLatLong = localStorage.getItem("latlong");

  if (savedLocationName && savedLatLong) {
    const [savedLat, savedLon] = savedLatLong.split(",");
    lat = parseFloat(savedLat); // Ensure lat and lon are numbers
    lon = parseFloat(savedLon);
    getWeather(lat, lon);
    getForecast(lat, lon);
  } else {
document.querySelector("[get-saved-location]").classList.add("hide");
    document.querySelector(".crystalize").classList.add("hide");
  }
}
);

locationFetch.addEventListener("click", () => {
  document.querySelector(".crystalize").classList.remove("hide");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      lat = position.coords.latitude; // Assign values to global variables
      lon = position.coords.longitude;
      console.log(lat, lon); // logged just in case something is off

      getWeather(lat, lon);
      getForecast(lat, lon);
    },
    (error) => {
      console.error("Error getting location:", error.message);
      document.querySelector(".crystalize").classList.add("hide");
      alert(
        "Unable to fetch location. PLease make sure you gave access to geolocation."
      );
    }
  );
});

saveButton.addEventListener("click", () => {
  saveData();
});

clearButton.addEventListener("click", () => {
  clearSave();
});

async function latlongFetch(cityname, statecode, countrycode) {
  const stateParam = statecode ? `,${statecode}` : "";
  const countryParam = countrycode ? `,${countrycode}` : "";
  document.querySelector(".crystalize").classList.remove("hide");
  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cityname}${stateParam}${countryParam}&limit=5&appid=${apiKey}`
    );
    const latlong = await response.json();
    if (latlong.length > 0) {
      lat = latlong[0].lat;
      lon = latlong[0].lon;
      console.log(`${lat} ${lon}`);
    } else {
      console.error("No results found for the provided city name.");
      alert("No results found for the provided city name. Please try again.");
      document.querySelector(".crystalize").classList.add("hide");
    }
  } catch (error) {
    console.error("Error fetching latitude and longitude:", error);
    alert("Error fetching location data. Please try again later.");
    document.querySelector(".crystalize").classList.add("hide");
  }
}

function getWeather(lat, lon) {
    document.querySelector(".weatherforecast").innerHTML = ""; // Clear previous forecast data
  document.querySelector(".crystalize").classList.remove("hide");
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.cod !== 200) {
        document.querySelector(".electro-charged").classList.remove("hide");
      }
      const weather = data.weather[0].description;
      const weatherIcon = data.weather[0].icon; // Weather icon code, will convert to actual icons
      document.querySelector(
        ".icon"
      ).src = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
      //either openweatherAPI is drunk or there is something wrong on my end, no way the temperatures are all the same
      const location = data.name;
      const temp = Math.round(data.main.temp);
      const tempmax = Math.round(data.main.temp_max);
      const tempmin = Math.round(data.main.temp_min);
      const realfeel = Math.round(data.main.feels_like);
      console.log();
      document.querySelector(".electro-charged").classList.remove("hide");
      document.querySelector("#locationName").textContent = location;
      document.querySelector("#condition").textContent = weather;
      document.querySelector("#temperature").textContent = `${temp}°C`; //because fuck imperial
      document.querySelector("#tempmaxmin").textContent =
        `${tempmax}°C` + " / " + `${tempmin}°C`;
      document.querySelector("#feelslike").textContent =
        "RealFeel: " + `${realfeel}°C`;
      document.querySelector(".crystalize").classList.add("hide");
      document.querySelector(".refresh").classList.remove("hide");
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      document.querySelector(".crystalize").classList.add("hide");
      document.querySelector(".electro-charged").classList.remove("hide");
      document.querySelector(".refresh").classList.remove("hide");
    });
}

if (!locationInput.value.trim()) {
  document.querySelector(".electro-charged").classList.add("hide");
  document.querySelector(".crystalize").classList.add("hide");
  document.querySelector(".refresh").classList.add("hide");
} else {
  document.querySelector(".refresh").classList.remove("hide");
}

function getForecast(lat, lon) {
  document.querySelector(".weatherforecast").innerHTML = ""; // Clear previous forecast data
  document.querySelector(".crystalize").classList.remove("hide");
  fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely,alerts&appid=${apiKey}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.cod !== 200) {
        document.querySelector(".electro-charged").classList.remove("hide");
      }
      data.daily.forEach((daily) => {
        const weather = daily.weather[0].description;
        const weatherIcon = daily.weather[0].icon;
        const dateOfWeek = new Date(daily.dt * 1000).toLocaleDateString(
          "en-US",
          {
            weekday: "long",
          }
        );
        const day = new Date(daily.dt * 1000).getDate();
        const month = new Date(daily.dt * 1000).toLocaleString("default", {
          month: "long",
        });
        const tempmax = Math.round(daily.temp.max);
        const tempmin = Math.round(daily.temp.min);
        console.log();

        // Append forecast details
        document.querySelector(".weatherforecast").innerHTML += `
    <div class="details">
      <h2>${dateOfWeek}</h2>
      <p>${day} ${month}<p>
      <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weather}">
      <h3>${weather}</h3>
      <h4>${tempmax}°C</h4>
      <h4>${tempmin}°C</h4>
    </div>
  `;
      });

      document.querySelector(".crystalize").classList.add("hide");
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      document.querySelector(".crystalize").classList.add("hide");
      document.querySelector(".electro-charged").classList.remove("hide");
      document.querySelector(".refresh").classList.remove("hide");
    });
    if (!localStorage.getItem("locationName") && !localStorage.getItem("latlong")) {
      clearButton.classList.add("hide");
    }
    else {
      clearButton.classList.remove("hide");
    }    
}

function getRealTimeWeather(){
  document.querySelector(".realtime").innerHTML = ""; // Clear previous MinuteCast data
  document.querySelector(".crystalize").classList.remove("hide");
  fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,current,,alerts&appid=${apiKey}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.cod !== 200) {
        document.querySelector(".electro-charged").classList.remove("hide");
      }
    })
    .catch((error) => {
      console.error("Error fetching real-time weather data:", error);
      document.querySelector(".crystalize").classList.add("hide");
    });
}



function saveData(){
const locationName = document.querySelector("#locationName").textContent;
const latlong = `${lat},${lon}`;
localStorage.setItem("locationName", locationName);
localStorage.setItem("latlong", latlong);
alert("Location saved successfully!");
document.querySelector("[clear-location]").classList.remove("hide"); // Show the refresh button after saving
document.querySelector("[get-saved-location]").classList.remove("hide");
}

function loadData() {
  const locationName = localStorage.getItem("locationName");
  const latlong = localStorage.getItem("latlong");

  if (locationName && latlong) {
    document.querySelector("#locationName").textContent = locationName;
    const [savedLat, savedLon] = latlong.split(",");
    lat = parseFloat(savedLat); // Ensure lat and lon are numbers
    lon = parseFloat(savedLon);
    getWeather(lat, lon);
    getForecast(lat, lon);
  }
  if (!localStorage.getItem("locationName") && !localStorage.getItem("latlong")) {
    clearButton.classList.add("hide");
  }
  else {
    clearButton.classList.remove("hide");
  }    
}// Call loadData on page load to check for saved data

function clearSave(){
  localStorage.removeItem("locationName");
  localStorage.removeItem("latlong");
  locationInput.value = ""; // Clear the input field
  document.querySelector(".refresh").classList.remove("hide"); // Hide the refresh button

    clearButton.classList.add("hide");
    document.querySelector("[get-saved-location]").classList.add("hide");
    alert("Location cleared successfully!");
  }    


