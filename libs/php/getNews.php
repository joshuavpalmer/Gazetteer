<?php 

ini_set('display_errors', 'on');
error_reporting(E_ALL);

function getNews($countrySelected) {
    $url = 'https://newsapi.org/v2/top-headlines?language=en&country='.$countrySelected.'&apiKey=571ccb699ad041069e1218a944de3b3d';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);
    $result=curl_exec($ch);
    curl_close($ch);
    $decode = json_decode($result, true);
    return $decode;
}

function getCountryInfo($countrySelected) {
    $url = 'http://api.geonames.org/countryInfoJSON?formatted=true&lang=en&country=' . $countrySelected . '&username=joshuavpalmer&style=full';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);
    $result=curl_exec($ch);
    curl_close($ch);
    $decode = json_decode($result, true);
    return $decode['geonames'];
}
// Country Info
$countrySelected = $_REQUEST['selectedCountry'];
$output['getCountryInfo'] = getCountryInfo($countrySelected);

// Weather
$countrySelected = $_REQUEST['selectedCountry'];
$output['data'] = getNews($countrySelected);



$output["status"]["code"] = "200";
$output["status"]["name"] = "ok";
$output["status"]["description"] = "success";




//Sending data back to javascript
header('Content-type: application/json; charset=UTF-8');
echo json_encode($output);
?>