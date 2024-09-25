using Toybox.WatchUi;

class metrolink_openRoutes extends WatchUi.BehaviorDelegate {
	function initialize() {
		BehaviorDelegate.initialize();
	}

	function onSelect() {
		System.println("on select...");
		return true;
	}
}