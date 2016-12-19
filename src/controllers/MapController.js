import api from '../api';

class MapController {
    constructor () {

    }

    createMap (container, state, options, useClusterer, clustererOptions) {
        this._map = new (api.getAPI()).Map(container, state, options);
        if (useClusterer) {
            this._clusterer = new (api.getAPI()).Clusterer(clustererOptions);
        }
        this.events = this._map.events.group();

        this._setupCollection();

        return this;
    }

    appendMarker (marker) {
        if (this._clusterer) {
            this._clusterer.add(marker.getAPIInstance());
            marker.setClusterBalloonState(marker.balloonState, this._clusterer);
        } else {
            this._geoCollection.add(marker.getAPIInstance());
            marker.setBalloonState(marker.balloonState);
        }
    }

    fitToViewport() {
        this._map.container.fitToViewport();
    }

    get map () {
        return this._map;
    }

    setOptions (name, value) {
        this._map.options.set(name, value);
    }

    setCenter (coords) {
        this._map.setCenter(coords);
    }

    setBounds (bounds) {
        this._map.setBounds(bounds);
    }

    setZoom (zoom) {
        this._map.setZoom(zoom);
    }

    setState (name, value) {
        this._map.state.set(name, value);
    }

    destroy () {
        this.events.removeAll();
        this._map.destroy();
    }

    _setupCollection () {
        this._geoCollection = new (api.getAPI()).GeoObjectCollection();
        if (this._clusterer) {
            this._map.geoObjects.add(this._clusterer);
        } else {
            this._map.geoObjects.add(this._geoCollection);
        }
    }
}

export default MapController;
