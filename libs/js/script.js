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
    $('#covidInfoModal').modal('show');
}).addTo(map);

// Currency Info & Conversion Modal
L.easyButton('fa-solid fa-money-bill fa-lg', () => {
    $('#currencyModal').modal('show');
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
            console.log(info)

            let capitalLatitude = info['capitalInfo']['latlng'][0];
            let capitalLongitude = info['capitalInfo']['latlng'][1];
            console.log(capitalLatitude);
            console.log(capitalLongitude);

            // Call Weather here to access lat/lng variables -> Perhaps look into promises/async/await solution later.
            getWeather(capitalLatitude, capitalLongitude);
            
            // Get Currency Code + Exchange Rates
            let country = info['cca2'];
            let currenciesInfo = info['currencies'];
            let currencySymbol = Object.values(currenciesInfo)[0]['symbol'];
            $('.currencySymbol').html(currencySymbol);
            getCurrencyCode(country);


            if (result.status.name == 'ok') {

                // Update Modal Titles
                $('#infoModalLabel').html(info['name']['common']);
                $('#weatherModalLabel').html(info['name']['common']);
                $('#newsModalLabel').html(info['name']['common']);
                $('#newsErrorModalLabel').html(info['name']['common']);
                $('#covidModalLabel').html(info['name']['common']);
                $('#currencyModalLabel').html(info['name']['common']);

                $('.flag').attr('src', info['flags']['png']);


                // Update Information Modal
                $('#countryOfficialName').html(info['name']['official']);
                $('#countryPopulation').html(commaSeparateNumber(info['population']));
                $('#countryArea').html(commaSeparateNumber(info['area'] + ' km<sup>2</sup>'));
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
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    })
})

