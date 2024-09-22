<?php
  require('metrolink_key.php');
  require('transform.php');

  date_default_timezone_set('UTC');
  
  $transformer = new Transformer($_GET);

  $ch = curl_init("https://api.tfgm.com/odata/Metrolinks");
  curl_setopt($ch, CURLOPT_HTTPHEADER, array($metrolink_key));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $response = curl_exec($ch);

  $data = json_decode($response, true);
  $transformer->analyze($data["value"]);
  $transformed = $transformer->transform($data["value"]);
  print json_encode($transformed);
?>
