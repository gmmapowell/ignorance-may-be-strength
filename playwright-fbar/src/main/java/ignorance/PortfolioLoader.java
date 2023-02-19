package ignorance;

public class PortfolioLoader {

	public Portfolio load() {
		Portfolio ret = new Portfolio();
		AccountInfo me = new AccountInfo();
		AccountInfo other = new AccountInfo();
		ret.user(me);
		
		ret.joint(
			new JointAsset().
			jointWith(other).
			setMaximumValue(10000).
			setType("A").
			setInstitution("ACME").
			setAccountNo("10103").
			setAddress("103 Disney Lane").
			setCity("Paris").
			setPostCode("00300").
			setCountry("FR "));
		ret.joint(
			new JointAsset().
			jointWith(other).
			setMaximumValue(20000).
			setType("B").
			setInstitution("Fireworks").
			setAccountNo("AA-L1403").
			setAddress("HauptStrasse 14").
			setCity("Frankfurt").
			setPostCode("FR2020").
			setCountry("DE "));
		return ret;
	}

}
