// ----------------------------- MAPS -----------------------------
const map = L.map('map').setView([51.505, -0.09], 5);

// Default Map
const defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Alternative Base Maps
let streetsMap = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains:['mt0','mt1','mt2','mt3']
});

let satelliteMap = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains:['mt0','mt1','mt2','mt3']
});

let terrainMap = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
  maxZoom: 19,
  subdomains:['mt0','mt1','mt2','mt3']
});

let alternativeMaps = {
    "Default Map": defaultMap,
    "Google Street Map": streetsMap,
    "Google Satellite": satelliteMap,
    "Google Terrain": terrainMap
};

// Map Overlays
let openWeatherKey = 'ef9588ca9e9304c2ed5bdd78701b4d9e';
let cloudsLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`);
let temperatureLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`);
let windSpeedLayer = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`);
let precipitationLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`);
let pressureLayer = L.tileLayer(`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`);

let overlayMaps = {
    "Clouds": cloudsLayer,
    "Temperature": temperatureLayer,
    "Wind Speed": windSpeedLayer,
    "Precipitation": precipitationLayer,
    "Atmospheric Pressure": pressureLayer
};

// Layers Control
L.control.layers(alternativeMaps, overlayMaps).addTo(map);
L.control.scale().addTo(map);


// Populate Country List in Select Bar
$.ajax({
    type: 'GET',
    url: 'libs/php/getCountryList.php',
    data: {},
    dataType: 'json',
    success: (result) => {

        console.log(result);

        if (result.status.name = 'ok') {
            countryList = result['countryList'];

            countryList.forEach((country) => {
                let option = document.createElement("option");
                option.classList.add("option");
                option.value = country['code'];
                option.text = country['name'];
                $('#countryList').append(option);
            });
        }

    }
});

// Generate Polygons for Country Borders
let polygon
$('#countryList').on('change', function(){
    $.ajax({
        url: "libs/php/getPolygon.php?selectedCountry=" + $('#countryList').val(),
        type: "GET",
        dataType: "json",
    
        success: function(result){
            console.log(result)
            if(result.status.name == "ok") {
                countryPolygon = result["countryPolygons"]
                geocoding = result['geocoding']

                if(polygon){
                    polygon.remove()
                }

                polygon = L.geoJSON(countryPolygon, {
                    style: {color: "rgb(245, 49, 49)", fillColor: "rgba(0, 119, 73, 0.747)"} 
                }).addTo(map)

                mapBounds = L.geoJSON(countryPolygon).getBounds()
                map.fitBounds(mapBounds, {padding: [50,50]})
            }
        }
    })
})