import React, { Component } from 'react';

const defaultStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0
};

class MapElement extends Component {
    constructor (props) {
        super(props);
    }

    shouldComponentUpdate () {
        return false;
    }

    render () {
        return (
            <div style={this.props.style || defaultStyle }></div>

        );
    }
}

export default MapElement;
