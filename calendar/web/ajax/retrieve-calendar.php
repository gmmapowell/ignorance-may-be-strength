<?php

require_once("../php/calendar.php");
$calname = getallheaders()['x-calendar-name'];
$resp = $profiles->send_calendar($calname);
?>