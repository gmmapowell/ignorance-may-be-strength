<?php

require_once("../php/calendar.php");
$resp = $profiles->list_calendars();
$cals = [];
$cals['action'] = 'calendars';
$cals['calendars'] = $resp;
echo json_encode($cals);
?>