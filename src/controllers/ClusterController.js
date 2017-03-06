import api from '../api';

class ClusterController {
    constructor (options, mapController) {
        if (options.clusterBalloonTemplate) {
            const tmplFactory = (api.getAPI()).templateLayoutFactory;
            options.clusterBalloonContentLayout = tmplFactory.createClass(options.clusterBalloonTemplate);
            delete options.clusterBalloonTemplate;
        }

        this._cluster = new (api.getAPI()).Clusterer(options);
        this._mapController = mapController;
        this.events = this._cluster.events.group();
        this._setupCollection();
    }

    getAPIInstance () {
        return this._cluster;
    }

    _setupCollection () {
        this._geoCollection = new (api.getAPI()).GeoObjectCollection();
        this._mapController.appendCluster(this._cluster);
    }

    hideNativeBalloon () {
        this._cluster.options.set({
            clusterBalloonLayout: api.getAPI().templateLayoutFactory.createClass('<i></i>'),
            clusterBalloonShadow: false
        });
    }

    setLayout (name) {
        if (name === 'customLayout') {
            this.hideNativeBalloon();
        }
    }

    appendMarker(marker) {
        this._cluster.add(marker.getAPIInstance());
    }

    destroyMarker(marker) {
        this._cluster.remove(marker.getAPIInstance());
    }

    destroy() {
        this.events.removeAll();
    }
}

export default ClusterController;
