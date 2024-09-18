<?php

require_once("../php/calendar.php");
$resp = $profiles->sign_out();
echo json_encode($resp);
?>