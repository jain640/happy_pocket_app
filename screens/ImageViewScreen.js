import * as React from 'react';
import { Animated,StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList, Alert, Button, AsyncStorage , ToastAndroid,Platform,ScrollView,ActivityIndicator,TextInput,PanResponder,TouchableWithoutFeedback,Easing} from 'react-native';
import { FontAwesome,MaterialIcons } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import Toast, {DURATION} from 'react-native-easy-toast';
var { width } = Dimensions.get('window');
var wHeight = Dimensions.get('window').height;
height = wHeight-(2*(Constants.statusBarHeight+55))

import settings from '../constants/Settings.js';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import { Dropdown } from 'react-native-material-dropdown-v2';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import Modal from "react-native-modal";
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {State, PinchGestureHandler} from 'react-native-gesture-handler';
import { MonoText } from '../components/StyledText';
import {ListItem} from 'react-native-elements';

function calcDistance(x1, y1, x2, y2) {
    let dx = Math.abs(x1 - x2)
    let dy = Math.abs(y1 - y2)
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}
function calcCenter(x1, y1, x2, y2) {
  function middle(p1, p2) {
      return p1 > p2 ? p1 - (p1 - p2) / 2 : p2 - (p2 - p1) / 2;
  }

  return {
      x: middle(x1, x2),
      y: middle(y1, y2),
  };
}

function maxOffset(offset, windowDimension, imageDimension) {
    let max = windowDimension - imageDimension;
    if (max >= 0) {
        return 0;
    }
    return offset < max ? max : offset;
}

function calcOffsetByZoom(width, height, imageWidth, imageHeight, zoom) {
    let xDiff = imageWidth * zoom - width;
    let yDiff = imageHeight * zoom - height;
    return {
        left: -xDiff/2,
        top: -yDiff/2,
    }
}


class ImageViewScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return{
      header:null
    }
  }

  constructor(props) {
    super(props);
    this._onLayout = this._onLayout.bind(this);
    this.state = {
      images:[],
      selected:0,
      scrollX : new Animated.Value(0),
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1),
      currentPanValue:{x:0,y:0},
      zoom: null,
      minZoom: null,
      layoutKnown: false,
      isZooming: false,
      isMoving: false,
      initialDistance: null,
      initialX: null,
      initalY: null,
      offsetTop: 0,
      offsetLeft: 0,
      initialTop: 0,
      initialLeft: 0,
      initialTopWithoutZoom: 0,
      initialLeftWithoutZoom: 0,
      initialZoom: 1,
      top: 0,
      left: 0,
      width:width,
      height:height
    }
    this.offsetValue = {x: 0, y:0};
}



componentWillMount() {

this._panResponder = PanResponder.create({
  onMoveShouldSetResponderCapture: () => true,
 onMoveShouldSetPanResponderCapture: () => true,

 onPanResponderGrant: (e, gestureState) => {
   this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
    this.state.pan.setValue({x: 0, y: 0});
   //
   //  Animated.timing(
   //    this.state.scale,
   //    { toValue: 2,  }
   //  ).start();
 },
 onPanResponderMove: (e, gestureState) => {
         let touches = e.nativeEvent.touches;
         if (touches.length == 2) {
             let touch1 = touches[0];
             let touch2 = touches[1];

             this.processPinch(touches[0].pageX, touches[0].pageY,
                 touches[1].pageX, touches[1].pageY);
        }
        newdx = gestureState.dx;
        newdy = gestureState.dy;
       return Animated.event([
         null, {dx: this.state.pan.x, dy: this.state.pan.y}
       ])(e, { dx: newdx, dy: newdy });
     },


 // onPanResponderMove:Animated.event([
 //      null, {dx: this.state.pan.x, dy: this.state.pan.y},
 //    ]),
 onPanResponderTerminationRequest: (evt, gestureState) => true,
 onPanResponderRelease: (e, gestureState) => {
   // this.state.pan.flattenOffset();
   this.offsetValue = {x: gestureState.dx, y: gestureState.dy}
   this.setState({
                   isZooming: false,
                   isMoving: false
   });
   this.state.pan.setValue({x: 0, y: 0});
   // Animated.spring(
   //   this.state.scale,
   //   { toValue: 1, friction: 10 }
   // ).start()
 },
 onPanResponderTerminate: (evt, gestureState) => {},
onShouldBlockNativeResponder: (evt, gestureState) => true,
});
}


