import * as React from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity, Platform, Image,AsyncStorage,Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { Icon } from "react-native-elements";
import { withNavigation } from 'react-navigation';
import SupportChat  from './SupportChat.js';
import { MonoText } from '../components/StyledText';

const serverURL = "https://app.syrow.com";
export default class SupportChatScreen extends React.Component {

  static navigationOptions =  ({ navigation }) => {
  const { params = {} } = navigation.state
     return {
           title: 'EpsilonAI',
           headerStyle: {
                 backgroundColor: '#000',
                 marginTop:Constants.statusBarHeight
               },
            headerTintColor: '#fff',
            }
    };

    constructor(props) {
      super(props);
      this.state = {
        hasCameraPermission: null,
        scanned: false,
        showCamera:true,
        directChat:false,
        updateChat:true
      };
    }



  async componentDidMount() {
    // this.props.navigation.navigate('ChatScreen', {
    //   apikey: "EUJbqOw66BQWaO6mSvQBtfDyg1f8yLkcbBA2VxGqDg",
    //   service : 'support.cioc.in',
    //   wamp_prefix : 'cioc',
    //   apikey: "QNT411vD0EkddaMOLv4mXvDEoU3rb2jvJ9nATFvCll8=",
    //   service : 'app.syrow.com',
    //   wamp_prefix : 'test',
    //   socket_server : 'socket.syrow.com'
    // });
    // return;
    // this.showAlert();
    // this.getPermissionsAsync();
    // this.handleBarCodeScanned('','');
  }









  render() {

      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            width:'100%',
          }}>
            <SupportChat apikey='EUJbqOw66BQWaO6mSvQBtfDyg1f8yLkcbBA2VxGqDg' minimize={()=>this.props.navigation.navigate('Home')}  goBack={(d)=>{console.log(d);this.setState({directChat:false,});this.props.navigation.navigate('Home')}} />
        </View>
      )

    }

}
