'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ClusterController = function () {
    function ClusterController(options, mapController) {
        _classCallCheck(this, ClusterController);

        if (options.clusterBalloonTemplate) {
            var tmplFactory = _api2.default.getAPI().templateLayoutFactory;
            options.clusterBalloonContentLayout = tmplFactory.createClass(options.clusterBalloonTemplate);
            delete options.clusterBalloonTemplate;
        }

        this._cluster = new (_api2.default.getAPI().Clusterer)(options);
        this._mapController = mapController;
        this.events = this._cluster.events.group();
        this._setupCollection();
    }

    _createClass(ClusterController, [{
        key: 'getAPIInstance',
        value: function getAPIInstance() {
            return this._cluster;
        }
    }, {
        key: '_setupCollection',
        value: function _setupCollection() {
            this._geoCollection = new (_api2.default.getAPI().GeoObjectCollection)();
            this._mapController.appendCluster(this._cluster);
        }
    }, {
        key: 'hideNativeBalloon',
        value: function hideNativeBalloon() {
            this._cluster.options.set({
                clusterBalloonLayout: _api2.default.getAPI().templateLayoutFactory.createClass('<i></i>'),
                clusterBalloonShadow: false
            });
        }
    }, {
        key: 'setLayout',
        value: function setLayout(name) {
            if (name === 'customLayout') {
                this.hideNativeBalloon();
            }
        }
    }, {
        key: 'appendMarker',
        value: function appendMarker(marker) {
            this._cluster.add(marker.getAPIInstance());
        }
    }, {
        key: 'destroyMarker',
        value: function destroyMarker(marker) {
            this._cluster.remove(marker.getAPIInstance());
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.events.removeAll();
        }
    }]);

    return ClusterController;
}();

exports.default = ClusterController;