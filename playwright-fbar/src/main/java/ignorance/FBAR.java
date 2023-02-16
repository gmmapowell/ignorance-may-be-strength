package ignorance;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.AriaRole;

class FBAR {
	public static void main(String[] argv) {
		Portfolio portfolio = new PortfolioLoader().load();
		try (Playwright playwright = Playwright.create()) {
			Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(false).setSlowMo(500));
			Page page = browser.newPage();
			page.navigate("https://bsaefiling1.fincen.treas.gov/lc/content/xfaforms/profiles/htmldefault.html");
			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Enter your email address.").setExact(true)).fill("mickey.mouse@disney.com");
			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Re-enter your email address.")).fill("mickey.mouse@disney.com");
			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Enter your first name.")).fill("Mickey");
			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Enter your last name.")).fill("Mouse");
			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Enter your telephone number. Do not include formatting such as spaces, dashes, or other punctuation.")).fill("770-555-1234");
			
			page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Please click this button to begin preparing your FBAR.")).click();
			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Filing name")).fill("Mouse FBAR 2022");
//			page.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName("reason")).selectOption("A");
//			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Explanation")).fill("I keep forgetting the deadline has changed.");
			
			boolean first = true;
			for (JointAsset joint : portfolio.joints()) {
				Locator mypage3 = page.locator("div.subform.Part3");
				if (!first) {
					mypage3.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("+").setExact(true)).click();
					mypage3 = mypage3.last();
				}
				first = false;

				mypage3.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("*15")).fill(Integer.toString(joint.getMaximumValue()));
				mypage3.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("*16")).selectOption(joint.getType());
			}
			Thread.sleep(10000);
		} catch (InterruptedException ex) {
			ex.printStackTrace();
		}
	}
}
