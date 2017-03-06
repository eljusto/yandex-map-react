import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import MarkerController from './controllers/MarkerController';
import supportEvents from './apiEventsLists/geoObject';
import {eventsDecorator} from './utils/decorators';

import MarkerLayout from './MarkerLayout';
import BalloonLayout from './BalloonLayout';

class MapMarker extends Component {
    static propTypes = {
        lat: PropTypes.number.isRequired,
        lon: PropTypes.number.isRequired,
        properties: PropTypes.object,
        options: PropTypes.object
    }

    static contextTypes = {
        mapController: PropTypes.object,
        cluster: PropTypes.bool,
        clusterController: PropTypes.object,
    }

    constructor (props) {
        super(props);
        this.options = {};
    }

    componentDidUpdate (prevProps) {
        const {lat, lon, children, properties, options} = this.props;

        if (lat !== prevProps.lat || lon !== prevProps.lon) {
            this._controller.setPosition([lat, lon]);
        }

        Object.keys(properties || {}).forEach(propName => {
            if (!prevProps.properties || properties[propName] !== prevProps.properties[propName]) {
                this._controller.setProperty(propName, properties[propName]);
            }
        });

        Object.keys(options || {}).forEach(optName => {
            if (!prevProps.options || options[optName] !== prevProps.options[optName]) {
                this._controller.setOption(optName, options[optName]);
            }
        });

        if (children != prevProps.children) {
            this._clearLayouts();
            this._setupLayouts();
        }
    }

    componentDidMount () {
        const {lat, lon, properties, options} = this.props;

        this._controller = new MarkerController([lat, lon], properties, options);
        this._setupLayouts();
        this._setupEvents();

        if (this.context.cluster) {
            this.context.clusterController.appendMarker(this._controller);
        } else {
            this.context.mapController.appendMarker(this._controller);
        }

    }

    componentWillUnmount () {
        this._clearLayouts();

        if (this.context.cluster) {
            this.context.clusterController.destroyMarker(this._controller);
        }

        this._controller.destroy();
    }

    getController () {
        return this._controller ? this._controller : null;
    }

    _setupLayouts () {
        React.Children
            .toArray(this.props.children)
            .forEach(component => {
                if (component.type === MarkerLayout) {
                    this._setupMarkerLayout(component);
                } else if (component.type === BalloonLayout) {
                    this._setupBalloonLayout(component);
                }
            });
    }

    _setupMarkerLayout (component) {
        this._markerElement = document.createElement('div');
        this._markerElement.className = 'icon-content';
        this._markerElement.style.display = 'inline-block';

        ReactDOM.render(component, this._markerElement);
        this._controller.setLayout('iconLayout', this._markerElement);
    }

    _setupBalloonLayout (component) {
        this._balloonElement = document.createElement('div');
        this._balloonElement.className = 'balloon-content';
        this._balloonElement.style.display = 'inline-block';
        this._balloonElement.style.position = 'absolute';

        ReactDOM.render(component, this._balloonElement);
        this._controller.setLayout('balloonLayout', this._balloonElement);
    }

    _clearLayouts () {
        if (this._markerElement) {
            ReactDOM.unmountComponentAtNode(this._markerElement);
            this._markerElement = null;
        }

        if (this._balloonElement) {
            ReactDOM.unmountComponentAtNode(this._balloonElement);
            this._balloonElement = null;
        }
    }

    render () {
        return null;
    }
}

export default eventsDecorator(MapMarker, {supportEvents});
