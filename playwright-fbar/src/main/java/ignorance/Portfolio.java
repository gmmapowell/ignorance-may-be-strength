package ignorance;

import java.util.ArrayList;
import java.util.List;

public class Portfolio {
	private String email;
	private String phone;
	private String filingName;
	private List<AccountInfo> users = new ArrayList<>();
	private List<JointAsset> joints = new ArrayList<>();
	private int filingYear;
	private String month;
	private String date;
	private String year;

	public void user(AccountInfo accountInfo) {
		this.users.add(accountInfo);
	}

	public void joint(JointAsset joint) {
		this.joints.add(joint);
	}

	public Iterable<JointAsset> joints() {
		return this.joints;
	}

	public String email() {
		return email;
	}

	public String phone() {
		return phone;
	}

	public void setEmail(String string) {
		this.email = string;
	}

	public void setPhone(String string) {
		this.phone = string;
	}

	public AccountInfo getUser() {
		if (users.isEmpty())
			throw new RuntimeException("There are no users");
		return users.get(0);
	}

	public AccountInfo userNo(int w) {
		if (users.isEmpty())
			throw new RuntimeException("There are no users");
		return users.get(w);
	}

	public String filingName() {
		return filingName;
	}

	public void setFilingName(String string) {
		this.filingName = string;
	}

	public void setFilingYear(int y) {
		this.filingYear = y;
	}

	public void setDOB(String month, String date, String year) {
		this.month = month;
		this.date = date;
		this.year = year;
	}

	public String getMonth() {
		return month;
	}

	public void setMonth(String month) {
		this.month = month;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public String getYear() {
		return year;
	}

	public void setYear(String year) {
		this.year = year;
	}

	public int getFilingYear() {
		return filingYear;
	}
}
