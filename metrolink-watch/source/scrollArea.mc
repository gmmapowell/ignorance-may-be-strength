import Toybox.WatchUi;
import Toybox.Lang;

class ScrollArea extends Drawable {
	var tx as String?;

	function initialize(options) {
		Drawable.initialize(options);
	}

	function setText(tx as String) {
		self.tx = tx;
	}
}