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
		var view = new metrolink_watchView(routes);
		var handler = new metrolink_navigate(view);
		WatchUi.pushView(view, handler, WatchUi.SLIDE_IMMEDIATE);
		return true;
	}
}