import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;
using Toybox.System;

class metrolink_watchApp extends Application.AppBase {

    function initialize() {
        System.println("initialize");
        AppBase.initialize();
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

function getApp() as metrolink_watchApp {
    System.println( "get app" );
    return Application.getApp() as metrolink_watchApp;
}