function dateformate(timestamp) {
      return new Date(timestamp * 1000).toLocaleString();
    }

    async function datafetch() {
      let citynam = document.getElementById("input-val").value;
      let request = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${citynam}&appid=91e1a40ee5e79250da3d8a329b1132cd&units=metric`);
      let data = await request.json();

      // Left div
      $('#cityname').text(data.name);
      $('#temp').text(data.main.temp);
      $('#description').text(data.weather[0].description);

      let properdate = dateformate(data.dt).split(',');
      $('#date1').text(properdate[0]);
      $('#time1').text(properdate[1]);

      // Sunrise & Sunset
      $('#sunrisetime').text(dateformate(data.sys.sunrise).split(',')[1]);
      $('#sunsettime').text(dateformate(data.sys.sunset).split(',')[1]);

      // Right metrics
      $('#humidity').text(data.main.humidity + "%");
      $('#pressure').text(data.main.pressure + " hPa");
      $('#windspeed').text(data.wind.speed + " m/s");
      $('#feelslike').text(data.main.feels_like + "°C");

      // Latitude & longitude
      let lat = data.coord.lat;
      let lon = data.coord.lon;
      fetchAQIdata(lat, lon);
      nextFiveDays(lat, lon);
      todayTemps(lat, lon);
    }

    async function fetchAQIdata(lat, lon) {
      let res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=91e1a40ee5e79250da3d8a329b1132cd`);
      let data = await res.json();
      let list = data.list[0].components;
      $('#covalue').text(list.co);
      $('#so2value').text(list.so2);
      $('#no2value').text(list.no2);
      $('#o3value').text(list.o3);
    }

    async function nextFiveDays(lat, lon) {
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=91e1a40ee5e79250da3d8a329b1132cd&units=metric`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      

      let dailyForecasts = {};
      data.list.forEach(item => {
        let date = item.dt_txt.split(" ")[0];
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            temp: item.main.temp.toFixed(1),
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
          };
        }
      });

      let forecastHtml = "";
      Object.keys(dailyForecasts).slice(0, 5).forEach(date => {
    let f = dailyForecasts[date];
  forecastHtml += `
    <div class="forecast d-flex justify-content-between px-3">
      <h5><i class="fa-solid ${getWeatherIcon(f.icon)} icon"></i> ${f.temp}°C</h5>
      <h5>${f.day}</h5>
      <h6>${date}</h6>
    </div>`;
      });
      

      document.getElementById("forecast").innerHTML = forecastHtml;
    }

    async function todayTemps(lat, lon) {
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=91e1a40ee5e79250da3d8a329b1132cd&units=metric`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      let todayDate = new Date().toISOString().split("T")[0];
      let todayForecasts = data.list.filter(item => item.dt_txt.startsWith(todayDate));
      let selectedHours = todayForecasts.slice(0, 6);

      let todayHtml = "";
      selectedHours.forEach(item => {
        let time = new Date(item.dt_txt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        todayHtml += `
        <div class="timimg">
        <h5>${time}</h5>
        <i class="fa-solid ${getWeatherIcon(item.weather[0].icon)} fs-2 icon"></i>
        <h5>${item.main.temp.toFixed(1)}°C</h5>
        </div>`;
      });

      document.getElementById("todayTempContainer").innerHTML = todayHtml;
    }
    function getWeatherIcon(iconCode) {
  const map = {
    "01d": "fa-sun",       // clear day
    "01n": "fa-moon",      // clear night
    "02d": "fa-cloud-sun", // few clouds day
    "02n": "fa-cloud-moon",
    "03d": "fa-cloud",     // scattered clouds
    "03n": "fa-cloud",
    "04d": "fa-cloud",     // broken clouds
    "04n": "fa-cloud",
    "09d": "fa-cloud-showers-heavy", // shower rain
    "09n": "fa-cloud-showers-heavy",
    "10d": "fa-cloud-sun-rain", // rain
    "10n": "fa-cloud-moon-rain",
    "11d": "fa-bolt",      // thunderstorm
    "11n": "fa-bolt",
    "13d": "fa-snowflake", // snow
    "13n": "fa-snowflake",
    "50d": "fa-smog",      // mist
    "50n": "fa-smog"
  };
  return map[iconCode] || "fa-cloud";
}