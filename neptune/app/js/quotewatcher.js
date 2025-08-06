class QuoteWatcher {
    constructor(table, templ) {
        this.table = table;
        this.templ = templ;
        this.curr = [];
    }

    quotes(lq) {
        for (var q of lq) {
            var matched = false;
            for (var r of this.curr) {
                if (q.ticker == r.ticker) {
                    this.updatePrice(r.elt, q.price);
                    fadeColor(r.elt.querySelector(".price"), "green");
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                var node = this.templ.content.cloneNode(true).children[0];
                node.querySelector(".ticker").innerText = q.ticker;
                this.updatePrice(node, q.price);
                this.table.appendChild(node);

                this.curr.push({ticker: q.ticker, price: q.price, elt: node});
            }
        }
    }

    updatePrice(node, price) {
        var quote = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price/100)
        node.querySelector(".price").innerText = quote;
    }
}

function fadeColor(elt, style) {
    elt.classList.add(style);
    elt.classList.remove("faded");
    setTimeout(() => {
        elt.classList.add("faded");
    }, 10);
}

export { QuoteWatcher } 