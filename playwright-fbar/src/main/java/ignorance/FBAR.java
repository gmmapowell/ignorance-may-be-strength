package ignorance;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.LineNumberReader;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Download;
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
		
		int slowMo = 0; // 500;

		try (Playwright playwright = Playwright.create()) {
			Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(false).setSlowMo(slowMo));
			BrowserContext cxt = browser.newContext();
			
			Page page = cxt.newPage();
			
			page.navigate("https://bsaefiling.fincen.gov/PublicAccess");
			page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("AGREE AND CONTINUE")).click();
			
			page.getByTestId("button").click();

			page.locator("button").nth(0).click();
			
			page.getByTitle("Sign in or Create Account").click();

			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Email address").setExact(true)).fill(portfolio.email());
			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Password").setExact(true)).fill(password);
			page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit")).click();

			System.out.print("Login.gov one-time code, please, from Authenticator: ");
			String otc = lnr.readLine();
			
			page.bringToFront();
			
			page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("One-time code").setExact(true)).fill(otc);
			page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit")).click();
			
			// Now wait to be fully logged in ...
			page.getByTestId("file-now-button").click();

			Page form = cxt.newPage();
			
			form.navigate("https://bsaefiling.fincen.treas.gov/NoRegFBARFiler.html");
			Thread.sleep(2000);
			form.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName(" Prepare & Submit ")).click();

			System.out.println("New Page: " + form.url() + " -- " + form.title());
			form.getByTestId("agree-button").click();

			form.getByTestId("textInput").fill(portfolio.filingName());
			form.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Next")).click();

			form.locator("input[name='filerInfo.calendarYear']").fill(Integer.toString(portfolio.getFilingYear()));

			form.getByTitle("Item 2").click();
			form.locator("ul[id='filerInfo.filerType--list'] li[value='A']").click();

			form.getByTitle("Item 3a").click();
			form.locator("ul[id='filerInfo.domesticTinType--list'] li[value='B']").click();
			form.locator("input[name='filerInfo.domesticTin']").fill(user.getTin());

			form.getByTestId("lastNameInput").fill(user.getLastName());
			form.getByTestId("firstNameInput").fill(user.getFirstName());
			form.getByTestId("middleNameInput").fill(user.getMiddleName());
			form.getByTestId("suffixInput").fill(user.getSuffix());
			form.locator("input[id='filerInfo.dob']").fill(portfolio.getMonth() + "/" + portfolio.getDate() + "/" + portfolio.getYear());

			form.getByTitle("Item 13 -").click();
			form.locator("ul[id='filerInfo.country--list'] li[value='US']").click();

			form.getByTitle("Item 11 -").click();
			form.locator("ul[id='filerInfo.state--list'] li[value='" + user.getState().trim() + "']").click();

			form.locator("input[name='filerInfo.address']").fill(user.getAddress());
			form.locator("input[name='filerInfo.city']").fill(user.getCity());
			form.locator("input[name='filerInfo.zipCode']").fill(user.getPostCode());

			form.locator("input[id='filerInfo.hasFinancialInterest.no']").dispatchEvent("click");
			form.locator("input[id='filerInfo.hasFinancialSignatureNoInterest.no']").dispatchEvent("click");
			
			form.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Next")).click();

			int which = 0;
			for (Asset solo : portfolio.solos()) {
				throw new RuntimeException("cannot handle solos anymore: " + solo);
				
				// TODO: we basically need to copy the code from down below, but without the fillJoint() bit and replace "jointAccounts" with "soloAccounts"
				/*
				form.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("*15")).fill(Integer.toString(solo.getMaximumValue()));
				form.getByRole(AriaRole.COMBOBOX, new Locator.GetByRoleOptions().setName("*16")).selectOption(solo.getType());
				form.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("*17")).fill(solo.getInstitution());
				form.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("Item 18")).fill(solo.getAccountNo());
				if (solo.hasAddress())
					form.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("19")).fill(solo.getAddress());
				if (solo.hasCity())
					form.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("20")).fill(solo.getCity());
				if (solo.hasState())
				form.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("21")).fill(solo.getState());
				if (solo.hasPostCode())
					form.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("22")).fill(solo.getPostCode());
				form.locator("div.choicelist.Country select").selectOption(solo.getCountry());
				*/
			}
			
			which = 0;
			for (JointAsset joint : portfolio.joints()) {
				form.getByTestId("joint-account-add").click();
				
				form.locator("input[name='jointAccounts[" + which + "].maximumAccountValue']").fill(Integer.toString(joint.getMaximumValue()));
				form.locator("input[name='jointAccounts[" + which + "].financialInstituteName']").fill(joint.getInstitution());
				form.locator("input[name='jointAccounts[" + which + "].accountNumber']").fill(joint.getAccountNo());
				if (joint.hasAddress())
					form.locator("input[name='jointAccounts[" + which + "].address']").fill(joint.getAddress());
				if (joint.hasCity())
					form.locator("input[name='jointAccounts[" + which + "].city']").fill(joint.getCity());
				if (joint.hasPostCode())
					form.locator("input[name='jointAccounts[" + which + "].zipCode']").fill(joint.getPostCode());

				form.locator("input[id='jointAccounts[" + which + "].typeOfAccount']").click();
				form.locator("ul[id='jointAccounts[" + which + "].typeOfAccount--list'] li[value='" + joint.getType() +"']").click();

				form.locator("input[id='jointAccounts[" + which + "].country']").click();
				form.locator("ul[id='jointAccounts[" + which + "].country--list'] li[value='" + joint.getCountry() +"']").click();

				if (joint.hasState()) {
					form.locator("input[id='jointAccounts[" + which + "].state']").click();
					form.locator("ul[id='jointAccounts[" + which + "].state--list'] li[value='" + joint.getState() +"']").click();
				}

				form.locator("input[name='jointAccounts[" + which + "].numberOfOwners']").fill(Integer.toString(joint.getNumOthers()));

				fillJoint(form, which, joint.getOther());

				which ++;
			}

			// move onto 3rd party preparer page ...
			form.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Next")).click();

			// and then onto signature page
			form.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Next")).click();

			form.getByTestId("email-address-input").fill(portfolio.email());
			form.getByTestId("confirm-email-address-input").fill(portfolio.email());
			form.locator("input[name='lastName']").fill(user.getLastName());
			form.locator("input[name='firstName']").fill(user.getFirstName());
			form.locator("input[name='phone']").fill(portfolio.phone());
			
			form.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Finalize")).click();
			
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

	private static void fillJoint(Page form, int which, AccountInfo other) {
		form.getByTitle("Item 25a").nth(which).click();
		form.locator("ul[id='jointAccounts[" + which + "].principalJointOwner.tinType--list'] li[value='B']").click();
		form.locator("input[name='jointAccounts[" + which +"].principalJointOwner.tin']").fill(other.getTin());

		form.locator("input[name='jointAccounts[" + which + "].principalJointOwner.lastNameOrOrgName']").fill(other.getLastName());
		form.locator("input[name='jointAccounts[" + which + "].principalJointOwner.firstName']").fill(other.getFirstName());
		form.locator("input[name='jointAccounts[" + which + "].principalJointOwner.middleName']").fill(other.getMiddleName());
		form.locator("input[name='jointAccounts[" + which + "].principalJointOwner.suffix']").fill(other.getSuffix());

		form.locator("input[name='jointAccounts[" + which + "].principalJointOwner.address']").fill(other.getAddress());
		form.locator("input[name='jointAccounts[" + which + "].principalJointOwner.city']").fill(other.getCity());
		form.locator("input[name='jointAccounts[" + which + "].principalJointOwner.zipCode']").fill(other.getPostCode());

		form.locator("input[id='jointAccounts[" + which + "].principalJointOwner.country']").click();
		form.locator("ul[id='jointAccounts[" + which + "].principalJointOwner.country--list'] li[value='" + other.getCountry() +"']").click();
		form.locator("input[id='jointAccounts[" + which + "].principalJointOwner.state']").click();
		form.locator("ul[id='jointAccounts[" + which + "].principalJointOwner.state--list'] li[value='" + other.getState() +"']").click();
	}
}
