package ignorance;

public class PortfolioLoader {

	public Portfolio load() {
		Portfolio ret = new Portfolio();
		AccountInfo me = new AccountInfo();
		AccountInfo other = new AccountInfo();

		ret.user(me);
		ret.user(other);
		
		other.setTin("999-55-6720");
		other.setLastName("Mouse");
		other.setFirstName("Minnie");
		other.setAddress("2030 Celebration Way");
		other.setCity("Orlando");
		other.setState("FL ");
		other.setPostCode("20890");
		other.setCountry("US ");
		
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
