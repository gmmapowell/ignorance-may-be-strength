package blog.ignorance.tda.interfaces;

/** Enhance a RequestProcessor by processing query or post parameters.
 * If a given parameter name has exactly one value, {@link #uniParameter} will be called;
 * if it has multiple values, {@link #multiParameter} will be called.
 * If it is not specified, nothing will be called.
 * 
 * @author gareth
 *
 */
public interface ProvideParameters {
	/** Set a value of an string pattern argument
	 * 
	 * @param name the name of the parameter
	 * @param value the value of the parameter
	 * @param source where the parameter came from
	 */
	public void stringValue(String name, String value, ParameterSource source);
}
