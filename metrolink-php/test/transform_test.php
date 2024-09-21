<?php
use PHPUnit\Framework\TestCase;

require("../php/transform.php");

final class Transform_test extends TestCase
{
    public function test_something() {

        $foo = transform(array());
        // $this->assertInstanceOf("", $transformer);
        $this->fail("hello, world");
    }
}