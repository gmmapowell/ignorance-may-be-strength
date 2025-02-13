package ignorance;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.LineNumberReader;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Download;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Page.WaitForCloseOptions;
import com.microsoft.playwright.Page.WaitForDownloadOptions;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.AriaRole;

class FBAR {
	public static void main(String[] argv) {
		PortfolioLoader loader = new PortfolioLoader();
		Portfolio portfolio;
		String password = null;
		File downloadsTo = null;
		try {
			if (argv.length < 3) {
				System.out.println("Usage: fbar portfolio password downloadTo");
				return;
			}
			portfolio = loader.loadJson(new File(argv[0]));
			password = argv[1];
			downloadsTo = new File(argv[2]);
		} catch (Exception ex) {
			ex.printStackTrace();
			return;
		}
		AccountInfo user = portfolio.getUser();
		LineNumberReader lnr = new LineNumberReader(new InputStreamReader(System.in));

		try (Playwright playwright = Playwright.create()) {
			Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(false).setSlowMo(500));
			BrowserContext cxt = browser.newContext();
			
			Page page = cxt.newPage();
			
			page.navigate("https://bsaefiling.fincen.gov/PublicAccess");
			page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("AGREE AND CONTINUE")).click();
			
			page.locator("div.usa-button").click();

			page.locator("button").nth(0).click();

			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Email address").setExact(true)).fill(portfolio.email());
			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Password").setExact(true)).fill(password);
			page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in")).click();

