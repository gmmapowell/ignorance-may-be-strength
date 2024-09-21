<?php
use PHPUnit\Framework\TestCase;

require("../php/transform.php");

final class Transform_test extends TestCase
{
    public function test_extract_from() {
        $transformer = new Transformer(["from" => ["FIR", "VIC"]]);
        $this->assertEquals(["FIR", "VIC"], $transformer->from);
    }

    public function test_no_pids_produces_no_output() {
        $transformer = new Transformer(["from" => ["FIR", "VIC"]]);
        $out = $transformer->transform([]);
        $this->assertEquals([], $out);
    }

    public function test_requiring_from_fir_excludes_from_air() {
        $transformer = new Transformer(["from" => ["FIR"]]);
        $out = $transformer->transform(["TLAREF" => "AIR"]);
        $this->assertEquals([], $out);
    }

    public function test_requiring_to_fir_excludes_to_air() {
        $transformer = new Transformer(["to" => ["FIR"]]);
        $out = $transformer->transform(["TLAREF" => "AIR"]);
        $this->assertEquals([], $out);
    }
}
?>