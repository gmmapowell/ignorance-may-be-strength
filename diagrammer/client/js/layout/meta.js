class MetaModel {
	constructor(nodes, nameMap, edges) {
		this.nodes = nodes;
		this.nameMap = nameMap;
		this.edges = edges;
		this.conns = this.groupByConnections(nodes, edges);
		this.sorted = this.sortConnections(this.conns);
		this.radices = this.gatherRadices(this.sorted);
		this.links = this.figureLinks();
	}

	figureLinks() {
		var ret = {};
		for (var n of Object.keys(this.nameMap)) {
			ret[n] = [];
		}
		for (var e of this.edges) {
			for (var ee of e.ends) {
				for (var qq of e.ends) {
					if (ee != qq && !ret[ee.name].includes(qq.name))
						ret[ee.name].push(qq.name);
				}
			}
		}

		console.log(ret);
		return ret;
	}

	// build a map of nodes to all the nodes it is connected to
	groupByConnections(nodes, edges) {
		var conns = {};
		for (var i=0;i<nodes.length;i++) {
			var n = nodes[i];
			conns[n.name] = [];
		}
		for (var e of edges) {
			for (var end of e.ends) {
				var c = conns[end.name];
				for (var ke of e.ends) {
					if (ke.name != end.name && !c.includes(ke.name)) {
						var dir = this.figureDir(e.dir, ke.dir);
						conns[end.name].push({ name: ke.name, dir });
					}
				}
			}
		}
		return conns;
	}


	// Sort the nodes by number of connections.  Use a radix sort for speed and fit.
	sortConnections(conns) {
		var sorted = {};
		var keys = Object.keys(conns);
		for (var i=0;i<keys.length;i++) {
			var k = keys[i];
			var cs = conns[k].length;
			if (!sorted[cs]) sorted[cs] = [];
			sorted[cs].push(k);
		}
		return sorted;
	}

	// Build a sorted array of the radices produced
	gatherRadices(sorted) {
		return Object.keys(sorted).sort((a,b) => b-a);
	}

	figureDir(compass, endFacing) {
		if (!compass)
			return null;

		if (endFacing == 'to')
			return compass;
		else
			return compass.invert();
	}

	isEmpty() {
		return this.nodes.length == 0;
	}

	connectedTo(name) {
		return this.conns[name];
	}
}

export { MetaModel };