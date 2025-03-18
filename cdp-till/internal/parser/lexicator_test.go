package parser_test

import (
	"testing"

	"github.com/gmmapowell/ignorance/cdp-till/internal/parser"
)

func TestASingleAlphaToken(t *testing.T) {
	lexer := parser.NewLineLexicator()
	tokens := lexer.Lexicate("hello")
	if len(tokens) != 1 {
		t.Fatal("not 1 token")
	}
	if tokens[0] != "hello" {
		t.Fatal("token was not hello")
	}
}

func TestASingleAlphaTokenIgnoringSpaces(t *testing.T) {
	lexer := parser.NewLineLexicator()
	tokens := lexer.Lexicate("  hello  ")
	if len(tokens) != 1 {
		t.Fatal("not 1 token")
	}
	if tokens[0] != "hello" {
		t.Fatal("token was not hello")
	}
}

func TestTwoAlphaTokens(t *testing.T) {
	lexer := parser.NewLineLexicator()
	tokens := lexer.Lexicate("hello world")
	if len(tokens) != 2 {
		t.Fatal("not 2 tokens")
	}
	if tokens[0] != "hello" {
		t.Fatal("token 0 was not hello")
	}
	if tokens[1] != "world" {
		t.Fatal("token 1 was not world")
	}
}

func TestTwoAlphaTokensIgnoringAllSpaces(t *testing.T) {
	lexer := parser.NewLineLexicator()
	tokens := lexer.Lexicate("  hello    world   ")
	if len(tokens) != 2 {
		t.Fatal("not 2 tokens")
	}
	if tokens[0] != "hello" {
		t.Fatal("token 0 was not hello")
	}
	if tokens[1] != "world" {
		t.Fatal("token 1 was not world")
	}
}

// Note that this is not in fact valid, but it should
// lex correctly
func TestAnAssignByItself(t *testing.T) {
	lexer := parser.NewLineLexicator()
	tokens := lexer.Lexicate("<-")
	if len(tokens) != 1 {
		t.Fatal("not 1 token")
	}
	if tokens[0] != "<-" {
		t.Fatal("token was not <-")
	}
}

func TestAnAssignByItselfWithSpaces(t *testing.T) {
	lexer := parser.NewLineLexicator()
	tokens := lexer.Lexicate("  <-  ")
	if len(tokens) != 1 {
		t.Fatal("not 1 token")
	}
	if tokens[0] != "<-" {
		t.Fatal("token was not <-")
	}
}

func TestAnAssignmentWithSpacesBetween(t *testing.T) {
	lexer := parser.NewLineLexicator()
	tokens := lexer.Lexicate("a <- b")
	if len(tokens) != 3 {
		t.Fatal("not 3 tokens")
	}
	if tokens[0] != "a" {
		t.Fatal("token 0 was not <-")
	}
	if tokens[1] != "<-" {
		t.Fatal("token 1 was not <-")
	}
	if tokens[2] != "b" {
		t.Fatal("token 2 was not <-")
	}
}

func TestAnAssignmentWithNoSpaces(t *testing.T) {
	lexer := parser.NewLineLexicator()
	tokens := lexer.Lexicate("a<-b")
	if len(tokens) != 3 {
		t.Fatal("not 3 tokens")
	}
	if tokens[0] != "a" {
		t.Fatal("token 0 was not <-")
	}
	if tokens[1] != "<-" {
		t.Fatal("token 1 was not <-")
	}
	if tokens[2] != "b" {
		t.Fatal("token 2 was not <-")
	}
}
