package ignorance;

public class Asset {
	int maximumValue;
	String type;
	String institution;
	String accountNo;
	String address;
	String city;
	String state;
	String postCode;
	String country;
	
	public String getAccountNo() {
		return accountNo;
	}

	public Asset setAccountNo(String accountNo) {
		this.accountNo = accountNo;
		return this;
	}

	public boolean hasAddress() {
		return address != null;
	}
	
	public String getAddress() {
		return address;
	}

	public Asset setAddress(String address) {
		this.address = address;
		return this;
	}

	public boolean hasCity() {
		return city != null;
	}
	
	public String getCity() {
		return city;
	}

	public Asset setCity(String city) {
		this.city = city;
		return this;
	}

	public boolean hasState() {
		return state != null;
	}
	
	public String getState() {
		return state;
	}

	public Asset setState(String state) {
		this.state = state;
		return this;
	}

	public boolean hasPostCode() {
		return postCode != null;
	}
	
	public String getPostCode() {
		return postCode;
	}

	public Asset setPostCode(String postCode) {
		this.postCode = postCode;
		return this;
	}

	public String getCountry() {
		return country;
	}

	public Asset setCountry(String country) {
		this.country = country;
		return this;
	}

	public Asset setType(String string) {
		this.type = string;
		return this;
	}

	public Asset setMaximumValue(int i) {
		this.maximumValue = i;
		return this;
	}

	public Asset setInstitution(String s) {
		this.institution = s;
		return this;
	}

	public int getMaximumValue() {
		return maximumValue;
	}

	public String getType() {
		return type;
	}
	
	public String getInstitution() {
		return institution;
	}
}
