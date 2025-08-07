class WebsocketStockQuoter {
    constructor(wsuri) {
        this.conn = new WebSocket(wsuri);
        this.conn.onmessage = msg => {
            console.log(msg);
            if (this.lsnr) {
                var data = JSON.parse(msg.data);
                if (data.action && data.action === 'quotes') {
                    this.lsnr.quotes(data.quotes)
                }
            }
        }
        this.conn.onopen = () => {
            console.log("telling lambda who we are - expect quotes after this");
            this.conn.send(JSON.stringify({"action":"user","id":"user003"}));
        }
        this.conn.onclose = err => {
            console.log("closing because", err);
        }
    }

    provideQuotesTo(lsnr) {
        this.lsnr = lsnr
    }
}

export { WebsocketStockQuoter }