// Get Weather
const getWeather = (lat, lng) => {
    $.ajax({
        url: 'libs/php/getWeather.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat,
            lng
        },
        success: (result) => {
            if (result.status.name == 'ok') {
                let weather = result.data;
                console.log(weather);
                $('#overview').attr('src', weather['current']['condition']['icon']);
                $('#temperature').html(weather['current']['temp_c'] + ' &#8451');
                $('#localTime').html(weather['location']['localtime']);
                $('#sunrise').html(weather['forecast']['forecastday'][0]['astro']['sunrise']);
                $('#sunset').html(weather['forecast']['forecastday'][0]['astro']['sunset']);
                $('#windSpeed').html(weather['current']['wind_mph'] + ' mph');
                $('#precipitation').html(weather['current']['precip_in'] + ' "');
                $('#humidity').html(weather['current']['humidity'] + ' %');

            }
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
};

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
                    if (news[1]['image']) {
                        $('#newsImg2').attr('src', `${news['1']['image']}`);
                    } else {
                        $('#newsImg2').attr('src', 'libs/css/images/news-64.png');
                    }
                    $('#newsSrc2').html(news['1']['source']);

                    // // Headline 3
                    $('#newsLink3').attr('href', `${news['2']['url']}`);
                    $('#newsTitle3').html(news['2']['title']);
                    if (news[2]['image']) {
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

// Get Covid-19 Data
$('#countryList').on('change', function(){
    $.ajax({
        url: "libs/php/getCovid.php",
        type: "GET",
        dataType: "json",
        data: {
            selectedCountry: $('#countryList').val()
        },
        success: function(result) {

            if (result.status.name == "ok") {

                covidInfo = result['data']['data']

                $('#totalCases').html(commaSeparateNumber(covidInfo['latest_data']['confirmed']))
                $('#totalDeaths').html(commaSeparateNumber(covidInfo['latest_data']['deaths']))
                $('#totalRecovered').html(commaSeparateNumber(covidInfo['latest_data']['recovered']))
                $('#newCases').html(commaSeparateNumber(covidInfo['timeline']['0']['new_confirmed']))
                $('#newDeaths').html(commaSeparateNumber(covidInfo['timeline']['0']['new_deaths']))
                $('#newRecovered').html(commaSeparateNumber(covidInfo['timeline']['0']['new_recovered']))
                $('#3mCases').html(commaSeparateNumber(covidInfo['timeline']['365']['confirmed']))
                $('#3mDeaths').html(commaSeparateNumber(covidInfo['timeline']['365']['deaths']))
                $('#3mRecovered').html(commaSeparateNumber(covidInfo['timeline']['365']['recovered']))

            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR))
            console.log(JSON.stringify(textStatus))
            console.log(JSON.stringify(errorThrown))
        }
    });
})

// Get Exchange Rates
const getExchangeRates = (currencyCode) => {
    $.ajax({
        url: 'libs/php/getExchangeRates.php',
        type: 'GET',
        dataType: 'json',
        data: {
            currencyCode
        },
        success: function(result) {

            if (result.status.name == "ok") {
                
                conversionRates = result['data']['conversion_rates'];

                console.log(Object.keys(conversionRates)[0])
                console.log(Object.keys(conversionRates).length);
               
                for (let i = 0; i < (Object.keys(conversionRates).length) - 1; i++ ) {
                    let option = document.createElement('option');
                    option.classList.add('option');
                    option.value = Object.values(conversionRates)[i];
                    option.text = Object.keys(conversionRates)[i];
                    $('#countryListCurrency').append(option);
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR))
            console.log(JSON.stringify(textStatus))
            console.log(JSON.stringify(errorThrown))
        }
    })
}

const getCurrencyCode = (country) => {
    $.ajax({
        url: 'libs/php/getCurrencyCode.php',
        type: 'POST',
        dataType: 'json',
        data: {
            country
        },
        success: function(result) {
            if (result.status.name == "ok") {
                
                let currencyCode = result['data']['geonames']['0']['currencyCode'];

                $('.countryCurrencyCode').html(currencyCode)
                $('#singleCurrencyFrom').html(`1 ${currencyCode}`)
                getExchangeRates(currencyCode);

            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR))
            console.log(JSON.stringify(textStatus))
            console.log(JSON.stringify(errorThrown))
        }
    })
}

// Need to refactor these two event handled functions to not repeat code
$('#countryListCurrency').on('change', function () {

    let amountToConvert = $('#currencyQuantity').val();
    let currencyToConvertTo = $('#countryListCurrency').val();
    let currencyRound = parseFloat(currencyToConvertTo).toFixed(2);
    let conversionResult = (amountToConvert * currencyToConvertTo).toFixed(2);

    let currencyText = $('#countryListCurrency option:selected').text();

    $('#conversionResult').html(`${conversionResult} ${currencyText}`);
    $('#singleCurrencyTo').html(`${currencyRound} ${currencyText}`);

})

$('#currencyQuantity').on('keyup', function(){

    let amountToConvert = $('#currencyQuantity').val();
    let currencyToConvertTo = $('#countryListCurrency').val();
    let conversionResult = (amountToConvert * currencyToConvertTo).toFixed(2);

    let currencyText = $('#countryListCurrency option:selected').text();

    $('#conversionResult').html(`${conversionResult} ${currencyText}`);
    $('#singleCurrencyTo').html(`${currencyToConvertTo} ${currencyText}`);

})

// Fix Numbers (Remove Commas, Remove leading zeros, separate decimals)
commaSeparateNumber = (num) => {
    num = num.toString().replace(/,/g, '') // Remove Existing Commas
    let numRmZero = num.replace(/^0+/, '') // Remove Leading Zeros
    let numSplit = numRmZero.split('.') // Separate Decimals

    while (/(\d+)(\d{3})/.test(numSplit[0].toString())) {
        numSplit[0] = numSplit[0].toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2')
    }

    if (numSplit.length == 2) { // If already had decimals
        num = numSplit[0] + '.' + numSplit[1] // Add decimals Back
    } else {
        num = numSplit[0]
    }

    return num;
}