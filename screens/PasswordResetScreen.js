import * as React from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity, Platform, Image,AsyncStorage,Alert,ScrollView ,Clipboard,ToastAndroid,Dimensions,FlatList,BackHandler,TextInput,KeyboardAvoidingView,Keyboard,WebView} from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { Icon } from "react-native-elements";
import { withNavigation } from 'react-navigation';
import { Card } from 'react-native-elements';
import { MonoText } from '../components/StyledText';
import { Octicons ,MaterialCommunityIcons,MaterialIcons,SimpleLineIcons} from '@expo/vector-icons';
import settings  from '../constants/Settings.js';
// import * as Google from 'expo-google-app-auth';
// import * as Facebook from 'expo-facebook';

const serverURL = settings.url;

const deviceId = Constants.deviceId ;
const { width } = Dimensions.get('window');





export default class PasswordResetScreen extends React.Component {

  static navigationOptions =  {
        header:null
    }


    constructor(props) {
      super(props);

      this.state = {
        email:'',
      };
    }

    handleBackButtonClick=()=> {
      this.props.navigation.goBack();
      return true;
    };

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }







  render(){

    return(
      <View style={{flex:1,backgroundColor: '#f8fafb',marginBottom:this.state.keyboardOpen?this.state.keyboardHeight:0,}}>
      <View style={styles.statusBar} />
      <WebView
      source={{uri:serverURL+'/accounts/password/reset/' }}
      startInLoadingState
      scalesPageToFit
      javaScriptEnabled
      style={{ flex: 1,width:width*1, }}
      />
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
  statusBar: {
   backgroundColor: "#032757",
   height: Constants.statusBarHeight,
 },



})
