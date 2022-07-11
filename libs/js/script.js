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


// ----------------------------- POPULATE COUNTRY LIST -----------------------------
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
    },
    error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    }
});

// ----------------------------- GENERATE POLYGONS -----------------------------
let polygon

$('#countryList').on('change', function(){
    $.ajax({
        url: "libs/php/getPolygon.php?selectedCountry=" + $('#countryList').val(),
        type: "GET",
        dataType: "json",
    
        success: function(result) {
            if(result.status.name == "ok") {
                countryPolygon = result["countryPolygons"];
                geocoding = result['geocoding'];

                if (polygon) {
                    polygon.remove();
                }

                polygon = L.geoJSON(countryPolygon, {
                    style: {color: "rgb(131, 17, 36)", fillColor: "rgba(0, 119, 73, 0.747)"} 
                }).addTo(map);

                mapBounds = L.geoJSON(countryPolygon).getBounds();
                map.fitBounds(mapBounds, {padding: [50,50]});
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
});

// ----------------------------- BUTTONS -----------------------------

// Information Modal
L.easyButton('fa-solid fa-info fa-lg', () => {
    $('#infoModal').modal('show');
}).addTo(map);

// Weather Modal
L.easyButton('fa-solid fa-cloud-sun fa-lg', () => {
    $('#weatherModal').modal('show');
}).addTo(map);

// News Modal
let newsAvailable = false;
L.easyButton('fa-solid fa-newspaper fa-lg', () => {
    if (newsAvailable) {
        $('#newsModal').modal('show');
    } else {
        $('#newsErrorModal').modal('show');
    }
}).addTo(map);

// Covid-19 Data Modal
L.easyButton('fa-solid fa-bacterium fa-lg', () => {
    $('#').modal('show');
}).addTo(map);

// Currency Info & Conversion Modal
L.easyButton('fa-solid fa-money-bill fa-lg', () => {
    $('#').modal('show');
}).addTo(map);

// Image Gallery
L.easyButton('fa-solid fa-images fa-lg', () => {
    $('#').modal('show');
}).addTo(map);


// ----------------------------- MODALS -----------------------------

// Get Country Information
$('#countryList').on('change', () => {
    $.ajax({
        url: 'libs/php/getCountryInfo.php',
        type: 'GET',
        data: {
            iso2: $('#countryList').val()
        },
        dataType: 'json',
        success: (result) => {

            let info = result['data'][0];
            console.log(info);

            if (result.status.name == 'ok') {

                // Update Modal Titles
                $('#infoModalLabel').html(info['name']['common']);
                $('#weatherModalLabel').html(info['name']['common']);
                $('#newsModalLabel').html(info['name']['common']);
                $('#newsErrorModalLabel').html(info['name']['common']);


                // Update Information Modal
                $('#countryOfficialName').html(info['name']['official']);
                $('#countryPopulation').html(info['population']);
                $('#countryArea').html(info['area'] + 'km<sup>2</sup>');
                $('#countryCapital').html(info['capital']);
                $('#countryDrivingSide').html(info['car']['side']);
                $('#countryRegion').html(info['subregion']);
                $('#countryContinent').html(info['continents']);

                let rawLanguages = info['languages'];
                const languageProperties = Object.getOwnPropertyNames(rawLanguages);
                let languages = [];
                for (let i = 0; i < languageProperties.length; i++) {
                    languages += `${info['languages'][Object.keys(info['languages'])[i]]} <br>`
                    $('#countryLanguages').html(languages);
                }
            }
            
        }
    })
})

// Get News
$('#countryList').on('change', function(){
    $.ajax({
        url: "libs/php/getNews.php",
        type: "POST",
        dataType: "json",
        data: {
            iso2: $('#countryList').val()
        },
        success: function(result){
            if(result.status.name == "ok") {

                let news = result['data']['data'];
                console.log(news);

                // $('#flagDivNews').removeClass()
                // $('#flagDivNews').addClass('fflag ff-xl ff-sphere')
                // $('#flagDivNews').addClass(`fflag-${countriesInfo['0']['countryCode']}`)
                // $('#newsModalLabel').html(countriesInfo['0']['countryName'])
                // $('#flagDivNewsError').removeClass()
                // $('#flagDivNewsError').addClass('fflag ff-xl ff-sphere')
                // $('#flagDivNewsError').addClass(`fflag-${countriesInfo['0']['countryCode']}`)
                // $('#newsErrorModalLabel').html(countriesInfo['0']['countryName'])
                
                if (news[0]) {
                    newsAvailable = true;
                    // Top Headline
                    $('#newsLink1').attr('href', `${news['0']['url']}`);
                    $('#newsTitle1').html(news['0']['title']);
                    if (news[0]['image']) {
                        $('#newsImg1').attr('src', `${news['0']['image']}`);
                    } else {
                        $('#newsImg1').attr('src', 'libs/css/images/breaking-news-64.png');
                    }
                    $('#newsSrc1').html(news['0']['source']);

                    // Headline 2
                    $('#newsLink2').attr('href', `${news['1']['url']}`);
                    $('#newsTitle2').html(news['1']['title']);
                    if (news[0]['image']) {
                        $('#newsImg2').attr('src', `${news['1']['image']}`);
                    } else {
                        $('#newsImg2').attr('src', 'libs/css/images/news-64.png');
                    }
                    $('#newsSrc2').html(news['1']['source']);

                    // // Headline 3
                    $('#newsLink3').attr('href', `${news['2']['url']}`);
                    $('#newsTitle3').html(news['2']['title']);
                    if (news[0]['image']) {
                        $('#newsImg3').attr('src', `${news['2']['image']}`);
                    } else {
                        $('#newsImg3').attr('src', 'libs/css/images/news-64.png');
                    }
                    $('#newsSrc3').html(news['2']['source']);
                } else {
                    newsAvailable = false;
                }

            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }
    })
})