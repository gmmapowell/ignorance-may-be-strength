class MockStockQuoter {
    constructor() {
        this.eiqq = 2205;
    }

    provideQuotesTo(lsnr) {
        var me = this;
        lsnr.quotes([{ticker: "EIQQ", price: 2197}, {ticker: "MODD", price: 1087}, {ticker: "QUTI", price: 3030}]);


        setTimeout(() => me.nextQuote(lsnr), 1500);
    }

    nextQuote(lsnr) {
        lsnr.quotes([{ticker: "EIQQ", price: this.eiqq}]);
        this.eiqq += 10;
        if (this.eiqq < 2300) {
            setTimeout(() => this.nextQuote(lsnr), 3000);
        }
    }
}

export { MockStockQuoter }