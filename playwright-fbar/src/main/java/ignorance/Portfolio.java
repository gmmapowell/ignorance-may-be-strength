package ignorance;

import java.util.ArrayList;
import java.util.List;

public class Portfolio {
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
}
