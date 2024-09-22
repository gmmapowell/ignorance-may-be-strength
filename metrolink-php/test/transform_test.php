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
        $out = $transformer->transform([["TLAREF" => "AIR"]]);
        $this->assertEquals([], $out);
    }

    public function test_requiring_to_fir_excludes_to_air() {
        $transformer = new Transformer(["to" => ["FIR"]]);
        $out = $transformer->transform([["Dest0" => "Manchester Airport"]]);
        $this->assertEquals([], $out);
    }

    public function test_from_fir_includes_a_single_matching_entry() {
        $transformer = new Transformer(["from" => ["FIR"]]);
        $out = $transformer->transform([[
            "TLAREF" => "FIR",
            "Dest0" => "Victoria",
            "Wait0" => "6",
            "LastUpdated" => "2024-09-17T19:52:55Z"
        ]]);
        $this->assertEquals(["FIR" => ["VIC" => [ "19:58" ]]], $out);
    }

    public function test_firswood_has_two_trams_to_Victoria() {
        $transformer = new Transformer(["from" => ["FIR"]]);
        $out = $transformer->transform([[
            "TLAREF" => "FIR",
            "Dest0" => "Victoria",
            "Wait0" => "6",
            "Dest2" => "Victoria",
            "Wait2" => "18",
            "LastUpdated" => "2024-09-17T19:52:55Z"
        ]]);
        $this->assertEquals(["FIR" => ["VIC" => [ "19:58", "20:10" ]]], $out);
    }

    public function test_tram_to_Altrincham_passes_with_empty_filter_in_Dest0() {
        $transformer = new Transformer([]);
        $matches = $transformer->filter([
            "TLAREF" => "SPS",
            "Dest0" => "Altrincham",
            "Wait0" => "6",
            "LastUpdated" => "2024-09-17T19:52:55Z"
        ], 0);
        $this->assertTrue($matches);
    }

    public function test_to_Altrincham_passes_filter_in_Dest0() {
        $transformer = new Transformer(["to" => ["Altrincham"]]);
        $matches = $transformer->filter([
            "TLAREF" => "SPS",
            "Dest0" => "Altrincham",
            "Wait0" => "6",
            "LastUpdated" => "2024-09-17T19:52:55Z"
        ], 0);
        $this->assertTrue($matches);
    }

    public function test_tla_collection() {
        $transformer = new Transformer(["to" => ["ALT"]]);
        $tlas = $transformer->collectTLAs([[
            "TLAREF" => "ALT",
            "StationLocation" => "Altrincham"
        ],[
            "TLAREF" => "SPS",
            "StationLocation" => "St Peter's Square"
        ],[
            "TLAREF" => "ALT",
            "StationLocation" => "Altrincham"
        ],[
            "TLAREF" => "WST",
            "StationLocation" => "Weaste"
        ]]);
        $this->assertEquals(["ALT" => "Altrincham", "SPS" => "St Peter's Square", "WST" => "Weaste"], $tlas);
    }

    public function test_analysis_can_turn_ALT_to_Altrincham() {
        $transformer = new Transformer(["to" => ["ALT"]]);
        $transformer->analyze([[
            "TLAREF" => "ALT",
            "StationLocation" => "Altrincham"
        ]]);
        $this->assertEquals(["Altrincham"], $transformer->to);
    }

    public function test_line_collection() {
        $transformer = new Transformer([]);
        $lines = $transformer->collectLines([[
            "StationLocation" => "Firswood",
            "Line" => "South Manchester",
            "Direction" => "Outgoing",
        ],[
            "StationLocation" => "Firswood",
            "Line" => "South Manchester",
            "Direction" => "Incoming",
        ],[
            "StationLocation" => "Central Park",
            "Direction" => "Outgoing",
            "Line" => "Oldham & Rochdale",
        ],[
            "StationLocation" => "Failsworth",
            "Direction" => "Outgoing",
            "Line" => "Oldham & Rochdale",
        ],[
            "StationLocation" => "Freehold",
            "Direction" => "Outgoing",
            "Line" => "Oldham & Rochdale",
        ],[
            "StationLocation" => "Weaste",
            "Direction" => "Incoming",
            "Line" => "Eccles",
        ]]);
        $this->assertEquals([
            "O-South Manchester" => ["Firswood"],
            "I-South Manchester" => ["Firswood"],
            "I-Eccles" => ["Weaste"],
            "O-Oldham & Rochdale" => ["Central Park", "Failsworth", "Freehold"]
        ], $lines);
    }

    public function test_analysis_will_expand_outbound_oldham() {
        $transformer = new Transformer(["to" => ["O-Oldham & Rochdale"]]);
        $transformer->analyze([[
            "StationLocation" => "Firswood",
            "Line" => "South Manchester",
            "Direction" => "Outgoing",
        ],[
            "StationLocation" => "Firswood",
            "Line" => "South Manchester",
            "Direction" => "Incoming",
        ],[
            "StationLocation" => "Central Park",
            "Direction" => "Outgoing",
            "Line" => "Oldham & Rochdale",
        ],[
            "StationLocation" => "Failsworth",
            "Direction" => "Outgoing",
            "Line" => "Oldham & Rochdale",
        ],[
            "StationLocation" => "Freehold",
            "Direction" => "Outgoing",
            "Line" => "Oldham & Rochdale",
        ],[
            "StationLocation" => "Weaste",
            "Direction" => "Incoming",
            "Line" => "Eccles",
        ]]);
        $this->assertEquals(["Central Park", "Failsworth", "Freehold"], $transformer->to);
    }

    public function test_adding_0_minutes_is_easy() {
        $transformer = new Transformer([]);
        $when = $transformer->date("2024-09-17T19:52:55Z", 0);
        $this->assertEquals("19:52", $when);
    }

    public function test_adding_5_minutes() {
        $transformer = new Transformer([]);
        $when = $transformer->date("2024-09-17T19:52:55Z", 5);
        $this->assertEquals("19:57", $when);
    }

    public function test_adding_18_minutes_will_wrap() {
        $transformer = new Transformer([]);
        $when = $transformer->date("2024-09-17T19:52:55Z", 18);
        $this->assertEquals("20:10", $when);
    }

    public function test_can_wrap_to_tomorrow() {
        $transformer = new Transformer([]);
        $when = $transformer->date("2024-09-17T23:55:12Z", 6);
        $this->assertEquals("00:01", $when);
    }
}