<?php

require_once("../php/calendar.php");
error_log("add new appointment");
$date = $config->get_header('x-event-date');
$time = $config->get_header('x-event-time');
$tz = $config->get_header('x-event-tz');
$desc = $config->get_header('x-event-desc');
error_log("add new appointment: " . $date . " " . $time . $tz . ": " .$desc);

$resp = $profiles->new_appointment($date, $time, $tz, $desc);
?>