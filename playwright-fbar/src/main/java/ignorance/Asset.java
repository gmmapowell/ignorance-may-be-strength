package ignorance;

public class Asset {
	int maximumValue;
	String type;
	
	public Asset setType(String string) {
		this.type = string;
		return this;
	}

	public Asset setMaximumValue(int i) {
		this.maximumValue = i;
		return this;
	}

	public int getMaximumValue() {
		return maximumValue;
	}

	public String getType() {
		return type;
	}
	
	
}
