import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;
using Toybox.System;

class metrolink_watchApp extends Application.AppBase {
    var routes as Array<Route>;

    function initialize() {
        System.println("initialize");
        AppBase.initialize();
        routes = configureRoutes();
    }

    // onStart() is called on application start up
    function onStart(state as Dictionary?) as Void {
        System.println("start");
    }

    // onStop() is called when your application is exiting
    function onStop(state as Dictionary?) as Void {
        System.println("stop");
    }

    // Return the initial view of your application here
    function getInitialView() as [Views] or [Views, InputDelegates] {
        System.println("get view");
        return [ new metrolink_watchView() ];
    }

}

function configureRoutes() as Array<Route> {
    var altiRoute = new Route("ALTI", ["MKT", "PCG"], ["ALT"]);
    var traffRoute = new Route("TRC", ["TRC"], []);
    return [ altiRoute, traffRoute ];
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
    System.println( "get app" );
    return Application.getApp() as metrolink_watchApp;
}