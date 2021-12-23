import wamp from 'wamp.js2';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
  FlatList,
  Button,
  Platform,
  TouchableHighlight,
  Dimensions,
  WebView,
  StatusBar,
  AsyncStorage,
  KeyboardAvoidingView,
  Keyboard,
  Linking,
  BackHandler,
  ActivityIndicator,
  AppState
} from 'react-native';
import Modal from "react-native-modal";
import { Icon } from "react-native-elements";
import HTML from 'react-native-render-html';
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';
import { Asset } from 'expo-asset';
import settings from '../constants/Settings.js';
import { MonoText } from '../components/StyledText';
import { ScreenOrientation } from 'expo';
import  Constants  from 'expo-constants';
import { FontAwesome ,MaterialCommunityIcons,MaterialIcons,SimpleLineIcons} from '@expo/vector-icons';
import {Notifications } from 'expo';
import { Video } from 'expo-av';



function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

class BarStatus extends Component<{}> {

render() {

    return (
      <StatusBar
         backgroundColor="#000"
         barStyle="light-content"
      />

   );
  }
}

const styless = StyleSheet.create({
  container: {
    flex: 1
  },
  icon: {
    paddingLeft: 10,
    color:'#fff',
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: 120
  }
})


const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');
const wamp_prefix = "uniqueKey123.";
const options = {
  title: 'Select Avatar',
  customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

class ChatSupport extends Component {


   static navigationOptions = ({ navigation }) => {
     const { params = {} } = navigation.state
     return {
       header:null
     }
   };


  constructor(props) {
    super(props);

    this.state = {
      data: [],
       modalVisible: false,
       color: '#000',
       message:'',
       company : 2,
       fontColor:'#000',
       firstMessage : null,
       uid : null,
       chatThreadPk : null,
       session : null,
       connection : new wamp.Connection({url: 'wss://ws.syrow.com:8080/ws', realm: 'default'}),
       companyName : null,
       mascotName : null,
       mascotIcon : null,
       agentPk : null,
       scrollHeight:Dimensions.get('window').height,
       keyboardOpen : false,
       starIcon : ['ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline'],
       rateColor : ['#000','#000','#000','#000','#000'],
       starRating : 0 ,
       attachModal:false,
       hasCameraPermission: null,
       cameraShow:false,
       keyboardHeight:0,
       selectedImgUrl:null,
       imageModal:false,
       imageVideoUpload:false,
       // companyApi: props.navigation.state.params.apikey,
       // serverURL: 'https://' + props.navigation.state.params.service,
       // wamp_prefix: props.navigation.state.params.wamp_prefix + '.',
       // socket_server:'https://' + props.navigation.state.params.socket_server,
       companyApi: 'EUJbqOw66BQWaO6mSvQBtfDyg1f8yLkcbBA2VxGqDg',
       serverURL: 'https://support.cioc.in',
       wamp_prefix:'cioc.',
       socket_server:'https://socket.syrow.com',
       videoShow:false,
       videoPermission:false,
       videoModal:false,
       playVideo:null,
       imagesLoad:[],
       fullScreen:true,
       videoShowOrientation:null,
       typing:false,
       canNotMinimize : false,
       agentName:'',
       displayPic:'',
       onlineStatusColor:'red',
       themeColor:'#fff',
       minimize:true,
       subscribe:false,
       reRender:false,
       appState: AppState.currentState,
       messageCount:0,
       noficationId:null
    };
    this.handleHide = this.handleHide.bind(this);
    this.goback = this.props.goback;

    this.listenForNotifications = this.listenForNotifications.bind(this);



   this.requestReadPermission=this.requestReadPermission.bind(this);


  this.CameraPermission=this.CameraPermission.bind(this);

  this.VideoPermission=this.videoPermission.bind(this)


    Keyboard.addListener(
      'keyboardDidHide',
      this.showKeyboard
    )

    Keyboard.addListener(
      'keyboardDidShow', this.hideKeyboard
    )


  }

  requestReadPermission = async() => {
   const permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
   if (permission.status !== 'granted') {
       const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
       if (newPermission.status === 'granted') {
         this.setState({ hasCameraPermission: newPermission.status === 'granted' });
       }
   } else {
    this.setState({ hasCameraPermission: permission.status === 'granted' });
   }
 }



  CameraPermission = async() => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  videoPermission =async ()=>{
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if(status == 'granted'){
      this.setState({ videoPermission :true });
    }
  }


  componentWillMount=()=>{
     this.listenForNotifications();
      BackHandler.addEventListener('hardwareBackPress', this.searchWorkoutHandler);
      AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount=()=>{
      BackHandler.removeEventListener('hardwareBackPress', this.searchWorkoutHandler);
      AppState.removeEventListener('change', this._handleAppStateChange);
  }


  _handleAppStateChange = (nextAppState) => {
    console.log(nextAppState,'fgdjs');
    if(nextAppState == 'background'){
      this.setState({appState:nextAppState,messageCount:0,noficationId:null})
    }
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
    }
    this.setState({appState: nextAppState,});
  };

  async _loadAssetsAsync() {
     const imageAssets = cacheImages(this.state.imagesLoad);
     await Promise.all([...imageAssets]);
   }


   // componentWillMount() {
   //     BackHandler.addEventListener('hardwareBackPress', this.searchWorkoutHandler);
   // }
   //
   // componentWillUnmount() {
   //     BackHandler.removeEventListener('hardwareBackPress', this.searchWorkoutHandler);
   // }

  showKeyboard =()=>{
    this.setState({keyboardOpen : false})

      this.setState({scrollHeight:this.state.scrollHeight})
      setTimeout(()=> {
        if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
          return
        }
        this.refs._scrollView.scrollToEnd({animated: true});
      }, 500);
  }
  hideKeyboard =(e)=>{
      this.setState({keyboardOpen : true})
      if(Platform.OS == 'ios'){
        this.setState({
            keyboardHeight:
                 e.endCoordinates.height
        });
      }else{
        this.setState({
            keyboardHeight:
                 e.endCoordinates.height+26
        });
      }


      try {
        this.setState({scrollHeight:this.state.scrollHeight-this.state.keyboardHeight})
      } catch (e) {

      } finally {

      }

      setTimeout(()=> {
        if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
          return
        }
        this.refs._scrollView.scrollToEnd({animated: true});
      }, 500);

  }

  handleHide() {
        this.setState({ videoModal: false });
      }

      listenForNotifications = () => {
            const _this = this;
            Notifications.addListener(notification => {
              console.log(notification.notificationId,this.state.noficationId,'new message',notification);
              // if(this.state.notificationId!=null){
              //   console.log(this.state.notificationId,'ddddddd');
                // Notifications.dismissNotificationAsync(this.state.noficationId);
              // // }
              if(notification.origin == 'received'){
                this.setState({noficationId:notification.notificationId,})
              }
         });
  };

  supportChat = (args)=>{
    console.log(args, 'args supportChat');
    this.getNotificationPermission()

    if(args[0] == 'F'){
      this.setState({canNotMinimize : true, starRating : 0});
      // this.setModalVisible();
      this.setState({modalVisible:true});
      // @vignesh show the feedback form here

    }else if (args[0] == 'T') {
      this.setState({typing : true})
      setTimeout(()=> {
        this.setState({typing : false})
      }, 2500);

    }else if (args[0] == 'M') {
      if(this.state.appState == 'background'&&this.state.noficationId!=null){
        Notifications.dismissAllNotificationsAsync()
      }
      this.setState({messageCount:this.state.messageCount+1})
      args[1].type = 'in';
      args[1].timeDate = this.timeWithDate(new Date());
      this.setState(prevState => ({
        data: [  ...prevState.data, args[1]],
        agentPk : args[1].user,
        typing : false
      }))

    }else if (args[0] == 'MF') {
      //args[1].filePk

      fetch(this.state.serverURL + "/api/support/supportChat/" + args[1].filePk + '/')
      .then((response) => response.json())
      .then((responseJson) => {

        responseJson.timeDate = this.timeWithDate(new Date(responseJson.created));
        if (responseJson.sentByAgent == true) {
          responseJson.type = 'in';
        }else{
          responseJson.type = 'out';
          responseJson.message = '<div style="color:'+this.state.fontColor+';">' + responseJson.message + '</div>';
        }

        if (responseJson.attachmentType == 'image') {
          responseJson.message = responseJson.attachment ;
          // responseJson.message = '<img style="max-width:200px" src="'+ responseJson.attachment +'" >' ;
        }else if (responseJson.attachmentType == 'youtubeLink') {

        // https://www.youtube.com/embed/iuNJLtj10Lg?autoplay=0&enablejsapi=1
          var id = responseJson.message.split('www.youtube.com/embed/')[1]
          id = id.split('?')[0]
          responseJson.attachment = 'https://img.youtube.com//vi/'+ id +'/0.jpg';

          responseJson.type = 'in';

        }else if(responseJson.attachmentType == 'application'){
          var urlParts = responseJson.attachment.split('/');
          var nameparts = urlParts[urlParts.length -1].split('_');
          responseJson.message = nameparts[nameparts.length -1] ;
        }
        console.log(responseJson,'calcculate')
        this.setState(prevState => ({
          data: [  ...prevState.data, responseJson],
          agentPk : responseJson.user
        }))

        }
      )
      .catch((error) => {
        return
      });





    }else if (args[0] == 'ML') {

      if (args[1].attachmentType == 'youtubeLink') {
        var id = args[1].message.split('www.youtube.com/embed/')[1]
        id = id.split('?')[0]
        args[1].attachment = 'https://img.youtube.com//vi/'+ id +'/0.jpg';
        args[1].type = 'in';
        this.setState(prevState => ({
          data: [  ...prevState.data, args[1]],
          agentPk : args[1].user
        }))
      }

    }

    if (args.length >2) {
      // this.props.navigation.setParams({
      //   getAgentName: args[2].last_name,
      //   getDisplayPic : args[2].agentDp,
      // });
      this.setState({agentName:args[2].last_name,displayPic:args[2].agentDp})
    }


    if(this.state.appState == 'background'){
      var text = this.state.messageCount>1?'s':''
      const localnotification = {
        title: args[2].last_name,
        body:  this.state.messageCount +' New Message'+text,
        android: {
          sound: true,
          color: this.state.color,
        },
        ios: {
          sound: true,
        },

        data: {
          count: this.state.messageCount
        },
      };
      localnotification.data.title = localnotification.title;
      localnotification.data.body = localnotification.body;
      let sendAfterFiveSeconds = Date.now();
      sendAfterFiveSeconds += 1000;
      const schedulingOptions = { time: sendAfterFiveSeconds };
      Notifications.presentLocalNotificationAsync(
        localnotification,
     );
   }

  }







  checkHeartBeat = (args)=>{
    console.log(args);
    if (args[0]=='isOnline' ) {
        this.state.connection.session.publish(this.state.wamp_prefix+'service.support.checkHeartBeat.'+args[2], ['iAmOnline', this.state.uid, args[2]] , {}, {
          acknowledge: true
        }).
        then(function(publication) {
        },function(){
        });
      }

      if (agentPk && args[0]=='iAmOnline' && args[1]==this.state.agentPk && args[2]==this.state.uid) {
        console.log("Got agent heartbeat");
        // isAgentOnline = true;
        // onlineStatus.innerHTML = 'Online';
        // clearTimeout(agentOnlineTimeOut);
      }
  }

  loggedInStatus = (args)=>{
    console.log("loggedin status " , args)
    // this.setState({agentPk : args[0]})
    //
    // if(args[3] != this.state.uid){
    //   return;
    // }
    //
    //
    // if(args[2] != null && args[2].length > 10){
    //   // this.props.navigation.setParams({
    //   //   getDisplayPic : args[2],
    //   //   getAgentName: args[1],
    //   // });
    //   this.setState({displayPic:args[2],agentName: args[1]})
    // }else{
    //   // this.props.navigation.setParams({
    //   //   getAgentName: args[1],
    //   // });
    //   this.setState({agentName: args[1]})
    // }
  }


  fetchExistingChat(value){
    fetch(this.state.serverURL + "/api/support/supportChat/?uid=" + value)
    .then((response) => response.json())
    .then((responseJson) => {

      for (var i = 0; i < responseJson.length; i++) {
        console.log(responseJson[i]);
        responseJson[i].timeDate = this.timeWithDate(new Date(responseJson[i].created));
        if (responseJson[i].sentByAgent == true) {
          responseJson[i].type = 'in';
        }else{
          responseJson[i].type = 'out';
          responseJson[i].message = '<div style="color:'+this.state.fontColor+';">' + responseJson[i].message + '</div>';
        }

        if (responseJson[i].attachmentType == 'image') {
          var image = this.state.imagesLoad
          image.push(responseJson[i].attachment)
          this.setState({imagesLoad:image})
          responseJson[i].message = responseJson[i].attachment ;
          // responseJson[i].message = '<img style="max-width:200px" src="'+ responseJson[i].attachment +'" >' ;
        }else if (responseJson[i].attachmentType == 'youtubeLink') {

        // https://www.youtube.com/embed/iuNJLtj10Lg?autoplay=0&enablejsapi=1
          var id = responseJson[i].message.split('www.youtube.com/embed/')[1]
          id = id.split('?')[0]
          responseJson[i].attachment = 'https://img.youtube.com//vi/'+ id +'/0.jpg';

        }else if(responseJson[i].attachmentType == 'application'){
          var urlParts = responseJson[i].attachment.split('/');
          var nameparts = urlParts[urlParts.length -1].split('_');
          responseJson[i].message = nameparts[nameparts.length -1] ;
          console.log(responseJson[i] , "attachment")
        }

      }
      console.log(responseJson)
      this._loadAssetsAsync()
      this.setState(prevState => ({
        data: [  ...prevState.data, ...responseJson]
      }))



    })
    .catch((error) => {
      return
    });
  }

  getNotificationPermission=async()=>{
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (status !== 'granted') {
      await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }

  }

  componentDidMount() {

    this.getNotificationPermission()
    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('Chat', {
        name: 'Chat',
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }

    onlineAgent =()=>{
      if (this.state.agentPk) {
          if (this.state.connection == null || this.state.connection.session == null || this.state.connection.session.call == null) {
            return
          }

          this.state.connection.session.call(this.state.wamp_prefix+'service.support.heartbeat.' + this.state.agentPk, []).then(
            (res)=> {
              // console.log("online status");
              // this.props.navigation.setParams({
              //   onlineStatusColor : 'green'
              // });
              this.setState({
                onlineStatusColor : 'green'
              });
           },
           (err)=> {
             // this.props.navigation.setParams({
             //   onlineStatusColor : 'red'
             // });
             this.setState({
               onlineStatusColor : 'red'
             });
          }
         );
      }else {
        // console.log("default online status");
        // this.props.navigation.setParams({
        //   onlineStatusColor : 'green'
        // });
        this.setState({
          onlineStatusColor : 'green'
        });
      }
    }



    this.initiateSubscriptions()



    AsyncStorage.getItem('uid').then((value) => {
      if(value == null){
        value = ''+ new Date().getTime();
        AsyncStorage.setItem('uid', value);
        this.setState({uid : value});
        console.log("reseting the UID to " , value);
        this.state.connection.open();
      }else{
        this.fetchExistingChat(value)
        this.setState({uid : value});
        this.state.connection.open();
      }
      // AsyncStorage.removeItem('uid');
      // AsyncStorage.removeItem('chatThreadPk');

    })

    AsyncStorage.getItem('chatThreadPk').then((value) => {
      this.setState({chatThreadPk : value});
    })

    // Alert.alert('Loaded!')
    // console.log(this.state.companyApi);
    // console.log(this.state.companyApi,"companyApi");
    fetch( this.state.serverURL + '/api/support/customerProfile/?scriptVal__contains=' + this.state.companyApi)
    .then((response) => response.json())
    .then((responseJson) => {

      // console.log(responseJson[0], 'responseJson ');
      if(responseJson[0] == 'undefined') this.setState({color:'#f3961d'});
      else  this.setState({color:responseJson[0]['windowColor'] , firstMessage : responseJson[0]['firstMessage'] , companyName :  "iOS-SDK", company: responseJson[0]['pk'],fontColor:responseJson[0]['fontColor']});
      var mascotImg;

      if (!responseJson[0]['dp']) {
        mascotImg = this.state.serverURL + '/static/images/img_avatar_card.png'
      }else{
        mascotImg = responseJson[0]['dp']
      }

      this.setState(prevState => ({
        data: [ {pk:0, type:'in',  message: responseJson[0]['firstMessage'] }, ...prevState.data],
        mascotIcon : mascotImg,
        mascotName : responseJson[0]['name'],
      }))

      // this.props.navigation.setParams({
      //   getAgentName: responseJson[0]['name'],
      //   getDisplayPic : mascotImg,
      //   themeColor : responseJson[0]['windowColor'],
      //   onlineStatusColor : 'green',
      //   fontColor:responseJson[0]['fontColor'],
      // });
      if(responseJson[0]!='undefined'){

        this.setState({agentName:responseJson[0]['name'],displayPic:mascotImg,themeColor:responseJson[0]['windowColor'],onlineStatusColor : 'green',fontColor:responseJson[0]['fontColor']})
      }

    })
    .catch((error) => {
      return
    });


    // this.props.navigation.setParams({
    //   searchWorkouts: this.searchWorkoutHandler,
    // });
    //
    // this.props.navigation.setParams({
    //   getAgentName: "Pradeep",
    // });
  }

  initiateSubscriptions=()=>{
    this.state.connection.onopen = (session)=>{
      this.setState({session : session});
       // 1) subscribe to a topic
       setInterval(function () {
         try {
            onlineAgent();
         }
         catch (e) {
           // console.error(e.message);
         }
       }, 2000);

      session.subscribe(this.state.wamp_prefix+'service.support.chat.' + this.state.uid, this.supportChat).then(
      (sub) => {
        this.setState({subscribe:true})
      },
      (err) => {
        console.log("failed to subscribe: service.support.chat"+err);
      });


      session.subscribe(this.state.wamp_prefix+'service.support.checkHeartBeat.'+this.state.uid, this.checkHeartBeat).then(
        function (res) {
          this.setState({subscribe:true})
          console.log("subscribed to service.support.createDetailCookie'");
        },
        function (err) {
          console.log("failed to subscribe: service.support.createDetailCookie");
        }
      );

      session.register(this.state.wamp_prefix+'service.support.loggedIn.'+this.state.uid, this.loggedInStatus).then(
        function (res) {
          this.setState({subscribe:true})
          console.log("subscribed to service.support.loggedIn'");
        },
        function (err) {
          console.log("failed to subscribe: service.support.loggedIn");
        }
      );
    };
  }

  timeWithDate=(date)=> {
    // console.log("date in put : " , date);
    var abc  = date
    var hours = abc.getHours();
    var minutes = abc.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime
  }

  publishMessage = (message)=>{
    // console.log(message, 'publishMessage');
    // console.log( "will send the message ", message , "with chat thread " , this.state.chatThreadPk);

    // https://www.youtube.com/embed/FEf412bSPLs?autoplay=0&enablejsapi=1
    attachmentType = undefined;

    if(message.indexOf('youtube.com') != -1){

      // https://www.youtube.com/watch?v=FEf412bSPLs

      message = 'https://www.youtube.com/embed/'+ message.split('?v=')[1] +'?autoplay=0&enablejsapi=1'
      attachmentType = 'youtubeLink'
    }


    this.textInput.clear()
    this.setState({message : ""})

    msgObj = {
      "attachment": null,
      "attachmentType": attachmentType,
      "created": new Date(),
      "delivered": false,
      "is_hidden": false,
      "logs": null,
      "message": message,
      "pk": null,
      "read": false,
      "responseTime": null,
      "sentByAgent": false,
      "uid": this.state.uid,
      "user": null,
    }

    let dataToPublish = [this.state.uid, 'M', msgObj, this.state.company, false, this.state.chatThreadPk, this.state.companyName, this.state.company]

    var subject = this.state.wamp_prefix+'service.support.agent';
    if(this.state.agentPk != null && this.state.agentPk != undefined){
      subject = this.state.wamp_prefix+'service.support.agent.' + this.state.agentPk;
    }

    this.state.connection.session.publish( subject, dataToPublish, {}, {
      acknowledge: true
    })

    msgObj.type = 'out';
    if (msgObj.attachmentType == 'youtubeLink') {

    // https://www.youtube.com/embed/iuNJLtj10Lg?autoplay=0&enablejsapi=1
      var id = msgObj.message.split('www.youtube.com/embed/')[1]
      id = id.split('?')[0]
      msgObj.attachment = 'https://img.youtube.com//vi/'+ id +'/0.jpg';


    }else if(msgObj.attachmentType == 'application'){
      var urlParts = msgObj.attachment.split('/');
      var nameparts = urlParts[urlParts.length -1].split('_');
      msgObj.message = nameparts[nameparts.length -1] ;
    }

    msgObj.message = '<div style="color:'+this.state.fontColor+';">' + msgObj.message.replace(/\n/g,'<br>') + '</div>';
    msgObj.timeDate = this.timeWithDate(new Date())
    this.setState(prevState => ({
      data: [ ...prevState.data, msgObj],
    }))


    fetch(this.state.serverURL + "/api/support/supportChat/", {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        sentByAgent: false,
        uid : this.state.uid,
        is_hidden : false,
        created : new Date(),
        timeDate : this.timeWithDate(new Date()),
        attachmentType : attachmentType
      }),
    }).then((response) => response.json())
    .then((responseJson) => {
      // console.log(responseJson)

    })
    .catch((error) => {
      return
    });;
  }

  createNewChatThread = (message)=>{
    // console.log(message, 'args createNewChatThread');
    fetch(this.state.serverURL + "/api/support/chatThread/", {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company: this.state.company,
        firstMessage: this.state.firstMessage,
        uid : this.state.uid
      }),
    }).then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson.pk , "chatthread pk")
      this.publishMessage(message)
      this.setState({chatThreadPk : responseJson.pk})
      AsyncStorage.setItem('chatThreadPk', ''+ responseJson.pk);

    })
    .catch((error) => {
      return
      this.publishMessage(message)
    });
  }

  createNewChatThreadAttach = (fd)=>{
    // console.log(message, 'args createNewChatThread');
    fetch(this.state.serverURL + "/api/support/chatThread/", {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company: this.state.company,
        firstMessage: this.state.firstMessage,
        uid : this.state.uid
      }),
    }).then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson.pk , "chatthread pk")
      this.postAttachment(fd)
      this.setState({chatThreadPk : responseJson.pk})
      AsyncStorage.setItem('chatThreadPk', ''+ responseJson.pk);

    })
    .catch((error) => {
      return
      this.publishMessage(message)
    });
  }

  sendMessage = (message) => {
    // console.log(message, 'args sendMessage');
    if (message == "") {
      return;
    }
    if(message.length < 1) this.setState({message:'   '}) ;
    if (this.state.chatThreadPk != null) {
      this.publishMessage(message);
    }else{
      this.createNewChatThread(message);
    }



  }

  userTextChanged = (text)=>{
    // console.log(text, 'userTextChanged');
    this.setState({message:text})
    if (this.state.agentPk == null || !text.endsWith(' ')) {
      return;
    }


    this.state.connection.session.publish(this.state.wamp_prefix+'service.support.agent.'+ this.state.agentPk, [this.state.uid , 'T' , text] , {}, {
        acknowledge: true
    })
  }

 searchWorkoutHandler = () => {
   // console.log('searchWorkoutHandler');

   var starIcon = ['ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline']
   if(this.state.subscribe){
     if (this.state.data.length >1 && !this.state.cameraShow && !this.state.videoShow) {
       if(this.state.modalVisible == false) this.setState({modalVisible:true, starRating : 0, rateColor : ['#000','#000','#000','#000','#000'],starIcon : starIcon});
       else this.setState({modalVisible:false})
     }else if(this.state.cameraShow){
       this.setState({cameraShow:false})
     }else if(this.state.videoShow){
       this.setState({videoShow:false})
     }else{
       // this.props.navigation.goBack();
       this.setState({reRender:true})
       this.props.goBack('THis Screen was closed');
     }
     return true;

   }else{
     this.props.goBack('THis Screen was closed');
     return true;
   }


  };
  setVideoVisible(visible) {

    this.setState({ videoModal: visible });

    if(visible == true){
    this.setState({videoShowOrientation:false})
    }else{
      this.setState({videoShowOrientation:null})
    }
    console.log(this.state.videoModal,'trueeeeeeeee');
  }

  resetChat = ()=>{
    console.log('resetChat');

    // fetch(this.state.serverURL + "/api/support/chatThread/"+ this.state.chatThreadPk + '/', {
    //   method: 'PATCH',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({}),
    // }).then((response) => response.json())
    // .then((responseJson) => {
    //   // console.log(responseJson)
    // })
    // .catch((error) => {
    //   return
    // });


    var uid = ''+ new Date().getTime();
    AsyncStorage.setItem('uid', uid);
    AsyncStorage.removeItem('chatThreadPk');
    this.setState({chatThreadPk : null, uid : uid , data : [{pk:0, type:'in',  message: this.state.firstMessage }]  , connection : new wamp.Connection({url: 'wss://ws.syrow.com:8080/ws', realm: 'default'}) , starRating : 0 , rateColor : ['#000','#000','#000','#000','#000'] });
    // this.props.navigation.setParams({
    //   getAgentName: this.state.mascotName,
    //   getDisplayPic : this.state.mascotIcon,
    // });
    this.setState({agentName: this.state.mascotName,displayPic : this.state.mascotIcon})



    // 'https://app.syrow.com/api/support/chatThread/'+ chatThreadPk + '/'

    var dataToSend = {uid:this.state.uid , userEndedChat: 'CHAT CLOSED BY USER' , sentByAgent:false };
    this.state.connection.session.publish(this.state.wamp_prefix+'service.support.agent.'+this.state.agentPk, [this.state.uid , 'CL' , dataToSend ] , {}, {
       acknowledge: true
     })

     // this.props.navigation.navigate('BarcodeScanner')
     // this.props.goBack()
     return;
     setTimeout(() => {
       this.initiateSubscriptions()
       this.state.connection.open();
       // this.state.connection.onopen(this.state.connection._session)
     }, 2000)
  }

  minimize=()=>{
    // this.props.navigation.navigate('BarcodeScanner')
    BackHandler.removeEventListener('hardwareBackPress', this.searchWorkoutHandler);
    this.setState({modalVisible:false,minimize:true})
    this.props.minimize()
  }


  setModalAttachState=async(visible)=>{

    const { status, expires, permissions } = await Permissions.getAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );

      if(permissions.camera.status == 'granted'){
        if(permissions.cameraRoll.status == 'granted'){
          this.setState({attachModal:visible});
        }else{
          this.getCameraRollAsync()
        }
      }else{
        this.getCameraAsync()
      }
  }

  getCameraAsync=async()=> {

  const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
  if (status === 'granted') {
    this.setModalAttachState(true)
  } else {
    throw new Error('Camera permission not granted');
  }
}

 getCameraRollAsync=async()=> {

  const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  if (status === 'granted') {
    this.setModalAttachState(true)
  } else {
    throw new Error('Gallery permission not granted');
  }
}

  setModalVisible = (feedback)=> {



    // console.log(this.state.serverURL + "/api/support/chatThread/" +this.state.chatThreadPk + '/url.....')

    var toSend = {"customerRating":this.state.starRating, status:"closed",closedByUser:1 }
    if(feedback != undefined){
      toSend.customerFeedback = feedback
      if(this.state.feedbackEmail.length>2){
        toSend.email = this.state.feedbackEmail
      }
    }
    console.log(toSend,'feedback');
    // return
    fetch(this.state.serverURL + "/api/support/chatThread/" +this.state.chatThreadPk + '/', {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toSend),//,"email":"pkk@gmail.com"
    }).then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson , "after saving")
    })
    .catch((error) => {
      console.log(error)
    });


    if (feedback == undefined || feedback == null) {
      this.resetChat();
      this.setState({modalVisible: false});
      // this.forceUpdate()
      // AsyncStorage.setItem('uid', null);
      this.props.goBack()
    }else{
      console.log(feedback);
      var dataToSend = {uid:this.state.uid , usersFeedback:feedback  , rating: this.state.starRating , sentByAgent:false };

       this.state.connection.session.publish(this.state.wamp_prefix+'service.support.agent.'+ this.state.agentPk, [this.state.uid , 'FB' , dataToSend ] , {}, {
         acknowledge: true
       })

       ///api/support/chatThread/6996/
       // {"customerRating":5,"customerFeedback":"test","email":"pkk@gmail.com"}




     this.resetChat();
     this.rating(0);
     this.setState({modalVisible: false,feedbackEmail:''});
     // this.forceUpdate()
     // AsyncStorage.setItem('uid', null);
     this.props.goBack()
    }
 }

 openMessage = (message)=>{
   // console.log(message,'openMessage');
   //Alert.alert(message)
    console.log(message.attachmentType);
    if (message.attachmentType == undefined && message.attachment == undefined) {
     return
    }

    if (message.attachmentType == 'video') {
     this.setState({playVideo:message.attachment})
     this.setVideoVisible(true)
     return
   }else if (message.attachmentType == 'image') {
     this.setState({selectedImgUrl:message.attachment,imageModal:true})
     // Linking.openURL(message.attachment)
   }
   else if (message.message.indexOf('http://') != -1 || message.message.indexOf('https://') != -1) {
     return
     Linking.openURL(message.message)
   }else if (message.attachment.indexOf('http://') != -1 || message.attachment.indexOf('https://') != -1) {
     return
     Linking.openURL(message.attachment)
   }

 }

