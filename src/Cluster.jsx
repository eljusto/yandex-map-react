import React, {Component, PropTypes} from 'react';
import ClusterController from './controllers/ClusterController';
import supportEvents from './apiEventsLists/geoObject';
import {eventsDecorator} from './utils/decorators';

class Cluster extends Component {

    static defaultProps = {
        options: {},
    }

    static propTypes = {
        options: PropTypes.object,
    }

    static contextTypes = {
        mapController: PropTypes.object,
    }

    static childContextTypes = {
        cluster: PropTypes.bool,
        clusterController: PropTypes.object,
    }

    constructor (props, context) {
        super(props);
        const {options} = props;

        this._controller = new ClusterController(options, context.mapController);
    }

    getChildContext () {
        return {
            cluster: true,
            clusterController: this._controller,
        };
    }

    componentDidMount () {
        this._setupEvents();
        this._setupLayouts();
    }

    componentWillUnmount () {
        this._controller.destroy();
    }

    _setupLayouts () {
        if (this.props.custom) {
            this._controller.setLayout('customLayout');
        }
    }

    getController () {
        return this._controller ? this._controller : null;
    }

    render () {
        return <div>{this.props.children}</div>;
    }
}

export default eventsDecorator(Cluster, {supportEvents});
