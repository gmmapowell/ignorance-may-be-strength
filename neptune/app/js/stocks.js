// import { MockStockQuoter } from './mockstockquoter.js';
import { WebsocketStockQuoter } from './webstockquoter.js';
import { QuoteWatcher } from './quotewatcher.js';

window.addEventListener("load", () => {
    var table = document.querySelector(".stock-table tbody");
    var templ = document.getElementById("stockrow");
    var quoteWatcher = new QuoteWatcher(table, templ);
    var quoter = new WebsocketStockQuoter("wss://n2n2psybtd.execute-api.us-east-1.amazonaws.com/development/");
    // var quoter = new MockStockQuoter();
    quoter.provideQuotesTo(quoteWatcher);
});