			System.out.print("Login.gov one-time code, please, from Authenticator: ");
			String otc = lnr.readLine();
			
			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("One-time code").setExact(true)).fill(otc);
			page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit")).click();
			
			// Now wait to be fully logged in ...
			page.getByAltText("File Now Button").click();
			
			Page form = cxt.waitForPage(() -> {
				page.navigate("https://bsaefiling.fincen.treas.gov/NoRegFBARFiler.html");
				page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName(" Prepare & Submit ")).click();
			});
			
			if (form == null) {
				System.out.println("new page did not open");
				return;
			}

			System.out.println("New Page: " + form.url() + " -- " + form.title());
			
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Enter your email address.").setExact(true)).fill(portfolio.email());
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Re-enter your email address.")).fill(portfolio.email());
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Enter your first name.")).fill(user.getFirstName());
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Enter your last name.")).fill(user.getLastName());
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Enter your telephone number. Do not include formatting such as spaces, dashes, or other punctuation.")).fill(portfolio.phone());
			
			form.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Please click this button to begin preparing your FBAR.")).click();
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Filing name")).fill(portfolio.filingName());
//			page.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName("reason")).selectOption("A");
//			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Explanation")).fill("I keep forgetting the deadline has changed.");
			
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("* 1")).fill(Integer.toString(portfolio.getFilingYear()));
			form.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName("* 2")).selectOption("A");
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("* 3")).fill(user.getTin());
			form.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName(" 3a")).selectOption("B");

			Locator dob = form.locator("div.subform.DobLastSub");
			dob.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("Month")).selectOption(portfolio.getMonth());
			dob.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("Day")).selectOption(portfolio.getDate());
			dob.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("Year")).selectOption(portfolio.getYear());

			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("* 6 Last")).fill(user.getLastName());
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("7 First name").setExact(true)).fill(user.getFirstName());
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("8 Middle name").setExact(true)).fill(user.getMiddleName());
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("8a Suffix").setExact(true)).fill(user.getSuffix());

			form.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName("13")).selectOption(user.getCountry());
			form.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName("13")).dispatchEvent("blur");
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("9 Address").setExact(true)).fill(user.getAddress());
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("10")).fill(user.getCity());
			form.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("12 ZIP")).fill(user.getPostCode());
			form.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName("11")).selectOption(user.getState());

			form.locator("div.subform.InterestAccts").getByRole(AriaRole.CHECKBOX, new Locator.GetByRoleOptions().setName(" No")).check();
			form.locator("div.subform.SigAuthAcctns").getByRole(AriaRole.CHECKBOX, new Locator.GetByRoleOptions().setName(" No")).check();
			
			boolean first = true;
			for (Asset solo : portfolio.solos()) {
				Locator mypage2 = form.locator("div.subform.Part2");
				if (!first) {
					mypage2.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("+").setExact(true)).last().click();
					mypage2 = mypage2.last();
				}
				first = false;

				mypage2.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("*15")).fill(Integer.toString(solo.getMaximumValue()));
				mypage2.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("*16")).selectOption(solo.getType());
				mypage2.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("*17")).fill(solo.getInstitution());
				mypage2.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("Item 18")).fill(solo.getAccountNo());
				if (solo.hasAddress())
					mypage2.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("19")).fill(solo.getAddress());
				if (solo.hasCity())
					mypage2.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("20")).fill(solo.getCity());
				if (solo.hasState())
				mypage2.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("21")).fill(solo.getState());
				if (solo.hasPostCode())
					mypage2.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("22")).fill(solo.getPostCode());
				mypage2.locator("div.choicelist.Country select").selectOption(solo.getCountry());
			}
			
			first = true;
			for (JointAsset joint : portfolio.joints()) {
				Locator mypage3 = form.locator("div.subform.Part3");
				if (!first) {
					mypage3.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("+").setExact(true)).last().click();
					mypage3 = mypage3.last();
				}
				first = false;

				mypage3.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("*15")).fill(Integer.toString(joint.getMaximumValue()));
				mypage3.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("*16")).selectOption(joint.getType());
				mypage3.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("*17")).fill(joint.getInstitution());
				mypage3.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("Item 18")).fill(joint.getAccountNo());
				if (joint.hasAddress())
					mypage3.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("19")).fill(joint.getAddress());
				if (joint.hasCity())
					mypage3.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("20")).fill(joint.getCity());
				if (joint.hasState())
				mypage3.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("21")).fill(joint.getState());
				if (joint.hasPostCode())
					mypage3.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("22")).fill(joint.getPostCode());
				mypage3.locator("div.partSub div.choicelist.Country select").selectOption(joint.getCountry());
				mypage3.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("*24")).fill(Integer.toString(joint.getNumOthers()));
				fillJoint(mypage3.locator("div.PrincipalJointOwner"), joint.getOther());
			}

			form.onDialog(dialog -> {
				System.out.println("Dialog message: " + dialog.message());
				System.out.println("Dialog prompt: " + dialog.defaultValue());
				dialog.accept();
			});
			
			if (downloadsTo != null) {
				WaitForDownloadOptions options = new WaitForDownloadOptions();
				options.setTimeout(6000000);
				Download download = form.waitForDownload(options, () -> { });
				File isAt = download.path().toFile();
				File saveAs = new File(downloadsTo, isAt.getName());
				System.out.println("Copying " + isAt + " to " + saveAs);
				try {
					Utils.copyFile(download.path().toFile(), saveAs);
				} catch (IOException ex) {
					System.out.println("Copying " + isAt + " failed");
					ex.printStackTrace();
					try { Thread.sleep(6000000); } catch (InterruptedException e) { }
				}
			}

			WaitForCloseOptions options = new WaitForCloseOptions();
			options.setTimeout(6000000);
			form.waitForClose(options, () -> {});
		} catch (Throwable t) {
			t.printStackTrace();
		}
	}

	private static void fillJoint(Locator with, AccountInfo other) {
		with.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("25 a")).selectOption(other.getTinType());
		with.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("25")).fill(other.getTin());
		with.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("26")).fill(other.getLastName());
		with.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("27")).fill(other.getFirstName());
		with.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("28 M")).fill(other.getMiddleName());
		with.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("28a")).fill(other.getSuffix());
		with.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("33")).selectOption(other.getCountry());
		with.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("33")).dispatchEvent("blur");
		with.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("29")).fill(other.getAddress());
		with.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("30")).fill(other.getCity());
		with.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("32")).fill(other.getPostCode());
		with.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("31")).selectOption(other.getState());
	}
}
