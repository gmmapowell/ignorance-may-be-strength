import Toybox.Graphics;
import Toybox.WatchUi;
import Toybox.Communications;
import Toybox.Lang;
using Toybox.Timer;

class metrolink_watchView extends WatchUi.View {
    var showWait;
    var route;
    var textArea;
    var timer as Timer.Timer?;

    function initialize(route as Route) {
        self.showWait = true;
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
        if (showWait) {
            textArea.setText("\n\nPlease Wait.\nLoading Data...\n");
            showWait = false;
        }
        if (timer == null) {
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

            timer = new Timer.Timer();
            timer.start(method(:timerCallback), 15000, false);
        }

        // Call the parent onUpdate function to redraw the layout
        View.onUpdate(dc);
    }

    function onReceive(responseCode as Number, data as Dictionary) as Void {
        if (responseCode == 200) {
            if (data instanceof Dictionary) {
                textArea.setText(assembleMessage(data));
            } else {
                textArea.setText("\nNo trams currently found on the\n" + route.name + "\nroute");
            }
            WatchUi.requestUpdate();
        } else {
            textArea.setText("Error querying server.\nResponse Code:\n" + responseCode + "\nroute\n" + route.name);
        }
    }

    function timerCallback() as Void {
        timer = null;
        WatchUi.requestUpdate();
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
        if (timer != null) {
            timer.stop();
            timer = null;
        }
    }

}
