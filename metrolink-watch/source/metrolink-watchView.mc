import Toybox.Graphics;
import Toybox.WatchUi;
import Toybox.Communications;
import Toybox.Lang;
using Toybox.Timer;
using Toybox.Application.Storage;

class metrolink_watchView extends WatchUi.View {
    var showWait;
    var routes;
    var currRoute;
    // var textArea;
    var timer as Timer.Timer?;

    function initialize(routes as Array<Route>) {
        self.routes = routes;
        View.initialize();
    }

    function previousRoute() {
        self.currRoute --;
        if (self.currRoute < 0) {
            self.currRoute = self.routes.size()-1;
        }
        Storage.setValue("currRoute", currRoute);
        reset();
    }

    function nextRoute() {
        self.currRoute ++;
        if (self.currRoute >= self.routes.size()) {
            self.currRoute = 0;
        }
        Storage.setValue("currRoute", currRoute);
        reset();
    }

    // Called when this View is brought to the foreground. Restore
    // the state of this View and prepare it to be shown. This includes
    // loading resources into memory.
    function onShow() as Void {
        var stored = Storage.getValue("currRoute");
        if (stored) {
            self.currRoute = stored;
        } else {
            self.currRoute = 0;
        }
        self.timer = null;
        self.showWait = true;
    }

    // Update the view
    function onUpdate(dc as Dc) as Void {
        // Call the parent onUpdate function to redraw the layout
        View.onUpdate(dc);
        
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.fillRectangle(dc.getWidth()/2, dc.getHeight()/2, dc.getWidth()/2, dc.getHeight()/2);
        if (showWait) {
            // textArea.setText("\n\nPlease Wait.\nLoading Data...\n");
            // showWait = false;
            dc.drawText(
                dc.getWidth() / 2,
                dc.getHeight() / 2,
                Graphics.FONT_SMALL,
                "Please Wait.",
                Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER
            );
        }
        var route = self.routes[self.currRoute];
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

    }

    function onReceive(responseCode as Number, data as Dictionary) as Void {
        var route = self.routes[self.currRoute];
        if (responseCode == 200) {
            if (data instanceof Dictionary) {
                // textArea.setText(assembleMessage(data));
            } else {
                // textArea.setText("\nNo trams currently found on the\n" + route.name + "\nroute");
            }
            WatchUi.requestUpdate();
        } else {
            var msg;
            switch (responseCode) {
                case Communications.BLE_CONNECTION_UNAVAILABLE:
                    msg = "\nCannot connect to phone using Bluetooth";
                    break;
                default:
                    msg = "Error querying server.\nResponse Code:\n" + responseCode + "\nroute\n" + route.name;
                    break;
            }
            // textArea.setText(msg);
        }
    }

    function timerCallback() as Void {
        timer = null;
        WatchUi.requestUpdate();
    }

    function reset() as Void {
        if (timer != null) {
            timer.stop();
        }
        timer = null;
        showWait = true;
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
