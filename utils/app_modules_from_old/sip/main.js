define([
    'backbone.marionette',
    'workbenchui',
    'core/uimodulebase',
    '../entities/session-collection',
    './mainview.js'
], function(Marionette, WorkbenchUI, UIModuleBase, Sessions, MainView) {

    WorkbenchUI.module('Contrib.SIPWorkflow', UIModuleBase);

    var MyModule = WorkbenchUI.module("Contrib.SIPWorkflow");

    WorkbenchUI.addInitializer(function() {
        // 1. Register module with the ModuleManager:
        WorkbenchUI.execute('module:register', 'Contrib.SIPWorkflow');

        // 2. Register eventhandler to show the view:
        WorkbenchUI.vent.on('module:sip:show', function(region) {
            if (!MyModule._mainView) {
                MyModule._sessions = new Sessions();

                MyModule._mainView = new MainView({
                    collection: MyModule._sessions
                });
            }

            if (typeof region !== 'undefined') {
                region.show(MyModule._mainView);
            } else {
                this.mainRegion.show(MyModule._mainView);
            }

            MyModule._sessions.fetch();

            // For the first show in the lifetime of the _mainView the events hash is correctly
            // evaluated. When the _mainView gets closed and is reopened again, the events
            // have to be delegated manually, otherwise e.g. the click events will not fire.
            // That's what the next line is for:
            MyModule._mainView.delegateEvents();

        }.bind(this));

        console.log('[WorkbenchUI.Contrib.SIPWorkflow] started');
    });
});