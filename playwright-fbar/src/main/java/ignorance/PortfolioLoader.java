package ignorance;

public class PortfolioLoader {

	public Portfolio load() {
		Portfolio ret = new Portfolio();
		AccountInfo me = new AccountInfo();
		AccountInfo other = new AccountInfo();
		ret.user(me);
		
		ret.joint(new JointAsset().jointWith(other).setMaximumValue(10000).setType("A"));
		ret.joint(new JointAsset().jointWith(other).setMaximumValue(20000).setType("B"));
		return ret;
	}

}
