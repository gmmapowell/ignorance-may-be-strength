<?php

$from = array();
$to = array();

$ch = curl_init("https://api.tfgm.com/odata/Metrolinks?\$filter=PIDREF%20eq%20'MKT-TPTS01'%20or%20PIDREF%20eq%20'PIC-TPTD02'%20or%20PIDREF%20eq%20'PCG-TPID02'%20or%20PIDREF%20eq%20'SPS-PID01'%20or%20PIDREF%20eq%20'SPS-PID02'");
curl_setopt($ch, CURLOPT_HTTPHEADER, array("Ocp-Apim-Subscription-Key: 06b8da20542a4fc280e0de69d5e25d1f"));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$json = json_decode($response, true);
$now = time() + 8*3600; // Hack for BST not PT

function process($foo, $deps, $which) {
  if (!$foo["Dest".$which]) return;
  global $from, $to, $now;
  $to[$foo["Dest".$which]] = 1;
  $when = date("H:i", $now + $foo["Wait".$which]*60);
  $dest = $foo["Dest".$which];
  if (!array_key_exists($dest, $deps))
    $times = array();
  else
    $times = $deps[$dest];
  $times[] = $when;
  $deps[$dest] = $times;

  return $deps;
}

foreach ($json["value"] as $foo) {
  $stat= $foo["StationLocation"];
  if (!array_key_exists($stat, $from))
    $deps = array();
  else
    $deps = $from[$stat];
$deps = process($foo, $deps, 0);
$deps = process($foo, $deps, 1);
$from[$stat] = process($foo, $deps, 2);

  #if ($foo->Dest0) {
    #$deps[] = $foo->Dest0;
  #}
  #if ($foo->Dest1)
    #$deps[] = $foo->Dest1;
  #if ($foo->Dest2)
    #$deps[] = $foo->Dest2;
  #$from[$stat] = $deps;
}
$fromKs = array();
foreach ($from as $k=>$v) {
  $fromKs[] = $k;
}
$destKs = array();
foreach ($to as $k=>$v) {
  $destKs[] = $k;
}
sort($fromKs);
sort($destKs);
print "<table><tr><th>&nbsp;</th>";
foreach ($destKs as $d) {
  printf("<th colspan=3>%s</th>", $d);
}
print "</tr>\n";
foreach ($fromKs as $f) {
  print "<tr>";
  printf("<td>%-20.20s</td>", $f);
  #var_dump($from[$f]);
  foreach ($destKs as $d) {
    if (!array_key_exists($d, $from[$f]))
      printf("<td colspan=3>&nbsp;</td>", "");
    else {
      for ($idx=0;$idx<3;$idx++) {
        if ($idx >= count($from[$f][$d]))
	  printf("<td>&nbsp;</td>");
        else
          printf("<td>%-5.5s</td>", $from[$f][$d][$idx]);
      }
      printf("   ");
    }
  }
  print "</tr>\n";
}
print "</table>";
?>