companyWebsite = ()=>{
  url = 'https://cioc.in'
  Linking.openURL(url)
}

  renderDate = (date) => {
    // console.log(date,'renderDate');
    return(
      <MonoText   style={styles.time}>
        {date}
      </MonoText>
    );
  }


 rating = (count) => {
   // console.log(count,'rating');
   let arr = ['#000','#000','#000','#000','#000'];
   let staricon = ['ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline'];
   arr.forEach((val,index)=>{
     if(index>count-1)return;
     arr[index] = this.state.color
   })
   staricon.forEach((val,index)=>{
     if(index>count-1)return;
     staricon[index] = 'ios-star'
   })
   this.setState({starIcon:staricon, rateColor:arr, starRating:count});
 }

 modalAttach = (event) => {
      console.log(event,'modalAttach');
     // this.setState({attachModal:!this.state.attachModal});
     if(event == 'gallery') return this._pickImage();
     if(event == 'camera') {
      // this.setState({ cameraShow: true });
      this.handlePhoto()
    //   let result  = await ImagePicker.launchCameraAsync({
    //     mediaTypes: ImagePicker.MediaTypeOptions.All,
    // });
     }
     if(event == 'video') {
       this.videoCam()

   }

 };

 videoCam = async ()=>{
   let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Videos});

    if(picture.cancelled == true){
      return
    }
    this.setModalAttachState(false)
    let video = new FormData();
    let filename = picture.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `video/${match[1]}` : `video`;

    const photo = {
      uri: picture.uri,
      type: type,
      name:filename,
    };

    video.append('attachmentType', 'video');
    video.append('uid' , this.state.uid);
    video.append('attachment', photo);

    this.textInput.clear()

    console.log(this.state.serverURL,this.state.uid,photo,'lllllll');

    if(this.state.chatThreadPk == null){
      this.createNewChatThreadAttach(video)
    }else{
      this.postAttachment(video)
    }

 }



 _pickImage = async () => {
   console.log('_pickImage');
     // let result = await ImagePicker.launchImageLibraryAsync({
     // allowsEditing: true,
     // });
     let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });

    this.setModalAttachState(false)
     this.setState({ image: result.uri });
     console.log(result.type,'ffffffff', this.state.chatThreadPk);
     let img = new FormData();
     let filename = result.uri.split('/').pop();
     let match = /\.(\w+)$/.exec(filename);
     if(result.type == 'image'){
       var type = match ? `image/${match[1]}` : `image`;
     }else{
       var type = match ? `video/${match[1]}` : `video`;
     }

     const photo = {
       uri: result.uri,
       type: type,
       name:filename,
     };

