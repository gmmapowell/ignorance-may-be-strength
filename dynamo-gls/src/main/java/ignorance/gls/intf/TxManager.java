package ignorance.gls.intf;

public interface TxManager {
	UnitOfWork newUnit();

	UnitOfWork currentUOW();
}
