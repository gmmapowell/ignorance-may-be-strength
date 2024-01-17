package ignorance;

import java.io.File;
import java.io.IOException;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Download;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;

public class TestDownloads {
	public static void main(String[] args) {
		try (Playwright playwright = Playwright.create()) {
			Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(false).setSlowMo(50));

			Page page = browser.newPage();
			page.navigate("https://pixabay.com/photos/flowers-meadow-sunlight-summer-276014/");
			
			Download download = page.waitForDownload(() -> { });
			File isAt = download.path().toFile();
			File saveAs = new File("/tmp", isAt.getName());
			System.out.println("Copying " + isAt + " to " + saveAs);
			try {
				Utils.copyFile(download.path().toFile(), saveAs);
			} catch (IOException e) {
				e.printStackTrace();
			}
			page.waitForClose(() -> { });
		}
	}
}