//      Object {
//   "attachment": "https://app.syrow.com/media/support/chat/1576318357_69_67772AC7-B3D4-41A1-BAB5-5E13C65AC390.jpg",
//   "attachmentType": "image",
//   "created": "2019-12-14T10:12:37.685304Z",
//   "delivered": false,
//   "is_hidden": false,
//   "logs": null,
//   "message": null,
//   "pk": 46059,
//   "read": false,
//   "responseTime": null,
//   "sentByAgent": false,
//   "uid": "1576318267508",
//   "user": null,
// }


     if(result.type == 'image'){
     img.append('attachmentType', 'image');
     }else{
     img.append('attachmentType', 'video');
     }

     img.append('uid' , this.state.uid);
     img.append('attachment', photo);

     this.textInput.clear()

     console.log(this.state.serverURL,this.state.uid,photo,'lllllll');

     if(this.state.chatThreadPk == null){
       this.createNewChatThreadAttach(img)
     }else{
       this.postAttachment(img)
     }






     // const total = Number(req.headers.get('content-length'));
     // let loaded = 0;
     //  for await(const {length} of req.body.getReader()) {
     //      loaded  += length;
     //        const progress = ((loaded / total) * 100).toFixed(2); // toFixed(2) means two digits after floating point
     //        console.log(`${progress}%`); // or yourDiv.textContent = `${progress}%`;
     // }


};

