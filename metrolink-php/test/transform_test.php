<?php
use PHPUnit\Framework\TestCase;

require("../php/transform.php");

final class Transform_test extends TestCase
{
    public function test_extract_from() {
        $transformer = new Transformer(["from" => ["FIR", "VIC"]]);
        $this->assertEquals(["FIR", "VIC"], $transformer->from);
    }
}