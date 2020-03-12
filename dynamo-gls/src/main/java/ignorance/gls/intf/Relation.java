package ignorance.gls.intf;

import java.util.function.Function;

import ignorance.exceptions.GLSException;

/** A relation is the fundamental building block of GLS.
 * Its purpose is to define a set of "GET" operations to load data from the database,
 * "LOGIC" operations to manipulate that data, and "CREATE", "UPDATE", "DELETE" and "SUBSCRIBE"
 * operations to store in the database.
 * 
 * It works by keeping an in-memory store of what has already been read from the database
 * (or directly loaded) and calling logic methods exactly once when they are ready and providing
 * them with the values they have requested by name.
 * 
 * @author gareth
 */
public interface Relation {

	/** Get an object from the store
	 * This causes the get to be invoked asynchronously upon enact.
	 * When the get returns, any logic which is waiting for it will be started.
	 * 
	 * @param slot the name of the slot to load into
	 * @param id the id to get
	 */
	void get(String slot, String id);
	
	/** It is possible to receive values that are not really what you want.
	 * Rather than making every logic block handle the discrepancy, it is possible
	 * to filter the result directly on return
	 * 
	 * @param slot the name of the slot to load the filtered value into
	 * @param id the id to get
	 * @param filter a mapping from the returned value to the desired value
	 */
	void get(String slot, String id, Function<?, ?> filter);

	/** Load an object directly into the relation by type.
	 * This is useful for passing around "state" variables without putting them in an object's state. 
	 * 
	 * @param slot the name of the slot to load into
	 * @param value the value to load
	 */
	void load(Object value);

	/** Load an object directly into a slot.
	 * This is useful for logic which can have defaults as well as doing a "GET";
	 * it can also be useful for passing around "state" variables 
	 * 
	 * @param slot the name of the slot to load into
	 * @param value the value to load
	 */
	void load(String slot, Object value);

	/** Add a logic block based on a function in the current RelationHandler.
	 * The method is found and examined using reflection to determine the parameters it requires.
	 * It will automatically receive this object in any parameter which has the type Relation.
	 * 
	 * Note that the logic block will automatically depend upon (and wait for) any slots which it references to be filled.
	 * 
	 * @param method the method to use as a logic block
	 * @throws GLSException if the logic method does not exist or cannot be configured
	 */
	void logic(String method) throws GLSException;

	/** Add a logic block based on a function in the named RelationHandler.
	 * The method is found and examined using reflection to determine the parameters it requires.
	 * It will automatically receive this object in any parameter which has the type Relation.
	 * 
	 * Note that the logic block will automatically depend upon (and wait for) any slots which it references to be filled.
	 * 
	 * @param method the method to use as a logic block
	 * @throws GLSException if the logic method does not exist or cannot be configured
	 */
	void logic(RelationHandler handler, String method) throws GLSException;
	
	void create(String id, Object value);

	/** Update an object in the database.
	 * This can throw transient errors if the object has changed in the meantime
	 * 
	 * @param id the id to store into
	 * @param saveAs the object to save
	 */
	void update(String id, Object saveAs);
	
	/** Delete an object in the database
	 * 
	 * @param id the id of the object to delete
	 */
	void delete(String id);

	/** Some logic, such as responding to users, can only be performed once the transaction has committed.
	 * This methods adds method hooks for this purpose.
	 * 
	 * They can receive slots but they <em>cannot</em> add new operations.
	 * @param method the name of the method to call after the transaction has committed
	 * @throws GLSException  if the logic method does not exist or cannot be configured
	 */
	void whenCommitted(String method) throws GLSException;

	/** Like whenComitted, but only when the transaction rolled back.
	 * 
	 * They can receive slots but they <em>cannot</em> add new operations.
	 * @param method the name of the method to call after the transaction has committed
	 * @throws GLSException  if the logic method does not exist or cannot be configured
	 */
	void whenRolledBack(String string) throws GLSException;

	/** Like whenComitted, but called regardless of whether the transaction commits or rolls back.
	 * 
	 * They can receive slots but they <em>cannot</em> add new operations.
	 * @param method the name of the method to call after the transaction has committed
	 * @throws GLSException  if the logic method does not exist or cannot be configured
	 */
	void atEnd(String method) throws GLSException;
}
