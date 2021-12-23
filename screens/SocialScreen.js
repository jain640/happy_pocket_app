import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView , KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid , WebView} from 'react-native';
import  Constants  from 'expo-constants';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';
const { width } = Dimensions.get('window');

export default class SocialScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      header:null
    }
  };
  state = {
    cookies    : {},
    webViewUrl : 'https://happypockets.in/accounts/facebook/login/',
  };




  onNavigationStateChange = (navState) => {


     if(navState.url == 'https://happypockets.in/'){
       this.props.navigation.navigate('Home')
     }
   }
   onMessage(event){
   }


  render(){
    var account= this.props.navigation.getParam('account','')
    var url = ''
    if(account == 'facebook'){
      url = 'https://happypockets.in/accounts/facebook/login/'
    }
    if(account == 'google'){
      url = 'https://happypockets.in/accounts/google/login/?method=oauth2'
    }

    let jscode = `
            window.location = "https://happypockets.in/login";
            `

    return (
     <View style={{flex:1}}>
      <View style={{height:Constants.statusBarHeight,backgroundColor:'#3B5A9A'}}></View>
      <WebView
      useWebKit={true}
      source={{uri: uri}}
      onMessage={this.onMessage}
      onNavigationStateChange={this.onNavigationStateChange}
      startInLoadingState
      scalesPageToFit
      javaScriptEnabled
      style={{ flex: 1,width:width*1, }}

      />
      </View>
    )
  }


}
