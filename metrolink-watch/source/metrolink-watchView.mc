import Toybox.Graphics;
import Toybox.WatchUi;
import Toybox.Communications;
import Toybox.Lang;

class metrolink_watchView extends WatchUi.View {
    var route;
    var textArea;

    function initialize(route as Route) {
        self.route = route;
        View.initialize();
    }

    // Load your resources here
    function onLayout(dc as Dc) as Void {
        setLayout(Rez.Layouts.RouteLayout(dc));
        textArea = self.findDrawableById("routeInfo") as TextArea;
    }

    // Called when this View is brought to the foreground. Restore
    // the state of this View and prepare it to be shown. This includes
    // loading resources into memory.
    function onShow() as Void {
    }

    // Update the view
    function onUpdate(dc as Dc) as Void {
        var params = {};
        if (route.from) {
            for (var i=0;i<route.from.size();i++) {
                var key = "from[" + i + "]";
                params[key] = route.from[i];
            }
        }
        if (route.to) {
            for (var i=0;i<route.to.size();i++) {
                var key = "to[" + i + "]";
                params[key] = route.to[i];
            }
        }
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
            textArea.setText(assembleMessage(data));
            WatchUi.requestUpdate();
        } else {
            System.println("Request failed, code: " + responseCode);
        }
    }

    function assembleMessage(data as Dictionary) as String {
        var chars = [];
        var keys = data.keys();
        for (var i=0;i<keys.size();i++) {
            var fromX = keys[i];
            var toX = data[fromX];
            assembleFrom(chars, fromX as String, toX);
        }
        return StringUtil.charArrayToString(chars);
    }

    function assembleFrom(chars as Array<Char>, from as String, to as Dictionary) {
        chars.addAll(from.toCharArray());
        chars.add('\n');

        var dests = to.keys() as Array<String>;
        for (var i=0;i<dests.size();i++) {
            var toX = dests[i];
            chars.addAll("=> ".toCharArray());
            chars.addAll(toX.toCharArray());
            chars.add('\n');
            var times = to[toX];
            assembleTimes(chars, times);
        }
    }

    function assembleTimes(chars as Array<Char>, times as Array<String>) {
        for (var i=0;i<times.size();i++) {
            chars.add(' ');
            chars.add(' ');
            chars.addAll(times[i].toCharArray());
        }
        chars.add('\n');
    }

    // Called when this View is removed from the screen. Save the
    // state of this View here. This includes freeing resources from
    // memory.
    function onHide() as Void {
    }

}