postAttachment = async (img)=>{
  this.setState({imageVideoUpload:true})

  var req = await fetch(this.state.serverURL + "/api/support/supportChat/", {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
    body: img,
  }).then((response) => {
    if(response.status != 500){
      console.log(response,'pppp');
      return response.json()
    }else{
      return undefined
    }
 }).then((responseJson) => {
    console.log(responseJson,'yyyyyyyyyyyyyyyyyy')
    if(responseJson == undefined){
      return
    }
    let dataToPublish = [this.state.uid, 'M', responseJson, this.state.company, false, this.state.chatThreadPk, this.state.companyName, this.state.company]

    var subject = this.state.wamp_prefix+'service.support.agent';
    if(this.state.agentPk != null && this.state.agentPk != undefined){
      subject = this.state.wamp_prefix+'service.support.agent.' + this.state.agentPk;
    }

    this.state.connection.session.publish(subject, dataToPublish, {}, {
      acknowledge: true
    })
    responseJson.message = responseJson.attachment;
    responseJson.timeDate = this.timeWithDate(new Date())
    this.setState(prevState => ({
      data: [ ...prevState.data, responseJson],
    }))
  })
  .catch((error) => {
    return
  });
  this.setState({imageVideoUpload:false})
}


cameraRef = React.createRef();

