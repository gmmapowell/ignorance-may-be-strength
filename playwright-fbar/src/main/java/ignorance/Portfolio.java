package ignorance;

import java.util.ArrayList;
import java.util.List;

public class Portfolio {
	private String email;
	private String phone;
	private String filingName;
	private List<AccountInfo> users = new ArrayList<>();
	private List<JointAsset> joints = new ArrayList<>();

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
		return users.get(0);
	}

	public String filingName() {
		return filingName;
	}

	public void setFilingName(String string) {
		this.filingName = string;
	}
}
