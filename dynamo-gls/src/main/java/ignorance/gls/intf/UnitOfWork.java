package ignorance.gls.intf;

import ignorance.exceptions.GLSException;
import ignorance.marshalling.intf.FieldsContainer;
import ignorance.tdastore.intf.ExistingRecord;
import ignorance.tdastore.intf.TDAStorage;

public interface UnitOfWork  {
	/** Create a new fields container object
	 * 
	 * @return a new fields container object
	 */
	FieldsContainer newFieldsContainer();

	/** Create a new relation within the unit of work
	 * 
	 * @param storage a TDAStorage to use
	 * @param handler the handler object which will be used for logic callbacks
	 * @return the new relation
	 */
	Relation relation(TDAStorage storage, RelationHandler handler);

	/** Say that the unit of work is ready to go
	 * @throws GLSException 
	 */
	void waitForResult() throws GLSException;
	
	/** Act on everything that has been set up
	 */
	void enact();
	
	/** Allow methods to be fired at the end of the transaction
	 * 
	 * @param handler a RelationHandler in which to find the method
	 * @param method the method to fire
	 * @throws GLSException 
	 */
	void atEnd(RelationHandler handler, String method) throws GLSException;

	/** Allow methods to be fired at the end of a successful transaction
	 * 
	 * @param handler a RelationHandler in which to find the method
	 * @param method the method to fire
	 * @throws GLSException 
	 */
	void whenCommitted(RelationHandler handler, String method) throws GLSException;

	/** Allow methods to be fired at the end of a failed transaction
	 * 
	 * @param handler a RelationHandler in which to find the method
	 * @param method the method to fire
	 * @throws GLSException 
	 */
	void whenRolledBack(RelationHandler handler, String method) throws GLSException;

	/** In an ideal world, all data would be passed to logic methods waiting for it.
	 * Unfortunately, particularly in a synchronous world, it is necessary to read values from a relation
	 * <i>after</i> the unit is complete.
	 *
	 * @param r the relation the variable is in
	 * @param slot the slot to read
	 * @return the value in the slot
	 */
	Object read(Relation r, String slot);

	/** If it is necessary to create a relation while the UOW is active,
	 * it is necessary to call this method when it is configured to put it into
	 * the active state
	 * 
	 * @param r the relation to make ready
	 */
	void makeReady(Relation r);

	<T> void remember(String id, ExistingRecord retr);

	/** Assert that the uow has completed
	 * 
	 * @return true if the UOW has completed; false otherwise
	 */
	boolean hasCompleted();

	/** When the unit is completed
	 */
	void txdone();
}