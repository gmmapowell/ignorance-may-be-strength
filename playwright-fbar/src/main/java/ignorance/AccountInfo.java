package ignorance;

public class AccountInfo {
	String tin;
	String lastName;
	String firstName;
	String middleName = "";
	String suffix = "";
	String address;
	String city;
	String state;
	String postCode;
	String country;

	public String getTin() {
		return tin;
	}
	
	// a hack to always return "SSN"
	public String getTinType() {
		return "B";
	}
	
	public AccountInfo setTin(String tin) {
		this.tin = tin;
		return this;
	}
	
	public String getLastName() {
		return lastName;
	}
	
	public AccountInfo setLastName(String lastName) {
		this.lastName = lastName;
		return this;
	}
	
	public String getFirstName() {
		return firstName;
	}
	
	public AccountInfo setFirstName(String firstName) {
		this.firstName = firstName;
		return this;
	}

	public String getMiddleName() {
		return middleName;
	}
	
	public AccountInfo setMiddleName(String middleName) {
		this.middleName = middleName;
		return this;
	}
	
	public String getSuffix() {
		return suffix;
	}
	
	public AccountInfo setSuffix(String suffix) {
		this.suffix = suffix;
		return this;
	}
	
	public String getAddress() {
		return address;
	}
	
	public AccountInfo setAddress(String address) {
		this.address = address;
		return this;
	}
	
	public String getCity() {
		return city;
	}
	
	public AccountInfo setCity(String city) {
		this.city = city;
		return this;
	}
	
	public String getState() {
		return state;
	}
	
	public AccountInfo setState(String state) {
		this.state = state;
		return this;
	}
	
	public String getPostCode() {
		return postCode;
	}
	
	public AccountInfo setPostCode(String postCode) {
		this.postCode = postCode;
		return this;
	}
	
	public String getCountry() {
		return country;
	}
	
	public AccountInfo setCountry(String country) {
		this.country = country;
		return this;
	}
}
