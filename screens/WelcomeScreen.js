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
  Dimensions, Alert, FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import  Constants  from 'expo-constants';
import { StackActions, NavigationActions } from 'react-navigation';
import { MonoText } from '../components/StyledText';



import settings from '../constants/Settings.js';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');
// const height = width * 0.8


const SERVER_URL = settings.url



export default class WelcomeScreen extends React.Component{

  static navigationOptions = {
     header:null,
   }

componentDidMount(){
  AsyncStorage.setItem('defaultpage','false')
}

  goHome(){
    var resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'HomeScreen' })],
    });
    this.props.navigation.dispatch(resetAction);

  }

  render(){
    return(
      <View style={{flex:1,backgroundColor:"#f2f2f2"}}>
        <View style={{height:Constants.statusBarHeight,backgroundColor:'#1a73e8'}}></View>
        <Image source={ require('../assets/images/icon1.png')} style={{flex: 1,width:width,height:height,resizeMode: 'contain'}}/>
        <View style={{position:'absolute',right:15,bottom:30}}>
          <TouchableOpacity onPress={()=>this.goHome()} style={{paddingHorizontal:15,paddingVertical:8,backgroundColor:"#1a73e8",borderWidth:2,borderColor:'#1a73e8',borderRadius:20}}><MonoText   style={{color:'#ffffff',fontSize:16,fontWeight:'700',letterSpacing:2}}>GET STARTED</MonoText> </TouchableOpacity>
        </View>
      </View>
    );
  }

}
