import Toybox.Graphics;
import Toybox.WatchUi;
import Toybox.Communications;
import Toybox.Lang;

class metrolink_watchView extends WatchUi.View {
    var textArea;

    function initialize() {
        System.println("init view");
        View.initialize();
    }

    // Load your resources here
    function onLayout(dc as Dc) as Void {
        System.println("layout");
        setLayout(Rez.Layouts.RouteLayout(dc));
        textArea = self.findDrawableById("routeInfo") as TextArea;
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
        textArea.setText("hello, world");
        var params = { "from[]" => "FIR" };
        var options = {
            :method => Communications.HTTP_REQUEST_METHOD_GET,
            :headers => { "Content-Type" => Communications.REQUEST_CONTENT_TYPE_URL_ENCODED },
            :responseType => Communications.HTTP_RESPONSE_CONTENT_TYPE_JSON
        };
        var responseCallback = method(:onReceive); 
        Communications.makeWebRequest("https://gmmapowell.com/metrolink-data.php", params, options, responseCallback);
        // Call the parent onUpdate function to redraw the layout
        View.onUpdate(dc);
    }

    function onReceive(responseCode as Number, data as Dictionary) as Void {
        if (responseCode == 200) {
            System.println("Request Successful");
            System.println(data["Firswood"]);
        } else {
            System.println("Request failed, code: " + responseCode);
        }
    }

    // Called when this View is removed from the screen. Save the
    // state of this View here. This includes freeing resources from
    // memory.
    function onHide() as Void {
        System.println("hide");
    }

}
