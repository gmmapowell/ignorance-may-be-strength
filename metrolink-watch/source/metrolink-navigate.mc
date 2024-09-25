using Toybox.WatchUi;
import Toybox.Lang;

class metrolink_navigate extends WatchUi.InputDelegate {
	var routes;

	function initialize(routes as Array<Route>) {
		self.routes = routes;
		InputDelegate.initialize();
	}

	function onSwipe(ev) {
		System.println(ev.getDirection());	
		return true;
	}
}