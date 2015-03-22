define([
    'backbone',
    'backbone.marionette',
    'workbenchui',
    'hbs!./templates/main',
    'hbs!./templates/list-item',
    'hbs!./templates/list-collection'
], function(Backbone, Marionette, WorkbenchUI, SipGeneratorTmpl, ListItemTmpl, TableTmpl) {
    // Represents on list item:
    var ListItemView = Marionette.ItemView.extend({
        template: ListItemTmpl,
        tagName: 'tr',
        events: {
            "click td": "cellClicked"
        },

        fieldsChanged: function() {
            this.render();
        }
    });

    // Represents the table view, which is using the ListItemView to render its items:
    var TableView = Marionette.CompositeView.extend({
        tagName: "table",
        className: 'table table-striped',
        template: TableTmpl,
        itemView: ListItemView,
        itemViewOptions: {
            myTableView: this
        },

        appendHtml: function(collectionView, itemView) {
            collectionView.$("tbody").append(itemView.el);
        }
    });

    // Represents the main page, including the TableView in the 'list' region when the 'onShow' method is called:
    var MainView = Marionette.Layout.extend({
        template: SipGeneratorTmpl,

        regions: {
            sipgen: "#sipgen-region"
        },

        events: {
            'click .js-download': function() {
                var downloadURL = function downloadURL(url) {
                    var hiddenIFrameID = 'hiddenDownloader',
                        iframe = document.getElementById(hiddenIFrameID);
                    if (iframe === null) {
                        iframe = document.createElement('iframe');
                        iframe.id = hiddenIFrameID;
                        iframe.style.display = 'none';
                        document.body.appendChild(iframe);
                    }
                    iframe.src = url;
                };

                console.log('Download from: ' + this.downloadUrl);
                downloadURL(this.downloadUrl);
            },

            'click .js-upload': function() {
                var SIP = Backbone.Model.extend({
                    urlRoot: 'services/sipgenerator'
                });

                var button = $('.js-upload'),
                    loading = $('#loading'),
                    download = $('#download')

                loading.show();
                button.attr("disabled", "disabled");
                // button.html('Generating...');

                var sip = new SIP({
                    id: 0
                });
                sip.fetch().then(function(model) {
                    console.log('[SIPGenerator] Download SIP at: ' + model.url);
                    loading.hide();

                    this.downloadUrl = model.url;

                    $('.js-upload').hide();
                    $('.js-download').show();
                    $('.js-search').show();

                }.bind(this));
            },
            'click .js-previous': function() {
                console.log('previous');
                WorkbenchUI.vent.trigger('module:landingpage:show');
            },
            'click .js-home': function() {
                // FIXXME: after the next line the 'sip' module has a error when selecting
                // a session with 'start'
                // WorkbenchUI.vent.trigger('module:landingpage:show
                // ... we do a complete reload instead:
                window.location.href = "http://workbench.duraark.eu/";
                // window.location.href = "http://localhost:9000/";
            },
            'click .js-search': function() {
                WorkbenchUI.vent.trigger('module:searchandretrieve:show');
            }
        },

        onShow: function() {
            $('#loading').hide();
            $('.js-download').hide();
            $('.js-search').hide();
        },

        updateBuildmData: function(model) {
            this.sipgen.show(new TableView({
                collection: this._modelToCollection(model) //** TODO: add static placeholde model containg SIP file info here
            }));
        },


        _modelToCollection: function(model) {
            // Here the given model is converted into a collection for easier display.
            // CAUTION: After values have changed in the collection it is necessary to
            // serialize the collection into a single model to store it back to the server!

            var collection = new Backbone.Collection();
            var files = model.get('files');
            for (var file in files) {
                if (files.hasOwnProperty(file)) {
                    collection.push(files[file]);
                }
            };

            return collection;
        }
    });

    return MainView;
});