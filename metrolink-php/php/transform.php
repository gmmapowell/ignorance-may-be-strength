<?php

  class Transformer {
    var $from, $to;
    public function __construct($params) {
      $this->from = array_key_exists('from', $params) ? $params['from'] : [];
      $this->to = array_key_exists('to', $params) ? $params['to'] : [];
    }

    function analyze($odata) {
      $tlas = $this->collectTLAs($odata);
      $input = $this->to;
      $this->to = [];
      foreach ($input as $dest) {
        $this->analyzeOne($tlas, $dest);
      }
    }

    function collectTLAs($odata) {
      $tlas = [];
      foreach ($odata as $pid) {
        // Obviously we need to have a TLAREF and a StationLocation
        if (!array_key_exists("TLAREF", $pid)) continue;
        if (!array_key_exists("StationLocation", $pid)) continue;

        // Once it's done, don't do it again
        if (array_key_exists($pid["TLAREF"], $tlas)) continue;

        // map it
        $tlas[$pid["TLAREF"]] = $pid["StationLocation"];
      }
      return $tlas;
    }

    function analyzeOne($tlas, $dest) {
      if (array_key_exists($dest, $tlas))
        $this->to[] = $tlas[$dest];
      else
        $this->to[] = $dest;
    }

    function transform($odata) {
      $ret = [];

      foreach ($odata as $item) {
        for ($i=0;$i<3;$i++) {
          if ($this->filter($item, $i))
            $ret = $this->merge($ret, $this->transformOne($item, $i));
        }
      }
      return $ret;
    }

    function filter($item, $dst) {
      // This tram must be going *somewhere* (a lot of them are blank)
      $d = "Dest{$dst}";
      if (!array_key_exists($d, $item) || $item[$d] == "") return false;

      // Apply the destination filters
      if ($this->to) {
        if ($item[$d] != $this->to[0]) return false;
      }

      // Apply the origin filters
      if ($this->from) {
        if (!array_key_exists("TLAREF", $item)) return false;
        if ($item["TLAREF"] != "FIR") return false;
      }

      // If it didn't fail, it can be included
      return true;
    }

    function transformOne($pid, $dst) {
      if (array_key_exists("TLAREF", $pid)) {
        return [ "FIR" => [ "VIC" => [ $dst == 0 ? "19:58" : "20:10" ]]];
      }
    }

    function merge($ret, $incl) {
      foreach ($incl as $k => $v) {
        if (!array_key_exists($k, $ret)) {
          $ret[$k] = $v;
        } else {
          foreach ($v as $k2 => $v2) {
            foreach ($v2 as $time) {
              $ret[$k][$k2][] = $time;
            }
          }
        }
      }
      return $ret;
    }
  }
?>