handlePhoto = async () => {
  // if(this.cameraRef){
    let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});
    // let picture = await this.cameraRef.current.takePictureAsync();
    console.log(picture);
    // this.setState({cameraShow:false})
    this.setModalAttachState(false)
    if(picture.cancelled == true){
      return
    }

    this.setState({ image: picture.uri });

    let img = new FormData();
    let filename = picture.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    const photo = {
      uri: picture.uri,
      type: type,
      name:filename,
    };

    img.append('attachmentType', 'image');
    img.append('uid' , this.state.uid);
    img.append('attachment', photo);

    this.textInput.clear()

    console.log(this.state.serverURL,this.state.uid,photo,'lllllll');

    if(this.state.chatThreadPk == null){
      this.createNewChatThreadAttach(img);
    }else{
      this.postAttachment(img);
    }

  // }
}

  footer=()=>{
    return (
        <View  style={[{flex:1,alignItems: 'center',justifyContent: 'center',backgroundColor: '#e6e6e6'}]}>
        {this.state.imageVideoUpload?
        <ActivityIndicator size="large" color={this.state.themeColor} />
        :null
      }
        </View>
    )
  }



  render() {

      if ( this.state.cameraShow) {

         return (
           <View style={{ flex: 1 }}>
             <Camera style={{ flex: 1 }} type={this.state.type} ref={this.cameraRef}>
               <View
                 style={{
                   flex: 1,
                   backgroundColor: 'transparent',
                   flexDirection: 'row',
                   justifyContent:'center',
                   alignItems: 'flex-end',
                 }}>

                 <TouchableOpacity
                   style={{  flexWrap: 'nowrap',alignItems: 'flex-end',justifyContent:'center',width:60, height:60, borderRadius:30, backgroundColor:"#fff",marginBottom:20}}
                   onPress={this.handlePhoto} />
               </View>
             </Camera>
           </View>
         );
       }
       else if ( this.state.videoShow) {
         return (
           <View style={{ flex: 1 }}>
             <Camera style={{ flex: 1 }} type={this.state.type} ref={this.cameraRef}>
               <View
                 style={{
                   flex: 1,
                   backgroundColor: 'transparent',
                   flexDirection: 'row',
                   justifyContent:'center',
                   alignItems: 'flex-end',
                 }}>

                 <TouchableOpacity
                   style={{  flexWrap: 'nowrap',alignItems: 'flex-end',justifyContent:'center',width:60, height:60, borderRadius:30, backgroundColor:"#fff",marginBottom:20}}
                   onPress={this.handlePhoto} />
               </View>
             </Camera>
           </View>
         );
       }
       else{
         if(this.state.subscribe){
      return(


      <View style={styles.container}>

      <View  style={{position: 'absolute',top:0,right:0,left:0}}>
        <View style={{}}>
        <View style={{height:Constants.statusBarHeight,backgroundColor:this.state.themeColor}}></View>
          <View style={[styles.shadow,{height:58,alignItems: 'center',flexDirection: 'row',backgroundColor:this.state.themeColor}]}>
            <TouchableOpacity onPress={()=>{this.searchWorkoutHandler()}} style={{flex:0.13,alignItems: 'center'}}>
              <MaterialIcons name="arrow-back" size={30} color={this.state.fontColor} />
            </TouchableOpacity>
            <View style={{flex:0.67,flexDirection: 'row',alignItems: 'center',justifyContent: 'flex-start'}}>
              <Image
                   source={{uri : this.state.displayPic}}
                   style={{ width: 40, height: 40, borderRadius: 40/2,marginLeft:0 ,marginRight:15 }}
               />
               <MonoText   style={{color:this.state.fontColor,fontSize:20,fontWeight: '400'}} numberOfLines={1}>{this.state.agentName}</MonoText>
            </View>
            <View style={[styless.iconContainer,{flex:0.2,flexDirection: 'row'}]}>
              <View style={{width: 12,height: 12,borderRadius: 44,backgroundColor:this.state.onlineStatusColor,}} />
            </View>
          </View>
        </View>
        </View>

        <ScrollView
          ref='_scrollView'
          onContentSizeChange={() => { this.refs._scrollView.scrollToEnd({animated: true}); }}
          style={{height:this.state.keyboardOpen? this.state.keyboardHeight-(this.state.keyboardHeight/3): Dimensions.get('window').height,marginTop:58+Constants.statusBarHeight}}

        >
        <FlatList style={{paddingHorizontal: 17,paddingBottom: this.state.keyboardOpen? 30:80,marginBottom: this.state.keyboardOpen?22:30}}
//          inverted
          data={this.state.data}
          keyExtractor= {(item , index) => {
            return index.toString();
          }}
          ListFooterComponent = { this.footer }
          renderItem={(message) => {
            const item = message.item;
            let inMessage = item.type === 'in';
            if(item.message == null || item.message.length < 1 || item.message == 'undefined') var m = ' ';
            else var m = item.message
            let itemStyle = inMessage ? styles.itemIn : styles.itemOut;
            return (
              <View style={[ itemStyle]}   >
              <TouchableOpacity  onPress={() =>  {this.openMessage(item)} }>


                {inMessage && item.attachmentType == null &&
                <View style={[styles.item,styles.balloon]}>
                  <HTML html={item.message.replace(/\n/g,'<br>')}  />
                </View>
                }

                {inMessage && item.attachmentType == 'youtubeLink' &&
                <View style={[styles.item,styles.balloon]}>
                  {/* <HTML html={item.attachment}  /> */}
                  <Image source={{uri: item.attachment }}
                    style={{width: 200, height: 200}} />
                </View>
                }
                {inMessage && item.attachmentType == 'application' &&
                <View style={[styles.item,styles.balloon]}>
                  <HTML html={item.message.replace(/\n/g,'<br>')}  />
                </View>
                }
                {inMessage && item.attachmentType == 'video' &&
                <View style={[styles.item,styles.balloon,{width:200,height:200,backgroundColor:this.state.color}]} >
                    <View style={[styles.videoContainer,]}>
                     <Icon type="ionicon" name={Platform.OS === "ios" ? "ios-play-circle" : "md-play-circle"} size={80} color="#000" style={{textAlignVertical: 'center'}}/>
                    </View>
                </View>
                }
                {inMessage && item.attachmentType == 'image' &&
                <View style={[styles.item,styles.balloon]}>
                  <Image source={{uri: item.attachment }}
                    style={{width: 200, height: 200}} />
                </View>
                }
                {!inMessage && item.attachmentType == null &&
                <View style={[styles.itemout,styles.balloon,{backgroundColor:this.state.color,color: this.state.fontColor}]}>
                  <HTML html={m.replace(/\n/g,'<br>')}   />
                </View>
                }
                {!inMessage && item.attachmentType == 'youtubeLink' &&
                <View style={[styles.item,styles.balloon]}>
                  <Image source={{uri: item.attachment }}
                    style={{width: 200, height: 200}} />
                </View>
                }
                {!inMessage && item.attachmentType == 'application' &&
                <View style={[styles.item,styles.balloon]}>
                  <HTML html={item.message.replace(/\n/g,'<br>')}  />
                </View>
                }
                {!inMessage && item.attachmentType == 'image' &&
                <View style={[styles.itemout,styles.balloon,{backgroundColor:this.state.color}]}>
                  <Image source={{uri: item.attachment }}
                    style={{width: 200, height: 200}} />
                </View>
                }
                {!inMessage && item.attachmentType == 'video' &&
                <View style={[styles.itemout,styles.balloon,{backgroundColor:this.state.color,width:200,height:200}]}>

                    <View style={styles.videoContainer}>
                     <Icon type="ionicon" name={Platform.OS === "ios" ? "ios-play-circle" : "md-play-circle"} size={80} color="#000" style={{textAlignVertical: 'center'}}/>
                    </View>
                </View>
                }
                {inMessage && <MonoText   style={styles.time}>{item.timeDate}</MonoText> }
                {!inMessage && <MonoText   style={styles.timeout}>{item.timeDate}</MonoText> }
                </TouchableOpacity>
              </View>

            )
            }}/>


            </ScrollView>


            <View style={{position:'absolute',bottom:this.state.keyboardOpen? this.state.keyboardHeight: Platform.OS == 'ios'?10:0,left:0,right:0,width:'100%',marginVertical: 0,zIndex:100}}>
            {this.state.typing&&!this.state.imageVideoUpload&&
              <View style={{marginBottom:5}}>
                <View style={{ paddingVertical:5,paddingHorizontal:10,borderRadius:20}}>
                  <MonoText   style={{fontSize:14}}>Typing...</MonoText>
                </View>
              </View>
            }
            {!this.state.typing&&this.state.imageVideoUpload&&
              <View style={{marginBottom:5}}>
                <View style={{ paddingVertical:5,paddingHorizontal:10,borderRadius:20}}>
                  <MonoText   style={{fontSize:14}}>Uploading...</MonoText>
                </View>
              </View>
            }
            <View style={{backgroundColor:this.state.color,flex:1,flexDirection: 'row'}}>
              <View style={{flex:0.5,justifyContent: 'flex-start'}}>
                <MonoText   style={{textAlign:'right',color:this.state.fontColor,fontSize:12,paddingRight:5}}>We run on</MonoText>
              </View>
              <TouchableOpacity style={{flex:0.5,justifyContent: 'flex-end'}} onPress={() => {this.companyWebsite()}}>
                <MonoText   style={{textAlign:'left',color:this.state.fontColor,fontSize:12}}>CIOC</MonoText>
              </TouchableOpacity>

            </View>
            <View style={{backgroundColor:'#fff',paddingHorizontal:10}}>
               <View style={{flex:1,flexDirection: 'row',}}>
                  <TouchableOpacity style={{flex:0.8}}  onPress={() => {this.textInput.focus();}} >
                    <View style={{paddingVertical:15}}>
                      <TextInput style={{fontSize: 16,color: '#000',maxHeight: 120,}}
                      placeholder="Type a message..."
                      underlineColorAndroid='transparent'
                      ref={input => { this.textInput = input }}
                      onChangeText={(text) => this.userTextChanged(text)}
                      multiline={true}/>
                    </View>
                  </TouchableOpacity>
                  <View style={{flex:0.2,flexDirection: 'row',paddingVertical:15}}>
                    <View style={{flex:1,justifyContent:'flex-end'}}>
                      <TouchableOpacity  style={[{color:this.state.color}]} onPress={() => this.setModalAttachState(true)} >
                        <Icon type="ionicon" name="md-attach"  color={'grey'} size={30}  />
                      </TouchableOpacity>
                    </View>
                    <View style={{flex:1,justifyContent:'flex-end',marginLeft: 10}}>
                      <TouchableOpacity style={[{color:this.state.color}]} disabled={this.state.imageVideoUpload} onPress={() => this.sendMessage(this.state.message)}>
                        <Icon type="ionicon" name= "md-send" size={30} color={'grey'} />
                      </TouchableOpacity>
                    </View>
                  </View>
              </View>

            </View>
            </View>




        <View style = { [styles.modalcontainer,{}]}>

         <Modal style ={{position:'absolute',width:width*0.9,height:'100%',justifyContent:this.state.keyboardOpen?'flex-start':'center',top:this.state.keyboardOpen?width*0.3:0}} isVisible={this.state.modalVisible} animationIn="fadeIn" hasBackdrop={true} animationOut="fadeOut" onBackdropPress={() => {if(!this.state.canNotMinimize){
           this.setState({modalVisible: false})
         }}} useNativeDriver={true}>
           <View style={styles.modalView}>
           <View style={styles.signupTextCont}>
             <TouchableOpacity  onPress={() => this.rating(1)}>
                <Icon type="ionicon" name={this.state.starIcon[0]} color={this.state.rateColor[0]} size={32} style={{textAlignVertical: 'center'}}/>
              </TouchableOpacity  >
             <TouchableOpacity  onPress={() => this.rating(2)}>
                <Icon type="ionicon" name={this.state.starIcon[1]} color={this.state.rateColor[1]} size={32} style={{textAlignVertical: 'center'}}/>
              </TouchableOpacity  >
             <TouchableOpacity  onPress={() => this.rating(3)}>
                <Icon type="ionicon" name={this.state.starIcon[2]} color={this.state.rateColor[2]} size={32} style={{textAlignVertical: 'center'}}/>
              </TouchableOpacity  >
             <TouchableOpacity  onPress={() => this.rating(4)}>
                <Icon type="ionicon" name={this.state.starIcon[3]} color={this.state.rateColor[3]} size={32} style={{textAlignVertical: 'center'}}/>
              </TouchableOpacity  >
             <TouchableOpacity  onPress={() => this.rating(5)}>
                <Icon type="ionicon" name={this.state.starIcon[4]} color={this.state.rateColor[4]} size={32} style={{textAlignVertical: 'center'}}/>
              </TouchableOpacity  >
           </View>
               <TextInput
               underlineColorAndroid='transparent'
               style={{borderWidth: 0, marginVertical:20,paddingHorizontal:20,fontSize:15,}}
               multiline={false}
               onChangeText={(text) => this.setState({feedbackEmail:text})}
               placeholder={'Enter Email'}
               keyboardType={'email-address'}
               value={this.state.feedbackEmail}
               />
             <TextInput
                     style={{height: 100, borderWidth: 0, marginTop: 0,paddingHorizontal:20,fontSize:15, textAlignVertical:'top'}}
                     underlineColorAndroid='#fff'
                     multiline={true}
                     numberOfLines={5}
                     placeholder="Write your review here"
                     onChangeText={(text) => this.setState({feedback:text})}
               />
           <View style={{flexDirection: 'row',flexDirection: 'row',alignItems: 'center',justifyContent: 'center',padding:0,margin:0,marginTop: 20,}}>

               <TouchableOpacity style={{flex: 1,backgroundColor:"#fff",borderWidth:1,borderColor:'#c2c2c2'}}  onPress={() => this.setModalVisible()}>
                  <View style={{alignSelf:'center',}} >
                  <MonoText   style={{color:"#000",fontSize:15,paddingVertical:8}}>Next Time</MonoText>
             </View>
             </TouchableOpacity>
               <TouchableOpacity style={{flex: 1,backgroundColor:this.state.color,borderWidth:1,borderColor:this.state.color}}  onPress={() => this.setModalVisible(this.state.feedback)}>
                 <View style={{alignSelf:'center',}} >
                  <MonoText   style={{color:this.state.fontColor,fontSize:15,paddingVertical:8}}>Submit</MonoText>
                 </View>
              </TouchableOpacity>
              {!this.state.canNotMinimize&&
                <TouchableOpacity style={{flex: 1,backgroundColor:"#fff",borderWidth:1,borderColor:'#c2c2c2'}}  onPress={() => this.minimize()}>
                  <View style={{alignSelf:'center',}} >
                    <MonoText   style={{color:"#000",fontSize:15,paddingVertical:8}}>Minimize</MonoText>
                  </View>
                </TouchableOpacity>
              }
           </View>
          </View>
         </Modal>
        </View>

        <View style = { styles.modalcontainer }>
        <Modal style={{justifyContent: 'center',alignItems: 'center',margin: 0}} isVisible={this.state.videoModal} animationIn="fadeIn"  animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} onRequestClose={() => { this.setVideoVisible(false) }} onBackdropPress={() => {this.setVideoVisible(false)}} >
        <View style={{width:width*1,height:width*0.8,backgroundColor: '#000',marginHorizontal:0,alignItems: 'center',justifyContent: 'center'}}>


        <Video
            source={{ uri:this.state.playVideo  }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode={Video.RESIZE_MODE_CONTAIN}
            shouldPlay
            isLooping={false}
            onReadyForDisplay={(naturalSize)=>{
              console.log(this.state.fullScreen,'ppppppppppp');
            if(this.state.fullScreen&&this.state.videoModal&&this.state.videoShowOrientation){
              ScreenOrientation.allowAsync(ScreenOrientation.Orientation.LANDSCAPE)
            }else{
              ScreenOrientation.allowAsync(ScreenOrientation.Orientation.PORTRAIT)
            }
            this.setState({fullScreen:!this.state.fullScreen,videoShowOrientation:true});}}
            style={{ width: width*1, height: width*0.8 }}
            useNativeControls={true}
            />


        </View>
       </Modal>

        <Modal style={{justifyContent: 'center',alignItems: 'center',margin: 0}} isVisible={this.state.imageModal} animationIn="fadeIn"  animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} onRequestClose={() => { this.setState({selectedImgUrl:null,imageModal:false}) }} onBackdropPress={() => {this.setState({selectedImgUrl:null,imageModal:false})}} >
        <View style={{width:width*1,height:width*0.8,backgroundColor: '#000',marginHorizontal:0,alignItems: 'center',justifyContent: 'center'}}>
           <Image style={{width:'100%',height:'100%',}} source={{uri:this.state.selectedImgUrl}}/>
        </View>
       </Modal>

         <Modal isVisible={this.state.attachModal} animationIn="fadeIn" animationOut="fadeOut" hasBackdrop={true} onBackdropPress={() => {this.setModalAttachState(false)}} useNativeDriver={true}>
           <View style={[styles.modalView,{backgroundColor:this.state.color,}]}>
              <View style={{flexDirection: 'row',flexDirection: 'row',alignItems: 'center',justifyContent: 'center',paddingBottom:20,margin:0,marginTop: 20,}}>
                <TouchableOpacity style={{flex: 1,}}  onPress={() => this.modalAttach('camera')}>
                   <View  style={{alignSelf:'center',}}>
                     <Icon type="ionicon" name='md-camera' color={this.state.fontColor}  size={50} style={{textAlignVertical: 'center',}} />
                     <MonoText   style={{color:this.state.fontColor,fontSize:20,fontWeight:'bold'}}>Camera</MonoText>
                   </View>
                </TouchableOpacity>
                 <TouchableOpacity  style={{flex: 1,}}  onPress={() => this.modalAttach('gallery')}>
                   <View style={{alignSelf:'center',}}>
                     <Icon type="ionicon" name='md-photos'  color={this.state.fontColor} size={50} style={{textAlignVertical: 'center',}} />
                     <MonoText   style={{color:this.state.fontColor,fontSize:20,fontWeight:'bold'}}>Gallery</MonoText>
                   </View>
                 </TouchableOpacity>
                 <TouchableOpacity  style={{flex: 1,}}  onPress={() => this.modalAttach('video')}>
                   <View style={{alignSelf:'center',}}>
                     <Icon type="ionicon" name='md-videocam'  color={this.state.fontColor} size={50} style={{textAlignVertical: 'center',}} />
                     <MonoText   style={{color:this.state.fontColor,fontSize:20,fontWeight:'bold'}}>Video</MonoText>
                   </View>
                 </TouchableOpacity>
             </View>
          </View>
        </Modal>
      </View>






    </View>
    );
  }else{
      return (
        <View style={{flex:1,}}>
          <View style={{height:Constants.statusBarHeight,backgroundColor:this.state.themeColor}}></View>
          <View style={{flex:1,alignItems: 'center',justifyContent: 'center'}}>
            <ActivityIndicator size="large" color={this.state.themeColor} />
          </View>
        </View>
      );
}
  }

  }
}

