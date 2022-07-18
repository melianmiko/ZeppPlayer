export class HmAppMock {
    startApp(options) {
        console.log("startApp", options);
    }

    gotoPage() {}
    reloadPage() {}
    setLayerX() {}
    setLayerY() {}
    gotoHome() {}
    exit() {}
    goBack() {}
    setScreenKeep() {}
    packageInfo() {}

    registerGestureEvent() {}
    unregisterGestureEvent() {}
    
    alarmNew() {}
    alarmCancel() {}

    registerKeyEvent() {}
    unregisterKeyEvent() {}

    registerSpinEvent() {}
    unregistSpinEvent() {}
}
