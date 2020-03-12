package test.ignorance.gls;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ignorance.exceptions.GLSException;
import ignorance.gls.annotations.Slot;
import ignorance.gls.impl.GLUnitOfWork;
import ignorance.gls.intf.Relation;
import ignorance.gls.intf.RelationHandler;
import ignorance.tdastore.common.UOWExecutor;
import ignorance.tdastore.dynamo.AWSTxManager;
import ignorance.tdastore.dynamo.AWSTxStorage;
import test.ignorance.gls.helpers.DynamoTools;
import test.ignorance.gls.samples.Hello;

@TestMethodOrder(OrderAnnotation.class)
public class SimpleGLSUsage implements RelationHandler {
	public static final Logger logger = LoggerFactory.getLogger("Test");
	final Executor exec = Executors.newFixedThreadPool(10);
	final Executor blocking = Executors.newFixedThreadPool(10);
	final UOWExecutor uowexec = new UOWExecutor(exec, blocking);
	final static String tableName = System.getProperty("test.table.name");
	private AWSTxStorage storage;
	private AWSTxManager txmgr;
	private GLUnitOfWork uow;
	
	@BeforeAll
	public static void clearTable() {
		DynamoTools tools = new DynamoTools();
		tools.cleanTable(tableName);
	}

	@BeforeEach
	public void initTest() {
		storage = new AWSTxStorage(uowexec, tableName);
		txmgr = new AWSTxManager(storage, exec, uowexec);
		uow = (GLUnitOfWork) txmgr.newUnit();
	}
	
	@Test
	@Order(1)
	public void weCanCreateSomethingTrivial() throws GLSException {
		logger.info("Test 1");
		Hello hello = new Hello(uow);
		hello.greeting("hi there");
		Relation r = uow.relation(storage, null);
		r.create("helloItem", hello);
		uow.enact();
		uow.waitForResult();
	}

	@Test
	@Order(2)
	public void weCanRecoverTheGreeting() throws GLSException {
		logger.info("Test 2");
		Relation r = uow.relation(storage, null);
		r.get("item", "helloItem");
		uow.enact();
		uow.waitForResult();
	}

	@Test
	@Order(3)
	public void weCanRecoverTheGreetingAndActOnIt() throws GLSException {
		logger.info("Test 3");
		Relation r = uow.relation(storage, this);
		r.logic("printHello");
		r.get("item", "helloItem");
		uow.enact();
		uow.waitForResult();
	}
	
	public void printHello(@Slot("item") Hello item) {
		System.out.println("the greeting is " + item.greeting());
	}

	@Test
	@Order(4)
	public void weCanRecoverTheGreetingAndCheckIt() throws GLSException {
		logger.info("Test 4");
		Relation r = uow.relation(storage, this);
		r.load("expected", "hi there");
		r.logic("checkMessage");
		r.get("item", "helloItem");
		uow.enact();
		uow.waitForResult();
	}
	
	public void checkMessage(@Slot("expected") String expected, @Slot("item") Hello item) {
		assertEquals(expected, item.greeting());
	}

	@Test
	@Order(5)
	public void weCanChangeTheGreeting() throws GLSException {
		logger.info("Test 5");
		Relation r = uow.relation(storage, this);
		r.load("makeIt", "almost done");
		r.logic("changeMessage");
		r.get("item", "helloItem");
		uow.enact();
		uow.waitForResult();
	}
	
	public void changeMessage(Relation r, @Slot("item") Hello item, @Slot("makeIt") String changeTo) {
		item.greeting(changeTo);
		r.update("helloItem", item);
	}

	@Test
	@Order(6)
	public void checkTheUpdateReallyChangedTheGreeting() throws GLSException {
		logger.info("Test 6");
		Relation r = uow.relation(storage, this);
		r.load("expected", "almost done");
		r.logic("checkMessage");
		r.get("item", "helloItem");
		uow.enact();
		uow.waitForResult();
	}

	@Test
	@Order(7)
	public void weCanCleanTheMessageUp() throws GLSException {
		logger.info("Test 7");
		Relation r = uow.relation(storage, this);
		r.delete("helloItem");
		uow.enact();
		uow.waitForResult();
	}
	
}
