<?php

require_once("../php/calendar.php");
$calname = $config->get_header('x-calendar-name');

error_log("looking to delete calendar " . $calname);
$resp = $profiles->delete_calendar(urlencode($calname));
?>