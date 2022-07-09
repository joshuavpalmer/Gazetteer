// ------------------------- Maps -------------------------

const map = L.map('map').setView([51, 0], 3);

// Default Map
const defaultMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    minZoom: 0,
    maxZoom: 19
}).addTo(map);

// Additional Maps
let googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

let = googleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

let = googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
  maxZoom: 20,
  subdomains:['mt0','mt1','mt2','mt3']
});


// Map Overlays
let openWeatherKey = 'ef9588ca9e9304c2ed5bdd78701b4d9e';
let temperatureLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`);
let windSpeedLayer = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`);
let cloudsLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`);
let pressureLayer = L.tileLayer(`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`);
let precipitationLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`);

let mapTileLayers = {
    "Default Map": defaultMap,
    "Streets": googleStreets,
    "Satellite": googleSatellite,
    "Terrain": googleTerrain,
}

let overlays = {
    "Temperature": temperatureLayer,
    "Wind Speed": windSpeedLayer,
    "Clouds": cloudsLayer,
    "Atmospheric Pressure": pressureLayer,
    "Precipitation": precipitationLayer,
}

L.control.layers(mapTileLayers, overlays).addTo(map);
L.control.scale().addTo(map);