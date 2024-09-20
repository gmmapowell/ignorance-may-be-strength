<?php
  require('metrolink_key.php');

  $ch = curl_init("https://api.tfgm.com/odata/Metrolinks");
  curl_setopt($ch, CURLOPT_HTTPHEADER, array($metrolink_key));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
  $response = curl_exec($ch);
?>
