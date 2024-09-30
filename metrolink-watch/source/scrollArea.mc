import Toybox.WatchUi;
import Toybox.Lang;
import Toybox.Graphics;

class ScrollArea extends Drawable {
	var tx as String?;
	var offset as Number;

	function initialize(options) {
		Drawable.initialize(options);
		self.offset = 0;
	}

	function draw(dc as Dc) {
	    System.println("in draw with " + tx);
	    if (tx != null) {
	        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
	        dc.drawText(
	            dc.getWidth() / 2,
	            dc.getHeight() / 2 - (dc.getHeight() * self.offset)/4,
	            Graphics.FONT_SMALL,
	            tx,
	            Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER
	        );
	    }
	}

	function setText(tx as String) {
		self.tx = tx;
	}

	function scrollDown() {
		offset ++;
	}

	function scrollUp() {
		offset --;
	}
}