// ------------------------- Maps -------------------------

const map = L.map('map').setView([51, 0], 4);

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

// Map Controls
L.control.layers(mapTileLayers, overlays).addTo(map);
L.control.scale().addTo(map);

// ------------------------- Select Country -------------------------

$.ajax({
    url: "libs/php/getAllCountries.php",
    type: 'GET',
    dataType: 'json',
    data: {},

    success: function(result) {
    console.log(result)
    if(result.status.name == "ok") {
        
        countryList = result['countryList']

        
            countryList.forEach(country => {
                let option = document.createElement("option")
                option.classList.add("option")
                option.value = country['code']
                option.text = country['name']
                $("#countryList").append(option)
                
            })
    }
}
})

// Create Polygons
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

// Buttons
// Country Info Button
L.easyButton('fa-solid fa-info', () => {
    $('#countryInfoModal').modal('show')
}).addTo(map)

// Weather Button
L.easyButton('fa-solid fa-cloud-sun', () => {
    $('#weatherInfoModal').modal('show')
}).addTo(map)

// News Button
let newsAvailable = false;
L.easyButton('fa-solid fa-newspaper', () => {
    if (newsAvailable) {
        $('#newsInfoModal').modal('show')
    } else {
        $('#newsErrorModal').modal('show')
    }
}).addTo(map)

// Covid-19 Button
L.easyButton('fa-solid fa-biohazard', () => {
    $('#covidInfoModal').modal('show')
}).addTo(map)

// Modals
// Get Country Info
$('#countryList').on('change', (lat, lng) => {
    $.ajax({
        url: '../Gazetteer/libs/php/getCountryInfo.php',
        type: 'POST',
        dataType: 'json',
        data: {
            country: $('#countryList').val(),
        },
        success: (result) => {
            if (result.status.name == 'ok') {
                console.log(result);

                $('#flagDivCountry').removeClass()
                $('#flagDivCountry').addClass('fflag ff-xl ff-sphere')
                $('#flagDivCountry').addClass(`fflag-${result['data']['geonames']['0']['countryCode']}`)
                $('#countryInfoModalLabel').html(result['data']['geonames']['0']['countryName'])
                
                $('#countryCapital').html(result['data']['geonames']['0']['capital'])
                $('#countryPopulation').html(commaSeparateNumber(result['data']['geonames']['0']['population']))
                $('#countryLanguage').html(result['data']['geonames']['0']['languages'])
                $('#countryArea').html(commaSeparateNumber(result['data']['geonames']['0']['areaInSqKm']))
                
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR))
            console.log(JSON.stringify(textStatus))
            console.log(JSON.stringify(errorThrown))
        }
    })
})

// Get Weather
$('#countryList').on('change', function(){
    $.ajax({
        url: "../Gazetteer/libs/php/getWeather.php",
        type: "POST",
        dataType: "json",
        data: {
            selectedCountry: $('#countryList').val()
        },
        success: function(result){
            // console.log(result);
            if(result.status.name == "ok") {

                let weather = result['getWeather']
                let countriesInfo = result['getCountryInfo']

                $('#flagDivWeather').removeClass()
                $('#flagDivWeather').addClass('fflag ff-xl ff-sphere')
                $('#flagDivWeather').addClass(`fflag-${countriesInfo['0']['countryCode']}`)
                $('#weatherInfoModalLabel').html(countriesInfo['0']['countryName'])

                $('#wIcon').attr('src', `http://openweathermap.org/img/w/10d.png`)
                

                console.log(weather)
                $('#weatherTemp').html(Math.round(weather['main']['temp']) + '&#8451;')
                $('#weatherFeel').html(Math.round(weather['main']['feels_like']) + '&#8451;')
                $('#weatherMin').html(Math.round(weather['main']['temp_min']) + '&#8451;')
                $('#weatherMax').html(Math.round(weather['main']['temp_max']) + '&#8451;')
               
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR))
            console.log(JSON.stringify(textStatus))
            console.log(JSON.stringify(errorThrown))
        }
    })
})

// Get News
$('#countryList').on('change', function(){
    $.ajax({
        url: "../Gazetteer/libs/php/getNews.php",
        type: "POST",
        dataType: "json",
        data: {
            selectedCountry: $('#countryList').val()
        },
        success: function(result){
            if(result.status.name == "ok") {

                let news = result['data']['articles']
                let countriesInfo = result['getCountryInfo']

                $('#flagDivNews').removeClass()
                $('#flagDivNews').addClass('fflag ff-xl ff-sphere')
                $('#flagDivNews').addClass(`fflag-${countriesInfo['0']['countryCode']}`)
                $('#newsInfoModalLabel').html(countriesInfo['0']['countryName'])
                $('#flagDivNewsError').removeClass()
                $('#flagDivNewsError').addClass('fflag ff-xl ff-sphere')
                $('#flagDivNewsError').addClass(`fflag-${countriesInfo['0']['countryCode']}`)
                $('#newsErrorModalLabel').html(countriesInfo['0']['countryName'])
                
                if (news[0]) {
                    newsAvailable = true
                    // Top Headline
                    $('#newsLink1').attr('href', `${news['0']['url']}`)
                    $('#newsTitle1').html(news['0']['title'])
                    $('#newsImg1').attr('src', `${news['0']['urlToImage']}`)
                    $('#newsSrc1').html(news['0']['source']['name'])

                    // Headline 2
                    $('#newsLink2').attr('href', `${news['1']['url']}`)
                    $('#newsTitle2').html(news['1']['title'])
                    $('#newsImg2').attr('src', `${news['1']['urlToImage']}`)
                    $('#newsSrc2').html(news['1']['source']['name'])

                    // Headline 3
                    $('#newsLink3').attr('href', `${news['2']['url']}`)
                    $('#newsTitle3').html(news['2']['title'])
                    $('#newsImg3').attr('src', `${news['2']['urlToImage']}`)
                    $('#newsSrc3').html(news['2']['source']['name'])
                } else {
                    newsAvailable = false
                }

            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXHR))
            console.log(JSON.stringify(textStatus))
            console.log(JSON.stringify(errorThrown))
        }
    })
})

// Covid-19 Information
$('#countryList').on('change', function(){
    $.ajax({
        url: "../Gazetteer/libs/php/getCovid.php",
        type: "GET",
        dataType: "json",
        data: {
            selectedCountry: $('#countryList').val()
        },
        success: function(result) {

            if (result.status.name == "ok") {

                let countriesInfo = result['getCountryInfo']
                covidInfo = result['data']['data']

                $('#flagDivCovid').removeClass()
                $('#flagDivCovid').addClass('fflag ff-xl ff-sphere')
                $('#flagDivCovid').addClass(`fflag-${countriesInfo['0']['countryCode']}`)
                $('#covidInfoModalLabel').html(countriesInfo['0']['countryName'])


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