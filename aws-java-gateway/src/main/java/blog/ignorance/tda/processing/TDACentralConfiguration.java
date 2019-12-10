package blog.ignorance.tda.processing;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

import com.amazonaws.client.builder.AwsClientBuilder.EndpointConfiguration;
import com.amazonaws.services.apigatewaymanagementapi.AmazonApiGatewayManagementApi;
import com.amazonaws.services.apigatewaymanagementapi.AmazonApiGatewayManagementApiClientBuilder;
import com.amazonaws.services.apigatewaymanagementapi.model.GoneException;
import com.amazonaws.services.apigatewaymanagementapi.model.PostToConnectionRequest;

import blog.ignorance.tda.interfaces.Central;
import blog.ignorance.tda.interfaces.Initializer;
import blog.ignorance.tda.interfaces.RequestProcessor;
import blog.ignorance.tda.interfaces.ServerLogger;
import blog.ignorance.tda.interfaces.WSConnections;
import blog.ignorance.tda.interfaces.WSProcessor;
import blog.ignorance.tda.interfaces.WSResponder;
import blog.ignorance.tda.interfaces.WithCouchbase;

public class TDACentralConfiguration implements Central {
	private final List<Mapping> paths = new ArrayList<Mapping>();
	private Factory<? extends WSProcessor> wsfactory;
	private CouchbaseEnvironment couchbase = new CouchbaseEnvironment();

	public TDACentralConfiguration() {
		String init = System.getenv("InitializationClass");
		if (init != null) {
			try {
				((Initializer)Class.forName(init).newInstance()).initialize(this);
			} catch (InstantiationException | IllegalAccessException | ClassNotFoundException e) {
				// I'm not sure how easy it is to report this exception because we don't have the context at this point
				// Probably we should record it and report it on lambda invocation
				e.printStackTrace();
			}
		}
	}

	@Override
	public void allMethods(String path, Factory<? extends RequestProcessor> factory) {
		paths.add(new Mapping(path, factory));
	}

	@Override
	public void onGet(String path, Factory<? extends RequestProcessor> factory) {
		paths.add(new Mapping(path, factory, "GET"));
	}
	
	@Override
	public void websocket(Factory<? extends WSProcessor> factory) {
		wsfactory = factory;
	}

	public void applyCouchbase(WithCouchbase userHandler) {
		couchbase.provideBucketTo(userHandler);
	}

	public WSProcessor websocketHandler() {
		return wsfactory.create();
	}
	
	public RequestProcessor createHandlerFor(String method, String path) {
		Factory<? extends RequestProcessor> creator = null;
		for (Mapping m : paths) {
			if (m.matches(method, path)) {
				creator = m.creator;
				break;
			}
		}
		if (creator == null)
			return null;
		return creator.create();
	}

	public WSConnections websocketSender(ServerLogger logger) {
		return new WSConnections() {
			@Override
			public boolean sendTo(String connection, String data) {
				String[] split = connection.split(":");
				return sendMessageTo(logger, split[0], split[1], data, "error sending to " + connection);
			}
		};
	}

	public WSResponder responderFor(ServerLogger logger, String connId, String domainName, String stage) {
		return new WSResponder() {
			@Override
			public boolean send(String text) {
				return sendMessageTo(logger, domainName + "/" + stage, connId, text, "error responding");
			}

			@Override
			public String connectionName() {
				return domainName + "/" + stage + ":" + connId;
			}
			
			@Override
			public void close() {
			}
		};
	}
	
	private boolean sendMessageTo(ServerLogger logger, String endpoint, String connId, String text, String hint) {
		try {
			AmazonApiGatewayManagementApi wsapi = AmazonApiGatewayManagementApiClientBuilder.standard().withEndpointConfiguration(new EndpointConfiguration(endpoint, System.getenv("AWS_REGION"))).build();
			PostToConnectionRequest msg = new PostToConnectionRequest();
			msg.setConnectionId(connId);
			msg.setData(ByteBuffer.wrap(text.getBytes()));
			wsapi.postToConnection(msg);
			return true;
		} catch (GoneException ex) {
			return false;
		} catch (Throwable t) {
			logger.log(hint, t);
			return true;
		}
	}

}
