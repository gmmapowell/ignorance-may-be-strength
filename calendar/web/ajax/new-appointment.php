<?php

require_once("../php/calendar.php");
error_log("add new appointment");
$when = $config->get_header('x-event-when');
$tz = $config->get_header('x-event-tz');
$desc = $config->get_header('x-event-desc');
error_log("add new appointment: " . $when . $tz . ": " .$desc);

$resp = $profiles->new_appointment($when, $tz, $desc);
?>