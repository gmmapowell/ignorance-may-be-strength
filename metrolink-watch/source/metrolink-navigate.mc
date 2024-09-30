using Toybox.WatchUi;
import Toybox.Lang;

class metrolink_navigate extends WatchUi.InputDelegate {
	var view;

	function initialize(view as metrolink_watchView) {
		self.view = view;
		InputDelegate.initialize();
	}

	function onSwipe(ev) {
		switch (ev.getDirection()) {
		case SWIPE_RIGHT: {
			view.previousRoute();
			break;
		}
		case SWIPE_LEFT: {
			view.nextRoute();
			break;
		}
		case SWIPE_UP: {
			view.scrollDown();
			break;
		}
		case SWIPE_DOWN: {
			view.scrollUp();
			break;
		}
		}
		return true;
	}
}