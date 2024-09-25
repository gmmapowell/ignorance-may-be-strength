using Toybox.WatchUi;
import Toybox.Lang;

class metrolink_navigate extends WatchUi.InputDelegate {
	var routes;
	var view;

	function initialize(routes as Array<Route>, view as metrolink_watchView) {
		self.routes = routes;
		self.view = view;
		InputDelegate.initialize();
	}

	function onSwipe(ev) {
		System.println(ev.getDirection());
		switch (ev.getDirection()) {
		case SWIPE_RIGHT: {
			view.previousRoute();
			break;
		}
		case SWIPE_LEFT: {
			view.nextRoute();
			break;
		}
		}
		return true;
	}
}