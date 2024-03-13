<?php

require_once("../php/calendar.php");
error_log($config->root);
$request = $config->read_json_body();
$resp = $profiles->create_user($request);
echo json_encode($resp);
?>