import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;
using Toybox.System;

class metrolink_watchApp extends Application.AppBase {
    var routes as Array<Route>;

    function initialize() {
        AppBase.initialize();
        routes = configureRoutes();
    }

    // onStart() is called on application start up
    function onStart(state as Dictionary?) as Void {
    }

    // onStop() is called when your application is exiting
    function onStop(state as Dictionary?) as Void {
    }

    // Return the initial view of your application here
    function getInitialView() as [Views] or [Views, InputDelegates] {
        return [ new metrolink_watchView(routes[0]), new metrolink_openRoutes() ];
    }

}

function configureRoutes() as Array<Route> {
    var altiRoute = new Route("ALTI", ["MKT", "PCG"], ["ALT"]);
    var traffRoute = new Route("TRC", ["TRC"], []);
    var oksRoute = new Route("OKS", ["OHK"], ["MON", "EDD"]);
    return [ altiRoute, oksRoute, traffRoute ];
}

class Route {
    var name as String;
    var from as Array<String>;
    var to as Array<String>;

    public function initialize(name as String, from as Array<String>, to as Array<String>) {
        self.name = name;
        self.from = from;
        self.to = to;
    }
}

function getApp() as metrolink_watchApp {
    return Application.getApp() as metrolink_watchApp;
}