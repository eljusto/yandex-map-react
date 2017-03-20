import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import MapElement from './MapElement';
import MapController from './controllers/MapController';
import supportEvents from './apiEventsLists/map';
import {eventsDecorator} from './utils/decorators';
import api from './api';

class YandexMap extends Component {
    static propTypes = {
        onAPIAvailable: PropTypes.func,
        fitToViewport: PropTypes.bool,
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        zoom: PropTypes.number,
        state: PropTypes.object,
        style: PropTypes.object,
        mapStyle: PropTypes.object,
        apiParams: PropTypes.shape({
            apiKey: PropTypes.string,
            coordorder: PropTypes.oneOf(['latlong', 'longlat']),
            mode: PropTypes.oneOf(['debug', 'release']),
            load: PropTypes.string
        }),
        options: PropTypes.object
    }

    static defaultProps = {
        zoom: 10,
        width: 600,
        height: 600,
        state: {
            controls: []
        },
        options: {},
        style: {
            position: 'relative'
        }
    }

    static childContextTypes = {
        mapController: PropTypes.object
    }

    constructor (props) {
        super(props);
        this.state = {
            isAPILoaded: false
        };

        this._getMapElementRef = this._getMapElementRef.bind(this);
    }

    _getMapElementRef(ref) {
        this.mapElement = ref;
    }

    getChildContext () {
        return {
            mapController: this._controller
        };
    }

    getController () {
        return this._controller ? this._controller : null;
    }

    componentWillReceiveProps (nextProps) {
        Object.keys(nextProps).forEach(key => {
            if (typeof nextProps[key] !== 'undefined') {
                return;
            }

            switch (key) {
                case 'controls':
                    this._controller.setState(key, nextProps[key]);
                    break;
                case 'center':
                    if (!this.props.center
                      || this.props.center[0] !== nextProps.center[0]
                      || this.props.center[1] !== nextProps.center[1] ) {
                      this._controller.setCenter(nextProps.center);
                    }

                    break;
                case 'bounds':
                    if (!this.props.bounds
                      || this.props.bounds[0][0] !== nextProps.bounds[0][0]
                      || this.props.bounds[0][1] !== nextProps.bounds[0][1]
                      || this.props.bounds[1][0] !== nextProps.bounds[1][0]
                      || this.props.bounds[1][1] !== nextProps.bounds[1][1] ) {
                      this._controller.setBounds(nextProps.bounds);
                    }

                    break;
                case 'zoom':
                    if (this.props.zoom !== nextProps.zoom) {
                      this._controller.setZoom(nextProps.zoom);
                    }

                    break;
                default:
                    break;
            }
        });
    }

    componentDidMount () {
        if (api.isAvailable()) {
            this._onAPILoad(api.getAPI());
        } else {
            api.load(this._getAPIParams())
                .then(this._onAPILoad.bind(this))
                .catch((error) => console.log('Error occured: %s', error));
        }
    }

    componentDidUpdate () {
        if (this.props.fitToViewport) {
            this._controller && this._controller.fitToViewport();
        }
    }

    render () {
        return (
            <div style={this._getStyle()}>
                <MapElement ref={ this._getMapElementRef } style={this.props.mapStyle} />
                {Boolean(this.state.isAPILoaded) ? this.props.children : null}
            </div>
        );
    }

    _getAPIParams () {
        return this.props.apiParams || {};
    }

    _getStyle () {
        return {
            ...this.props.style,
            width: typeof this.props.width == 'string' ? this.props.width : `${this.props.width}px`,
            height: typeof this.props.height == 'string' ? this.props.height : `${this.props.height}px`
        };
    }

    _onAPILoad (namespace) {
        this.props.onAPIAvailable && this.props.onAPIAvailable(namespace);

        this._controller = new MapController();
        this._controller.createMap(
            ReactDOM.findDOMNode(this.mapElement),
            { ...this.props.state },
            { ...this.props.options }
        );

        this._setupEvents();
        this.setState({isAPILoaded: true});

        if (this.props.onMapAvailable) {
            this.props.onMapAvailable(this._controller.map);
        }
        if (this.props.fitToViewport) {
            this._controller.fitToViewport();
        }
    }
}

export default eventsDecorator(YandexMap, {supportEvents});
