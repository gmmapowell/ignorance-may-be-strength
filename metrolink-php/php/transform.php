<?php

  class Transformer {
    var $from, $to;
    public function __construct($params) {
      $this->from = array_key_exists('from', $params) ? $params['from'] : [];
      $this->to = array_key_exists('to', $params) ? $params['to'] : [];
    }

    function transform($odata) {
      return [];
    }
  }
?>