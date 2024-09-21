<?php

  class Transformer {
    var $from, $to;
    public function __construct($params) {
      $this->from = array_key_exists('from', $params) ? $params['from'] : [];
      $this->to = array_key_exists('to', $params) ? $params['to'] : [];
    }

    function transform($odata) {
      $ret = [];

      foreach ($odata as $item) {
        if ($this->filter($item))
          $ret[] = $this->transformOne($item);
      }
      return $ret;
    }

    function filter($item) {
      return array_key_exists("TLAREF", $item) && $item["TLAREF"] == "FIR";
    }

    function transformOne($pid) {
      if (array_key_exists("TLAREF", $pid)) {
        return [ "FIR" => [ "VIC" => [ "19:58" ]]];
      }
    }
  }
?>