package ignorance;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;

class FBAR {
	public static void main(String[] argv) {
		try (Playwright playwright = Playwright.create()) {
			Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(false).setSlowMo(50));
			Page page = browser.newPage();
			page.navigate("https://bsaefiling1.fincen.treas.gov/lc/content/xfaforms/profiles/htmldefault.html");
			page.fill("div.Email input", "mickey.mouse@disney.com");
			page.fill("div.ConfirmedEmail input", "mickey.mouse@disney.com");
			page.fill("div.FirstName input", "Mickey");
			page.fill("div.LastName input", "Mouse");
			page.fill("div.PhoneNumber input", "770-555-1234");
			Thread.sleep(1000);
		} catch (InterruptedException ex) {
			ex.printStackTrace();
		}
	}
}
