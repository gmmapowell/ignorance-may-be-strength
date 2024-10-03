<?php

require_once("../php/calendar.php");
$calname = $config->get_header('x-calendar-name');
$resp = $profiles->send_calendar(urlencode($calname));
?>