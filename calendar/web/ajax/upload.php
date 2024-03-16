<?php

require_once("../php/calendar.php");
$user = $profiles->current_user();
if (!$user) {
    http_response_code(401);
    return;
}

$file = getallheaders()['x-file-name'];
$file_name = preg_replace('/[^a-zA-Z0-9._-]+/', '-', $file);
$file_name = preg_replace('/^\./', '-', $file_name);
error_log($file_name);

$user_file = $user['dir'] ."/" . $file_name;
file_put_contents($user_file, file_get_contents('php://input'));
?>