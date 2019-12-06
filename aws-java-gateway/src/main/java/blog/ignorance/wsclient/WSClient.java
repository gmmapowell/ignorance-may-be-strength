package blog.ignorance.wsclient;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.glassfish.grizzly.CompletionHandler;
import org.glassfish.grizzly.Connection;
import org.glassfish.grizzly.Processor;
import org.glassfish.grizzly.filterchain.FilterChainBuilder;
import org.glassfish.grizzly.filterchain.TransportFilter;
import org.glassfish.grizzly.http.HttpClientFilter;
import org.glassfish.grizzly.impl.FutureImpl;
import org.glassfish.grizzly.nio.transport.TCPNIOConnectorHandler;
import org.glassfish.grizzly.nio.transport.TCPNIOTransport;
import org.glassfish.grizzly.nio.transport.TCPNIOTransportBuilder;
import org.glassfish.grizzly.ssl.SSLFilter;
import org.glassfish.grizzly.utils.Futures;
import org.glassfish.grizzly.websockets.Constants;
import org.glassfish.grizzly.websockets.DataFrame;
import org.glassfish.grizzly.websockets.HandshakeException;
import org.glassfish.grizzly.websockets.SimpleWebSocket;
import org.glassfish.grizzly.websockets.WebSocket;
import org.glassfish.grizzly.websockets.WebSocketAdapter;
import org.glassfish.grizzly.websockets.WebSocketClientFilter;
import org.glassfish.grizzly.websockets.WebSocketEngine;
import org.glassfish.grizzly.websockets.WebSocketException;
import org.glassfish.grizzly.websockets.WebSocketHolder;
import org.glassfish.grizzly.websockets.WebSocketListener;

public class WSClient extends SimpleWebSocket {
    private static final Logger logger = Logger.getLogger(Constants.WEBSOCKET);
    private final URI address;
    protected TCPNIOTransport transport;
	private WebSocketHandler handler;

    public WSClient(String uri, WebSocketListener... listeners) {
        super(WebSocketEngine.DEFAULT_VERSION.createHandler(true), listeners);
        try {
            address = new URI(uri);
        } catch (URISyntaxException e) {
            throw new WebSocketException(e.getMessage(), e);
        }
        handler = new WebSocketHandler();
		add(handler);
    }

    @SuppressWarnings("rawtypes")
	public void connect(long timeout, TimeUnit unit) {
        try {
            transport = TCPNIOTransportBuilder.newInstance().build();
            transport.start();
            final TCPNIOConnectorHandler connectorHandler = new TCPNIOConnectorHandler(transport) {
                @Override
                protected void preConfigure(Connection conn) {
                    super.preConfigure(conn);
                    protocolHandler.setConnection(conn);
                    final WebSocketHolder holder = WebSocketHolder.set(conn, protocolHandler, WSClient.this);
                    holder.handshake = protocolHandler.createClientHandShake(address);
                }
            };
            
            connectorHandler.setProcessor(handler.createFilterChain());
            int port = 443;
            if (address.getPort() != -1)
            	port = address.getPort();
            connectorHandler.connect(new InetSocketAddress(address.getHost(), port), handler);
            
            handler.await(timeout, unit);
        } catch (Throwable e) {
        	if (e instanceof ExecutionException)
        		 e = e.getCause();
            if (e instanceof HandshakeException) {
                throw (HandshakeException) e;
            } else
            	throw new RuntimeException("Error connecting", e);
        }
    }


    @SuppressWarnings("rawtypes")
	private class WebSocketHandler extends WebSocketAdapter implements CompletionHandler<Connection> {
        private final FutureImpl<Boolean> completeFuture = Futures.createSafeFuture();

        Processor createFilterChain() {
            FilterChainBuilder clientFilterChainBuilder = FilterChainBuilder.stateless();
            clientFilterChainBuilder.add(new TransportFilter());
    		clientFilterChainBuilder.add(new SSLFilter());
            clientFilterChainBuilder.add(new HttpClientFilter());
            clientFilterChainBuilder.add(new WebSocketClientFilter() {
                @Override
                protected void onHandshakeFailure(Connection connection, HandshakeException e) {
                    completeFuture.failure(e);
                }
            });

            return clientFilterChainBuilder.build();
        }

        public void await(long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException {
        	completeFuture.get(timeout, unit);
		}

        @Override
        public void onConnect(final WebSocket socket) {
            super.onConnect(socket);
            completeFuture.result(Boolean.TRUE);
        }

        @Override
        public void onClose(WebSocket socket, DataFrame frame) {
            super.onClose(socket, frame);
            if (transport != null) {
                try {
                    transport.shutdownNow();
                } catch (IOException e) {
                    logger.log(Level.INFO, e.getMessage(), e);
                }
            }
        }

        @Override
        public void failed(Throwable throwable) {
            handler.completeFuture.failure(throwable);
        }

        @Override
        public void cancelled() {
            handler.completeFuture.failure(new CancellationException());
        }

		@Override
		public void completed(Connection arg0) {
		}

		@Override
		public void updated(Connection arg0) {
		}
   }
}