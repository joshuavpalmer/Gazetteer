<?php 

ini_set('display_errors', 'on');
error_reporting(E_ALL);

function getCountryPolygons($countrySelected) {
    $data_as_string = file_get_contents("../js/json/countryBorders.geo.json");
    $data = json_decode($data_as_string, true);
    
    foreach($data['features'] as $country) {
        if ($country['properties']['iso_a2'] == $countrySelected) {
        return $country['geometry'];
        }
    }
}

$output["status"]["code"] = "200";
$output["status"]["name"] = "ok";
$output["status"]["description"] = "success";

$countrySelected = $_REQUEST['selectedCountry'];
$output["countryPolygons"] = getCountryPolygons($countrySelected);

header('Content-type: application/json; charset=UTF-8');
echo json_encode($output);

?>