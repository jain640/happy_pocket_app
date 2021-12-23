import React, { Component } from 'react';
import { View, StatusBar, TextInput, Text ,Animated} from 'react-native';

class FloatingInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
    };

}

   componentWillMount() {
      this._animatedIsFocused =  new Animated.Value(this.props.value === '' ? 0 : 1);
      this.props.onRef(undefined)
    }

    componentDidMount() {
    this.props.onRef(this)
  }

  focus=()=>{
    this.inputRef.focus()
  }

  handleFocus = () => this.setState({ isFocused: true });
  handleBlur = () => this.setState({ isFocused: false });

  componentDidUpdate() {
    Animated.timing(this._animatedIsFocused, {
    toValue: (this.state.isFocused || this.props.value !== '') ? 1 : 0,
    duration: 200,
   }).start();
  }

  render() {
    const { label,outputRange, ...props } = this.props;
    const labelStyle = {
      position: 'absolute',
      left: this._animatedIsFocused.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0],
            }),
      top: this._animatedIsFocused.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -12],
            }),
      fontSize: this._animatedIsFocused.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 12],
            }),
      color:'grey',
    };
    const viewStyle = {
      position: 'absolute',
      left: this._animatedIsFocused.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0],
            }),
      top: this._animatedIsFocused.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 18],
            }),
    }
    return (
      <View style={[{width:'100%',marginTop: 10}]}>
        <Animated.Text style={[labelStyle,{}]}>
                  {label}
        </Animated.Text>
        <TextInput
          {...props}
          ref={input => { this.inputRef = input}}
          underlineColorAndroid='transparent'
          style={{height:'100%' }}
          secureTextEntry={props.passWord}
          onFocus={this.handleFocus}
          multiline={props.multiline || false}
          onBlur={this.handleBlur}
          keyboardType={props.email?'email-address':props.type?'default':'numeric'}
          blurOnSubmit
        />
      </View>
    );
  }
}


export default FloatingInput
