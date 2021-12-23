import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Animated, Text, View} from 'react-native';
import { MonoText } from './StyledText';
export default class TextLoader extends Component {
    static propTypes = {
        text: PropTypes.string,
        textStyle: Text.propTypes.style
    };

    static defaultProps = {
        text: 'Loading'
    };

    constructor(props) {
        super(props);
        this.state = {
            opacities: [0, 0, 0]
        };
        this._animation = this._animation.bind(this);
        this.patterns = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1]];
        this.timers = [];
    }

    render() {
        const {text, textStyle} = this.props;
        return (
            <View style={{flexDirection: 'row'}}>
                <MonoText   style={textStyle}>{text}</MonoText>
                {this.state.opacities.map((item, i) => {
                    return <MonoText   key={i} style={[{opacity: item,fontSize:50}, textStyle]}>.</MonoText>
                })}
            </View>
        );
    }

    componentDidMount() {
        this._animation(1);
    }

    componentWillUnmount() {
        this.unmounted = true;
        this.timers.forEach((id) => {
            clearTimeout(id);
        });
    }

    _animation(index) {
        if (!this.unmounted) {
            const id = setTimeout(() => {
                this.setState({opacities: this.patterns[index]});
                index++;
                if (index >= this.patterns.length)
                    index = 0;
                this._animation(index);
            }, 500);
            this.timers.push(id);
        }
    }
}
