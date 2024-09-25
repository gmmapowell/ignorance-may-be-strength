using Toybox.WatchUi;
import Toybox.Lang;

class metrolink_openRoutes extends WatchUi.BehaviorDelegate {
	var routes;

	function initialize(routes as Array<Route>) {
		self.routes = routes;
		BehaviorDelegate.initialize();
	}

	function onSelect() {
		System.println("on select...");
		WatchUi.pushView(new metrolink_watchView(routes[0]), new metrolink_navigate(routes), WatchUi.SLIDE_IMMEDIATE);
		return true;
	}
}