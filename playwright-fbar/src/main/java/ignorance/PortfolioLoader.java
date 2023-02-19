package ignorance;

public class PortfolioLoader {

	public Portfolio load() {
		Portfolio ret = new Portfolio();
		AccountInfo me = new AccountInfo();
		AccountInfo other = new AccountInfo();

		ret.setEmail("mickey.mouse@disney.com");
		ret.setPhone("7705551234");
		ret.setFilingName("Mouse FBAR 2022");
		ret.setFilingYear(2023);
//		ret.setFilerType("A");
		ret.setDOB("08", "05", "1974");
		
		ret.user(me);
		ret.user(other);
		
		me.setTin("555330123");
		me.setLastName("Mouse");
		me.setMiddleName("A");
		me.setFirstName("Mickey");
		me.setAddress("1900 Animal Kingdom");
		me.setCity("Kissimee");
		me.setState("GA ");
		me.setPostCode("30891");
		me.setCountry("US ");
		
		other.setTin("999556720");
		other.setLastName("Mouse");
		other.setMiddleName("B");
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
