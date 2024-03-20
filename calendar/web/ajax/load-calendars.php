<?php

require_once("../php/calendar.php");
error_log("looking to list calendars");
$resp = $profiles->list_calendars();
error_log("calendars = " . $resp);
$cals = [];
$cals['action'] = 'calendars';
$cals['calendars'] = $resp;
echo json_encode($cals);
?>