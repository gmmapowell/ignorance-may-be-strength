import { MockStockQuoter } from './mockstockquoter.js';
import { QuoteWatcher } from './quotewatcher.js';

window.addEventListener("load", () => {
    var table = document.querySelector(".stock-table tbody");
    var templ = document.getElementById("stockrow");
    var quoteWatcher = new QuoteWatcher(table, templ);
    new MockStockQuoter().provideQuotesTo(quoteWatcher);
});