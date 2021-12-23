
import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView , KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid , WebView} from 'react-native';
import  Constants  from 'expo-constants';
import settings from '../constants/Settings.js';
const { width } = Dimensions.get('window');
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';

const SERVER_URL = settings.url
export default class TermsAndCondition extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      header:null
    }
  };
  state = {

  };


  render(){

    return (
     <View style={{flex:1}}>
        <View style={{height:Constants.statusBarHeight,backgroundColor:'#efa834'}}></View>
        <View style={{flex:1,}}>

        <WebView
        source={{uri: SERVER_URL}}
        startInLoadingState
        javaScriptEnabled
        style={{ flex: 1,width:width*1, }}
        useWebKit={true}
        />
        </View>
      </View>
    )
  }


}
