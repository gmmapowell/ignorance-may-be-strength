<?php

require_once("../php/calendar.php");
$request = $config->read_json_body();
$resp = $profiles->sign_in($request);
echo json_encode($resp);
?>