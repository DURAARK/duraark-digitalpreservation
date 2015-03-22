define([
    'backbone',
    'backbone.marionette',
    'workbenchui',
    'core/uimodulebase',
    './mainview.js',
    '../entities/session-model',
], function(Backbone, Marionette, WorkbenchUI, UIModuleBase, MainView, Session) {

    WorkbenchUI.module('Contrib.SIPGenerator', UIModuleBase);

    var MyModule = WorkbenchUI.module("Contrib.SIPGenerator");

    WorkbenchUI.addInitializer(function() {
        // 1. Register module with the ModuleManager:
        WorkbenchUI.execute('module:register', 'Contrib.SIPGenerator');

        // 2. Register eventhandler to show the view:
        WorkbenchUI.vent.on('module:sipgenerator:show', function(session) {
            console.log('module:sipgenerator:show');

            // // First create the Model classes:
            // var SemObsModel = Backbone.Model.extend({
            //     //Placeholder data that will be used until we connect with the real files that will be put in the SIP                
            //     //urlRoot: "/services/probado",
            //     urlRoot: "https://dl.dropboxusercontent.com/u/985282/sipfile_fake.json", //Fake placeholder data                
            // });

            var session = WorkbenchUI.currentSession;

            if (!MyModule._mainView) {
                // Create emtpy main view and show it:
                MyModule._mainView = new MainView();

                if (typeof region !== 'undefined') {
                    region.show(MyModule._mainView);
                } else {
                    this.mainRegion.show(MyModule._mainView);
                }

                WorkbenchUI.fetchModel(Session, session.get('id')).then(function(model) {
                    MyModule._mainView.updateBuildmData(model);
                });

            } else {
                WorkbenchUI.fetchModel(Session, session.get('id')).then(function(model) {
                    MyModule._mainView.updateBuildmData(model);
                });

                // For the first show in the lifetime of the _mainView the events hash is correctly
                // evaluated. When the _mainView gets closed and is reopened again, the events
                // have to be delegated manually, otherwise e.g. the click events will not fire.
                // That's what the next line is for:
                MyModule._mainView.delegateEvents();
            }

        }.bind(this));

        console.log('[WorkbenchUI.Contrib.SIPGenerator] started');
    });
});