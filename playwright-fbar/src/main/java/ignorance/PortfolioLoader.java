package ignorance;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.LineNumberReader;
import java.io.StringWriter;
import java.util.List;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

public class PortfolioLoader {

	public Portfolio loadDummy() {
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

	public Portfolio loadJson(File file) throws JSONException, IOException {
		Portfolio ret = new Portfolio();
		JSONObject json = new JSONObject(readFile(file));
		System.out.println(json);
		ret.setEmail(json.getString("email"));
		ret.setPhone(json.getString("phone"));
		ret.setFilingName(json.getString("filingName"));
		ret.setFilingYear(json.getInt("filingYear"));
		ret.setYear(json.getString("year"));
		ret.setMonth(json.getString("month"));
		ret.setDate(json.getString("date"));
		JSONArray us = json.getJSONArray("users");
		for (int i=0;i<us.length();i++) {
			JSONObject u = us.getJSONObject(i);
			AccountInfo ai = new AccountInfo();
			ai.setTin(u.getString("tin"));
			ai.setFirstName(u.getString("firstName"));
			ai.setMiddleName(u.getString("middleName"));
			ai.setLastName(u.getString("lastName"));
			ai.setAddress(u.getString("address"));
			ai.setCity(u.getString("city"));
			ai.setState(u.getString("state") + " ");
			ai.setPostCode(u.getString("postCode"));
			ai.setCountry(u.getString("country") + " ");
			ret.user(ai);
		}
		JSONArray js = json.getJSONArray("joints");
		for (int i=0;i<js.length();i++) {
			JSONObject j = js.getJSONObject(i);
			JointAsset ja = new JointAsset();
			int w = j.getInt("with");
			ja.jointWith(ret.userNo(w));
			ja.setMaximumValue(j.getInt("maximumValue"));
			ja.setType(j.getString("type"));
			ja.setInstitution(j.getString("institution"));
			ja.setAccountNo(j.getString("accountNo"));
			ja.setAddress(j.getString("address"));
			ja.setCity(j.getString("city"));
			ja.setPostCode(j.getString("postCode"));
			ja.setCountry(j.getString("country") + " ");
			ret.joint(ja);
		}
		return ret;
	}

	private String readFile(File file) throws IOException {
		StringWriter sw = new StringWriter();
		try (LineNumberReader lnr = new LineNumberReader(new FileReader(file))) {
			String s;
			while ((s = lnr.readLine()) != null) {
				sw.write(s);
				sw.write('\n');
			}
		}
		return sw.toString();
	}
}
