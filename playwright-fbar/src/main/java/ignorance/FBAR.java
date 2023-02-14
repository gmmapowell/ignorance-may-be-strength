package ignorance;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;

class FBAR {
	public static void main(String[] argv) {
		try (Playwright playwright = Playwright.create()) {
		      Browser browser = playwright.webkit().launch();
		      Page page = browser.newPage();
		      page.navigate("http://whatsmyuseragent.org/");
		}
	}
}
