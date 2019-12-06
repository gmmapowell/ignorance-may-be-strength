package blog.test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

import blog.ignorance.tda.processing.Mapping;

public class TestPatterns {
	@Test
	public void aSimplePatternMatchesTheIntendedString() {
		Mapping m = new Mapping("/hello", () -> null);
		assertTrue(m.matches("GET", "/hello"));
	}
	
	@Test
	public void aSimplePatternDoesNotMatchSomethingObviouslyDifferent() {
		Mapping m = new Mapping("/hello", () -> null);
		assertFalse(m.matches("GET", "/goodbye"));
	}

	@Test
	public void aSimplePatternDoesNotMatchAnExtendedString() {
		Mapping m = new Mapping("/hello", () -> null);
		assertFalse(m.matches("GET", "/helloThere"));
	}

	@Test
	public void aParameterizedPatternMatchesExtendedString() {
		Mapping m = new Mapping("/hello/{whatever}", () -> null);
		assertTrue(m.matches("GET", "/hello/There"));
	}

	@Test
	public void aParameterizedPatternDoesNotMatchesTheBasicString() {
		Mapping m = new Mapping("/hello/{whatever}", () -> null);
		assertFalse(m.matches("GET", "/hello"));
	}

	@Test
	public void aParameterizedPatternDoesNotMatchesAStringWithEvenMoreComponents() {
		Mapping m = new Mapping("/hello/{whatever}", () -> null);
		assertFalse(m.matches("GET", "/hello/there/world"));
	}
}
