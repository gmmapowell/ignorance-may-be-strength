import Toybox.Graphics;
import Toybox.WatchUi;

class metrolink_watchView extends WatchUi.View {

    function initialize() {
        System.println("init view");
        View.initialize();
    }

    // Load your resources here
    function onLayout(dc as Dc) as Void {
        System.println("layout");
        setLayout(Rez.Layouts.MainLayout(dc));
    }

    // Called when this View is brought to the foreground. Restore
    // the state of this View and prepare it to be shown. This includes
    // loading resources into memory.
    function onShow() as Void {
        System.println("show");
    }

    // Update the view
    function onUpdate(dc as Dc) as Void {
        System.println("update");
        // Call the parent onUpdate function to redraw the layout
        View.onUpdate(dc);
    }

    // Called when this View is removed from the screen. Save the
    // state of this View here. This includes freeing resources from
    // memory.
    function onHide() as Void {
        System.println("hide");
    }

}