const styles = StyleSheet.create({
  modalcontainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

   modalView: {
      backgroundColor: '#fff',
      marginHorizontal: 20 ,
//      padding: 20,
      borderRadius:5,
      // zIndex:100,
      // marginTop: 0,

     },
    signupTextCont:{
       flexDirection: 'row',
       justifyContent: 'space-between',
       paddingHorizontal: 20,
       marginTop: 20,
      },

  container:{
    flex:1,
    position:'relative',
    backgroundColor : '#e6e6e6'
  },
  list:{
    paddingHorizontal: 17,
    paddingBottom: 80,


  },
  footer:{
    flex:1,
    alignSelf:'flex-end',
    flexDirection: 'row',
    width:'100%',
    height:60,
    position:'absolute',
    bottom:0,
    paddingHorizontal:10,
    padding:5,
  },
  btnSend:{
//    backgroundColor:color,
    position: 'absolute',
    // bottom:25,
    width:40,
    height:40,
    borderRadius:360,
    alignItems:'center',
    right:10,
    justifyContent:'center',
  },
  iconSend:{
    width:30,
    height:30,
    alignSelf:'center',
  },
  inputContainer: {
    position: 'absolute',
    left:0,
    width:'85%',
    backgroundColor: '#ffffff',
    borderRadius:30,
    borderBottomWidth: 1,
    height:45,
    flex:1,
    flexDirection: 'row',
    alignItems:'center',
    marginLeft:10,
    borderWidth:1,
  },
  inputs:{
    height:45,
    marginLeft:16,
    borderBottomColor: '#ffffff',
    flex:1,
  },
  balloon: {
    maxWidth: 250,
    padding: 15,
    borderRadius: 20,

  },
  itemIn: {
    alignSelf: 'flex-start',

  },
  itemOut: {
    alignSelf: 'flex-end',


  },
  time: {
    alignSelf: 'flex-start',
    marginLeft:15,
    fontSize:10,
    color:"#000",
  },
  timeout: {
    alignSelf: 'flex-end',
    marginRight:15,
    fontSize:10,
    color:"#000",
  },
  item: {
    marginVertical: 7,
    backgroundColor:'#fff',
    borderRadius:300,
    borderTopLeftRadius:0,
    padding:5,
    paddingVertical:7,
    marginBottom:0,
  },
  itemout: {
    marginVertical: 7,
    marginBottom:0,
    backgroundColor:'#fff',
    borderRadius:300,
    borderTopRightRadius:0,
    padding:5,
    paddingVertical:7,

  },
   iconContainer: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: 120
    },
  videoContainer:{
    position: 'absolute',
    top: 60,
    left:60,
    width:80,
    flexDirection: 'row',
    height:80,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: "rgba(0, 0, 0, 0.5)",

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
});

export default class SupportChat extends Component {
  constructor(props) {
    super(props);

    this.state = {
     apikey:props.apikey,
     isChat:true,
     minimize:height

    };
    this.goback = this.props.goback;
  }

  update=()=>{
    this.setState({isChat:true})
  }

  render(){
    console.log(this.state.isChat,'dfghjjkkkkll');
    if(!this.state.isChat){
      this.update()
    }
    return(
      <View style={{flex:1}}>
        {this.state.isChat&&
          <ChatSupport apikey={this.state.apikey}  goBack={(d)=>{this.setState({isChat:false});this.props.goBack()}} minimize={()=>{this.setState({minimize:0});this.props.minimize()}} />
        }
      </View>
    )
  }
}