processPinch(x1, y1, x2, y2) {
       let distance = calcDistance(x1, y1, x2, y2);
       let center = calcCenter(x1, y1, x2, y2);

       if (!this.state.isZooming) {
           let offsetByZoom = calcOffsetByZoom(this.state.width, this.state.height,
                           width, height, this.state.zoom);
           this.setState({
               isZooming: true,
               initialDistance: distance,
               initialX: center.x,
               initialY: center.y,
               initialTop: this.state.top,
               initialLeft: this.state.left,
               initialZoom: this.state.zoom,
               initialTopWithoutZoom: this.state.top - offsetByZoom.top,
               initialLeftWithoutZoom: this.state.left - offsetByZoom.left,
           });

       } else {
           let touchZoom = distance / this.state.initialDistance;
           let zoom = touchZoom * this.state.initialZoom > this.state.minZoom
               ? touchZoom * this.state.initialZoom : this.state.minZoom;

           let offsetByZoom = calcOffsetByZoom(this.state.width, this.state.height,
               width, height, zoom);
           let left = (this.state.initialLeftWithoutZoom * touchZoom) + offsetByZoom.left;
           let top = (this.state.initialTopWithoutZoom * touchZoom) + offsetByZoom.top;

           this.setState({
               zoom: zoom,
               left: 0,
               top: 0,
               left: left > 0 ? 0 : maxOffset(left, this.state.width, this.props.imageWidth * zoom),
               top: top > 0 ? 0 : maxOffset(top, this.state.height, this.props.imageHeight * zoom),
           });
       }
}


  componentDidMount(){

    var images = this.props.navigation.getParam('images',null)
    var selected = this.props.navigation.getParam('selected',null)
    if(images!=null){
      this.setState({images:images})
    }
    if(selected!=null){
      this.setState({selected:selected})
    }

  }

  _onLayout(event) {
    let layout = event.nativeEvent.layout;

    if (layout.width === this.state.width
        && layout.height === this.state.height) {
        return;
    }

    let zoom = layout.width / width;

    let offsetTop = layout.height > height * zoom ?
        (layout.height - height * zoom) / 2
        : 0;

    this.setState({
        layoutKnown: true,
        width: layout.width,
        height: layout.height,
        zoom: zoom,
        offsetTop: offsetTop,
        minZoom: zoom
    });
}


  next=()=>{
    this.setState({selected:this.state.selected+1})
  }
  previous=()=>{
    this.setState({selected:this.state.selected-1})
  }


  render() {
     var color = this.props.navigation.getParam('color',null)
     if(this.state.images.length>0){
       var uri = SERVER_URL+this.state.images[this.state.selected].attachment
     }else{
       var uri = null
     }
     let [translateX, translateY,scale] = [this.state.pan.x, this.state.pan.y,this.state.scale]
      return (
        <View style={{flex:1,}}>
          <View style={{backgroundColor:color,height:Constants.statusBarHeight,zIndex: 999}} />
          <View style={{height:55,justifyContent: 'center',marginHorizontal: 15,zIndex: 999}} >
            <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}}><MaterialIcons name="arrow-back" size={30} color={'black'} /></TouchableOpacity>
          </View>
          <Animated.View style={{flex:1, alignItems: 'center',justifyContent: 'center',zIndex: 0,transform: [{translateX}, {translateY}]}} {...this._panResponder.panHandlers} onLayout={this._onLayout}>
            <Image  style={{resizeMode: 'contain',position: 'absolute',top: this.state.offsetTop + this.state.top,left: this.state.offsetLeft + this.state.left,
            width: width * this.state.zoom,height: height * this.state.zoom}}   source={{uri:uri}}/>
          </Animated.View>
          <View style={{flex:1,flexDirection: 'row',position: 'absolute',top:wHeight/2,zIndex: 999}}>
          {this.state.selected!=0&&
            <View style={{flex:1,paddingHorizontal: 15}}>
              <TouchableOpacity onPress={()=>this.previous()} style={[{width:50,height:50,alignItems: 'center',justifyContent: 'center',borderRadius: 25}]}>
                <MonoText><FontAwesome name="chevron-left" size={18} color={color} /></MonoText> 
              </TouchableOpacity>
            </View>
          }
            {this.state.images.length-1!=this.state.selected&&
              <View style={{flex:1,alignItems: 'flex-end',paddingHorizontal: 15}}>
              <TouchableOpacity onPress={()=>this.next()} style={[{width:50,height:50,alignItems: 'center',justifyContent: 'center',borderRadius: 25}]}>
                <MonoText><FontAwesome name="chevron-right" size={18} color={color} /></MonoText>
              </TouchableOpacity>
              </View>
            }

          </View>
        </View>
      )

  }
}


const styles = StyleSheet.create({

  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },


})



export default ImageViewScreen;
