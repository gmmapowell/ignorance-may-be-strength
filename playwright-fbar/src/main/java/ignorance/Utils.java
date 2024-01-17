package ignorance;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class Utils {

	public static void copyFile(File from, File to) throws IOException {
		try (FileInputStream fis = new FileInputStream(from);
			 FileOutputStream fos = new FileOutputStream(to)) {
			byte[] bs = new byte[500];
			int cnt = 0;
			while ((cnt = fis.read(bs, 0, 500)) > 0)
				fos.write(bs, 0, cnt);
		}
	}

}
