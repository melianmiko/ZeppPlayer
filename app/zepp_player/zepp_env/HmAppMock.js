export class HmAppMock {
    constructor(player) {
        this.player = player;
    }

    startApp(options) {
        console.log("startApp", options);
    }

    gotoPage(conf) {
        console.log("gotoPage", conf)
        if(!conf.url) return;

        this.player.finish();
        this.player.setPage(conf.url);
        this.player.init();
        this.player.refresh_required = true;
    }

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
