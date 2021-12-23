import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Slider,
  Dimensions,
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,ActivityIndicator
} from 'react-native';
import  { FontAwesome }  from '@expo/vector-icons';
import { MonoText } from './StyledText';
import OrderDetails from '../components/OrderDetails';
import * as WebBrowser  from 'expo-web-browser';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import { LinearGradient } from 'expo-linear-gradient';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import moment from 'moment'
import { FloatingAction } from "react-native-floating-action";

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const themeColor = settings.themeColor

export default class ActiveDispute extends React.Component{

  constructor(props){
      super(props);
      this.state = {
        store:props.store
      }
  }



   componentDidMount() {

   }


  render() {
      return (
        <View>
          <MonoText>Active Dispute</MonoText>
      </View>
      );
    }
 }


const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    contentImage:{
      flexWrap: 'nowrap',
      flexDirection:'row',
      alignItems: 'flex-start',
      marginTop:Constants.statusBarHeight,
      justifyContent: 'flex-start',
    },
    item: {
      marginTop:10,
      borderRadius:10
    },
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

  TouchableOpacityStyle: {
     position: 'absolute',
     width: 50,
     height: 50,
     alignItems: 'center',
     justifyContent: 'center',
     right: 30,
     bottom: 30,
     backgroundColor: themeColor,
     zIndex: 1,
     borderRadius:25,
   },
   modalcontainer:{
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
   },
   modalView: {
      backgroundColor: '#fff',
      marginHorizontal: width*0.05 ,
      borderRadius:5,
    },

   FloatingButtonStyle: {
     resizeMode: 'contain',
     width: 50,
     height: 50,
   }
  });
