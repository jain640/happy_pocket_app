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
  Linking
} from 'react-native';
import Modal from "react-native-modal";
import { Icon } from "react-native-elements";
import HTML from 'react-native-render-html';
import  Constants  from 'expo-constants';
import moment from 'moment';
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { MonoText } from '../components/StyledText';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { FontAwesome,MaterialCommunityIcons,MaterialIcons,SimpleLineIcons } from '@expo/vector-icons';
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




  const SERVER_URL = settings.url;
  const WAMP_SERVER = settings.WAMP_SERVER;
  const WAMP_PREFIX = settings.WAMP_PREFIX;
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

const imageFormats = [ 'jpg','jpeg','png','gif','webp']
const videoFormats = [ 'webm','mp4','mpg','mp2','mpeg','mpe','mpv','ogg','m4v','avi','wmv']

class TalkToSeller extends Component {


       static navigationOptions = ({ navigation }) => {
         const { params = {} } = navigation.state
         return {
           header:null
         }
       };

    constructor(props) {
      super(props);

      var chatWith = props.navigation.state.params.chatWith
      var store = props.navigation.state.params.store
      var storePk = props.navigation.state.params.storePk
      var userName = props.navigation.state.params.userName

      this.state = {
        data: [],
         modalVisible: false,
         color: '',
         message:'',
         company : 2,
         firstMessage : null,
         uid : null,
         chatThreadPk : null,
         session : null,
         connection : new wamp.Connection({url: WAMP_SERVER, realm: 'default'}),
         companyName : null,
         mascotName : null,
         mascotIcon : null,
         agentPk : null,
         scrollHeight:Dimensions.get('window').height,
         keyboardOpen : false,
         starIcon : ['ios-star','ios-star','ios-star','ios-star','ios-star'],
         rateColor : ['#10254E','#10254E','#10254E','#10254E','#10254E'],
         starRating : 5 ,
         attachModal:false,
         hasCameraPermission: null,
         cameraShow:false,
         keyboardHeight:0,
         store:props.store,
         myStore:store,
         messages:[],
         imageVideoUpload:false,
         chatWith:chatWith,
         getDisplayPic:null,
         showName:'',
         userName:userName,
         storePk:storePk

      };

      async function requestReadPermission() {
       const permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
       if (permission.status !== 'granted') {
           const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
           if (newPermission.status === 'granted') {
             this.setState({ hasCameraPermission: status === 'granted' });
           }
       } else {
        this.setState({ hasCameraPermission: status === 'granted' });
       }
     }
     requestReadPermission()

    async function CameraPermission() {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      this.setState({ hasCameraPermission: status === 'granted' });
    }
  CameraPermission()


      Keyboard.addListener(
        'keyboardDidHide',
        this.showKeyboard
      )

      Keyboard.addListener(
        'keyboardDidShow', this.hideKeyboard
      )
    }



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




   fetchOneMessage=async(args)=>{
     const userToken = await AsyncStorage.getItem('userpk');
     const sessionid = await AsyncStorage.getItem('sessionid');
     const csrf = await AsyncStorage.getItem('csrf');
     if(csrf!=null){
     fetch(SERVER_URL + '/api/HR/message/'+args.pk+'/' ,{
       headers: {
       "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Referer': SERVER_URL+'/api/HR/message/'+args.pk+'/',
       'X-CSRFToken': csrf
     }
     })
       .then((response) => response.json())
       .then((responseJson) => {
         this.setState(prevState => ({
               messages: [  ...prevState.messages, responseJson],
               agentPk : args.sender
             }))
       })
       .catch((error) => {
         return
       });
     }
   }


    supportChat = (args)=>{
      if (args[0] == 'M') {
        this.fetchOneMessage(args[1])
      }
    }



    checkHeartBeat = (args)=>{
      if (args[0]=='isOnline' ) {
          this.state.connection.session.publish(wamp_prefix+'service.support.checkHeartBeat.'+args[2], ['iAmOnline', this.state.uid, args[2]] , {}, {
            acknowledge: true
          }).
          then(function(publication) {
          },function(){
          });
        }
    }

    getMessages=async()=>{
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      if(csrf!=null){
      fetch(SERVER_URL + '/api/HR/userMessages/?store='+this.state.myStore.pk+'&user='+this.state.chatWith ,{
        headers: {
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL+'/api/HR/userMessages/?store='+this.state.myStore.pk+'&user='+userToken,
        'X-CSRFToken': csrf
      }
      })
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({messages:responseJson.messages,userDetails:responseJson.user})

          this.setState({getDisplayPic:responseJson.user.profile.displayPicture,showName:responseJson.user.first_name + responseJson.user.last_name,})
        })
        .catch((error) => {
          return
        });
      }
    }



   getSellerMessages=async(store)=>{
     const userToken = await AsyncStorage.getItem('userpk');
     const sessionid = await AsyncStorage.getItem('sessionid');
     const csrf = await AsyncStorage.getItem('csrf');
     if(csrf!=null){
     fetch(SERVER_URL + '/api/HR/message/?store='+store+'&chatMsg='+true ,{
       headers: {
       "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Referer': SERVER_URL+'/api/HR/message/?store='+store+'&chatMsg='+true,
       'X-CSRFToken': csrf
     }
     })
       .then((response) => response.json())
       .then((responseJson) => {
         this.setState({messages:responseJson})
       })
       .catch((error) => {
         return
       });
     }
   }

   getStore=async(store)=>{
     var csrf = await AsyncStorage.getItem('csrf');
     var userToken = await AsyncStorage.getItem('userpk');
     var sessionid = await AsyncStorage.getItem('sessionid');

     await fetch(SERVER_URL+'/api/POS/store/'+store+'/',{
       method: 'GET',
       headers: {
         "Cookie" :"csrf="+csrf+";sessionid=" + sessionid+";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'X-CSRFToken':csrf,
         'Referer': SERVER_URL
       },
     }).then((response) => response.json())
       .then((responseJson) => {
         console.log(responseJson,'checkstore');
         if(responseJson!=undefined){
           this.setState({ myStore: responseJson})
           this.setState({getDisplayPic:responseJson.owner.profile.displayPicture,showName:responseJson.owner.first_name + responseJson.owner.last_name,})
         }
       })
       .catch((error) => {
         return
     });
   }



    componentDidMount() {
      if(this.state.myStore==null){
        var store = this.state.storePk
      }else{
        var store = this.state.myStore.pk
      }
      this.state.connection.onopen = (session)=>{
        this.setState({session : session});

         console.log('subscribing to' , WAMP_PREFIX+'ecommerce.chat.' + store);

        session.subscribe(WAMP_PREFIX+'ecommerce.chat.' + this.state.userName, this.supportChat).then(
        (sub) => {

        },
        (err) => {
          console.log("failed to subscribe: service.support.chat"+err);
        });

      }

      this.state.connection.open();
      if(this.state.myStore!=null){
      this.setState({getDisplayPic:this.state.myStore.owner.profile.displayPicture,showName:this.state.myStore.owner.first_name + this.state.myStore.owner.last_name,})

      this.getSellerMessages(store)
    }else{
      this.getStore(store)
      this.getSellerMessages(store)
    }

    }

    timeWithDate=(date)=> {
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
      this.textInput.clear()
      this.setState({message : ""})
      fetch(serverURL + "/api/support/supportChat/", {
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
          timeDate : this.timeWithDate(new Date())
        }),
      }).then((response) => response.json())
      .then((responseJson) => {
        let dataToPublish = [this.state.uid, 'M', responseJson, this.state.company, false, this.state.chatThreadPk, this.state.companyName, this.state.company]

        this.state.connection.session.publish(wamp_prefix+'service.support.agent', dataToPublish, {}, {
          acknowledge: true
        })
        responseJson.message = '<div style="color:white;">' + responseJson.message + '</div>';
        responseJson.timeDate = this.timeWithDate(new Date())
        this.setState(prevState => ({
          data: [ ...prevState.data, responseJson],
        }))
      })
      .catch((error) => {
        return
      });;
    }

    createNewChatThread = (message)=>{
      fetch(serverURL + "/api/support/chatThread/", {
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
        this.publishMessage(message)
        this.setState({chatThreadPk : responseJson.pk})
        AsyncStorage.setItem('chatThreadPk', ''+ responseJson.pk);

      })
      .catch((error) => {
        return
        this.publishMessage(message)
      });
    }

    sendMessage = (message) => {
      if (message == "") {
        return;``````````````
      }
      if(message.length < 1) this.setState({message:'   '}) ;
      this.postMessage(message)
    }

    userTextChanged = (text)=>{

      this.setState({message:text})
      if (this.state.agentPk == null) {
        return;
      }
    }

   searchWorkoutHandler = () => {
       this.props.navigation.goBack();
    };


    resetChat = ()=>{
      var uid = ''+ new Date().getTime();
      AsyncStorage.setItem('uid', uid);
      AsyncStorage.removeItem('chatThreadPk');
      this.setState({chatThreadPk : null, uid : uid , data : [{pk:0, type:'in',  message: this.state.firstMessage }]});
      this.props.navigation.setParams({
        getAgentName: this.state.mascotName,
        getDisplayPic : this.state.mascotIcon,
      });
      this.state.connection.onopen(this.state.connection._session)

      // 'https://app.syrow.com/api/support/chatThread/'+ chatThreadPk + '/'
      fetch(serverURL + "/api/support/chatThread/"+ this.state.chatThreadPk + '/', {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({status:"closed",closedByUser:1}),
      }).then((response) => response.json())
      .then((responseJson) => {
      })
      .catch((error) => {
        return
      });


      var dataToSend = {uid:this.state.uid , userEndedChat: 'CHAT CLOSED BY USER' , sentByAgent:false };
      this.state.connection.session.publish(wamp_prefix+'service.support.agent.'+this.state.agentPk, [this.state.uid , 'CL' , dataToSend ] , {}, {
         acknowledge: true
       })
    }

    setModalVisible = (feedback)=> {
      if (feedback == undefined || feedback == null) {
        this.resetChat();
        this.setState({modalVisible: false});
      }else{
        var dataToSend = {uid:this.state.uid , usersFeedback:feedback  , rating: this.state.starRating , sentByAgent:false };

         this.state.connection.session.publish(wamp_prefix+'service.support.agent.'+ this.state.agentPk, [this.state.uid , 'FB' , dataToSend ] , {}, {
           acknowledge: true
         })

       this.resetChat();

        this.setState({modalVisible: false});
      }
   }

   openMessage = (message)=>{
     if (message.attachment!=null&&message.attachment.indexOf('/media/') != -1 ) {
       Linking.openURL(SERVER_URL+message.attachment)
     }
    return
   }

    renderDate = (date) => {

      return(
        <MonoText   style={styles.time}>
          {date}
        </MonoText>
      );
    }


   rating = (count) => {
     let arr = ['#000','#000','#000','#000','#000'];
     let staricon = ['ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline'];
     arr.forEach((val,index)=>{
       if(index>count-1)return;
       arr[index] = '#10254E'
     })
     staricon.forEach((val,index)=>{
       if(index>count-1)return;
       staricon[index] = 'ios-star'
     })
     this.setState({starIcon:staricon});
     this.setState({rateColor:arr});
     this.setState({starRating:count});
   }

   modalAttach = (event) => {
    if(event == 'gallery') return this._pickImage();
    if(event == 'camera') {
     this.handlePhoto()
    }
    if(event == 'video') {
      this.videoCam()
    }
  };

videoCam = async ()=>{
   let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Videos});

   const userToken = await AsyncStorage.getItem('userpk');
   const sessionid = await AsyncStorage.getItem('sessionid');
   const csrf = await AsyncStorage.getItem('csrf');

    if(picture.cancelled == true){
       this.setState({attachModal:false})
      return
    }



    this.setState({attachModal:false})
    let video = new FormData();
    let filename = picture.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `video/${match[1]}` : `video`;



    const photo = {
      uri: picture.uri,
      type: type,
      name:filename,
    };

    video.append('store',this.state.myStore.pk)
    video.append('attachment', photo);

    this.textInput.clear()



    fetch(SERVER_URL + "/api/HR/message/", {
      method: 'POST',
      headers: {
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type':  'multipart/form-data',
        'Referer': SERVER_URL+'/api/HR/message/',
        'X-CSRFToken': csrf
      },
      body: video,
    }).then((response) => {
    return response.json()})
    .then((responseJson) => {
      // this.getMessages()
       this.setState({attachModal:false})
      this.setState(prevState => ({
            messages: [  ...prevState.messages, responseJson],
      }))

    })
    .catch((error) => {
      return
    });

 }



   _pickImage = async () => {
     const userToken = await AsyncStorage.getItem('userpk');
     const sessionid = await AsyncStorage.getItem('sessionid');
     const csrf = await AsyncStorage.getItem('csrf');

       let result = await ImagePicker.launchImageLibraryAsync({
       allowsEditing: true,
       });

       if(result.cancelled == true){
          this.setState({attachModal:false})
         return
       }




       this.setState({ image: result.uri });

       let img = new FormData();
       let filename = result.uri.split('/').pop();
       let match = /\.(\w+)$/.exec(filename);
       let type = match ? `image/${match[1]}` : `image`;

       const photo = {
         uri: result.uri,
         type: type,
         name:filename,
       };

       img.append('store',this.state.myStore.pk)
       img.append('attachment', photo);

       this.textInput.clear()



       fetch(SERVER_URL + "/api/HR/message/", {
         method: 'POST',
         headers: {
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Accept': 'application/json',
           'Content-Type':  'multipart/form-data',
           'Referer': SERVER_URL+'/api/HR/message/',
           'X-CSRFToken': csrf
         },
         body: img,
       }).then((response) => {
       return response.json()})
       .then((responseJson) => {
         // this.getMessages()
         this.setState({attachModal:false})
         if(responseJson.attachment!=null){
           responseJson.attachment = '/media'+responseJson.attachment.split('/media')[1]
         }
         this.setState(prevState => ({
               messages: [  ...prevState.messages, responseJson],
         }))
       })
       .catch((error) => {
         return
       });


  };

  postMessage=async(message)=>{
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');

    var formData = new FormData()
    formData.append('message',message)
    formData.append('store',this.state.myStore.pk)

    if(csrf!=null){
    fetch(SERVER_URL + '/api/HR/message/' ,{
      method: 'POST',
      headers: {
      "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
      'Accept': 'application/json',
      'Content-Type':  'multipart/form-data',
      'Referer': SERVER_URL+'/api/HR/message/',
      'X-CSRFToken': csrf
    },
    body: formData,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.textInput.clear()
        this.setState(prevState => ({
              messages: [  ...prevState.messages, responseJson],
        }))
      })
      .catch((error) => {
        return
      });
    }
  }


  cameraRef = React.createRef();

  handlePhoto = async () => {
    let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    this.setModalAttachState(false)
    if(picture.cancelled == true){
      this.setState({attachModal:false})
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

      img.append('store',this.state.myStore.pk)
      img.append('attachment', photo);





      fetch(SERVER_URL + "/api/HR/message/", {
        method: 'POST',
        headers: {
          "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
          'Accept': 'application/json',
          'Content-Type':  'multipart/form-data',
          'Referer': SERVER_URL+'/api/HR/message/',
          'X-CSRFToken': csrf
        },
        body: img,
      }).then((response) => {
      return response.json()})
      .then((responseJson) => {
        this.setState({attachModal:false})
        this.textInput.clear()
        if(responseJson.attachment!=null){
          responseJson.attachment = '/media'+responseJson.attachment.split('/media')[1]
        }
        this.setState(prevState => ({
          messages: [ ...prevState.messages, responseJson],
        }))
      })
      .catch((error) => {
        return
      });

  }

  footer=()=>{
   return (
       <View  style={[{flex:1,alignItems: 'center',justifyContent: 'center',backgroundColor: '#e6e6e6'}]}>
       {this.state.imageVideoUpload?
       <ActivityIndicator size="large" color={this.state.store.themeColor} />
       :null
     }
       </View>
   )
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



    render() {
      var themeColor = this.props.store.themeColor
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
         else{
        return(
        <View  style={styles.container} >

        <View  style={{position: 'absolute',top:0,right:0,left:0}}>
        <View style={{}}>
        <View style={{height:Constants.statusBarHeight,backgroundColor:this.props.store.themeColor}}></View>
          <View style={[styles.shadow,{height:58,alignItems: 'center',flexDirection: 'row',backgroundColor:this.props.store.themeColor}]}>
            <TouchableOpacity onPress={()=>{this.searchWorkoutHandler()}} style={{flex:0.13,alignItems: 'center'}}>
              <MaterialIcons name="arrow-back" size={30} color={'#fff'} />
            </TouchableOpacity>
            <View style={{flex:0.67,flexDirection: 'row',alignItems: 'center',justifyContent: 'flex-start'}}>
            {this.state.myStore!=null&&this.state.myStore.logo!=null&&
              <View style={{width: 40, height: 40, borderRadius: 40/2,marginLeft:0 ,marginRight:15,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}}>
              <Image
                   source={{uri : this.state.myStore.logo}}
                   style={{ width: '100%', height: '100%', overflow:'hidden',resizeMode:'cover', borderRadius: 40/2,}}
               />
               </View>
             }
               {this.state.myStore!=null&&this.state.myStore.logo==null&&
                 <View  style={{ width: 40, height: 40, borderRadius: 40/2,marginLeft:10 ,marginRight:15,backgroundColor:'#fff',alignItems:'center',justifyContent:'center' }}>
                   <MaterialCommunityIcons name={'store'} size={35} color={'grey'}/>
                 </View>
                }
                {this.state.myStore!=null&&
                  <MonoText   style={{color:'#fff',fontSize:20,fontWeight: '400'}} numberOfLines={1}>{this.state.myStore.name}</MonoText>
                }
            </View>
            <View style={[styless.iconContainer,{flex:0.2,flexDirection: 'row'}]}>
              <View style={{width: 12,height: 12,borderRadius: 44,backgroundColor:'green',}} />
            </View>
          </View>
        </View>
        </View>

        <ScrollView
        ref='_scrollView'
        onContentSizeChange={() => { this.refs._scrollView.scrollToEnd({animated: true}); }}
        style={{height:this.state.keyboardOpen? Dimensions.get('window').height-(this.state.keyboardHeight): Dimensions.get('window').height,marginTop:58+Constants.statusBarHeight}}

      >



            <FlatList style={{paddingHorizontal: 17,paddingBottom: this.state.keyboardOpen? 100:80,marginBottom: this.state.keyboardOpen?0:30}}
//          inverted
         data={this.state.messages}
         keyExtractor= {(item , index) => {
           return index.toString();
         }}
         ListFooterComponent = { this.footer }
         renderItem={({item, index})  => {
           let inMessage = item.moderator != null;
           if(item.message == undefined|| (item.message!=undefined && item.message.length < 1 )) var m = ' ';
           else var m = item.message
           let itemStyle = inMessage ? styles.itemIn : styles.itemOut;
           var format = null
           if(item.attachment!=null){
             var attachment = item.attachment.split('/').pop()
             if(imageFormats.includes(attachment.split('.')[1])){
                format = 'image'
             }else{
               format = 'file'
               var extension = attachment.split('.')[1]
             }
           }
           return (
             <View style={[ itemStyle]}   >
             <TouchableOpacity  onPress={() =>  {this.openMessage(item,format)} }>


               {/*{inMessage && format == null &&
               <View style={[styles.item,styles.balloon]}>
                 <HTML html={item.message}  />
               </View>
             }*/}

               {/*{inMessage&&format=='file'&&
                 <View style={[styles.item,styles.balloon,{backgroundColor:'#fff',alignItems:'center',justifyContent:'center',width:200,height:200}]}>}}>
                    <FontAwesome  name={'file-text-o'} size={55} color={themeColor}/>
                 </View>
               }*/}

                 {inMessage&&format=='file'&&
                   <View style={[styles.itemout,styles.balloon,{backgroundColor:'#fff',width:200,height:200}]}>
                       <View style={styles.videoContainer}>
                        <FontAwesome  name={'file-text-o'} size={55} color={themeColor}/>
                        <MonoText   style={{marginLeft:15,color:themeColor,fontSize:14}}>{extension}</MonoText>
                       </View>
                   </View>
                   }

               {inMessage&&item.message!=undefined&&item.message.length>0&&
                 <View style={[styles.item,styles.balloon]}>
                  <MonoText   style={{color:'#000',fontSize:15}}>{item.message}</MonoText>
                </View>
               }

               {inMessage && format == 'Link' &&
               <View style={[styles.item,styles.balloon]}>
                 {/* <HTML html={item.attachment}  /> */}
                 <Image source={{uri: item.attachment }}
                   style={{width: 200, height: 200}} />
               </View>
               }
               {inMessage && format == 'application' &&
               <View style={[styles.item,styles.balloon]}>
                 <HTML html={item.message.replace(/\n/g,'<br>')}  />
               </View>
               }
               {inMessage && format == 'video' &&
               <View style={[styles.item,styles.balloon,{width:200,height:200,backgroundColor:themeColor}]} >
                   <View style={[styles.videoContainer,]}>
                    <Icon type="ionicon" name={Platform.OS === "ios" ? "ios-play-circle" : "md-play-circle"} size={80} color="#000" style={{textAlignVertical: 'center'}}/>
                   </View>
               </View>
               }
               {inMessage && format == 'image' &&
               <View style={[styles.item,styles.balloon]}>
                 <Image source={{uri: item.attachment }}
                   style={{width: 200, height: 200}} />
               </View>
               }
              { /*{!inMessage && format == null &&
               <View style={[styles.itemout,styles.balloon,{backgroundColor:themeColor,color: this.state.fontColor}]}>
                 <HTML html={m.replace(/\n/g,'<br>')}   />
               </View>
             }*/}
             {!inMessage&&format=='file'&&
               <View style={[styles.itemout,styles.balloon,{backgroundColor:'#fff',width:200,height:200}]}>
                   <View style={styles.videoContainer}>
                    <FontAwesome  name={'file-text-o'} size={55} color={themeColor}/>
                    <MonoText   style={{marginLeft:15,color:themeColor,fontSize:14}}>{extension}</MonoText>
                   </View>
               </View>
               }
               {!inMessage && format == 'Link' &&
               <View style={[styles.item,styles.balloon]}>
                 <Image source={{uri: item.attachment }}
                   style={{width: 200, height: 200}} />
               </View>
               }
               {!inMessage && format == 'application' &&
               <View style={[styles.item,styles.balloon]}>
                 <HTML html={item.message.replace(/\n/g,'<br>')}  />
               </View>
               }
               {!inMessage && format == 'image' &&
               <View style={[styles.itemout,styles.balloon,{backgroundColor:themeColor}]}>
                 <Image source={{uri: SERVER_URL+item.attachment }}
                   style={{width: 200, height: 200}} />
               </View>
               }
               {/*{!inMessage && format == 'video' &&
               <View style={[styles.itemout,styles.balloon,{backgroundColor:themeColor,width:200,height:200}]}>

                   <View style={styles.videoContainer}>
                    <Icon type="ionicon" name={Platform.OS === "ios" ? "ios-play-circle" : "md-play-circle"} size={80} color="#000" style={{textAlignVertical: 'center'}}/>
                   </View>
               </View>
             }*/}
               {!inMessage&&item.message!=undefined&&item.message.length>0&&
                 <View style={[styles.itemout,styles.balloon,{backgroundColor:themeColor,color:'#fff'}]}>
                  <MonoText   style={{color:'#fff',fontSize:15}}>{item.message}</MonoText>
                </View>
               }
               {inMessage && <MonoText   style={styles.time}>{moment(moment.utc(item.created).toDate()).local().format('HH:mm')}</MonoText> }
               {!inMessage && <MonoText   style={styles.timeout}>{moment(moment.utc(item.created).toDate()).local().format('HH:mm')}</MonoText> }
               </TouchableOpacity>
             </View>

           )
           }}/>

              </ScrollView>
              <View style={{position:'absolute',bottom:0,left:0,right:0,width:'100%',marginVertical: 0,zIndex:100}}>

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
                      <TouchableOpacity  style={[{color:themeColor}]} onPress={() => this.setModalAttachState(true)} >
                        <Icon type="ionicon" name="md-attach"  color={'grey'} size={30}  />
                      </TouchableOpacity>
                    </View>
                    <View style={{flex:1,justifyContent:'flex-end',marginLeft: 10}}>
                      <TouchableOpacity style={[{color:themeColor}]} disabled={this.state.imageVideoUpload} onPress={() => this.sendMessage(this.state.message)}>
                        <Icon type="ionicon" name= "md-send" size={30} color={'grey'} />
                      </TouchableOpacity>
                    </View>
                  </View>
              </View>

            </View>
            </View>




          <View style = { styles.modalcontainer }>
           <Modal isVisible={this.state.modalVisible} animationIn="fadeIn" hasBackdrop={true} animationOut="fadeOut">
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
                       style={{height: 120, borderWidth: 0, marginTop: 0,paddingHorizontal:20,fontSize:15,}}
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
                 <TouchableOpacity style={{flex: 1,backgroundColor:"#10254E",borderWidth:1,borderColor:'#10254E'}}  onPress={() => this.setModalVisible(this.state.feedback)}>
                   <View style={{alignSelf:'center',}} >
                    <MonoText   style={{color:"#fff",fontSize:15,paddingVertical:8}}>Submit</MonoText>
                   </View>
                </TouchableOpacity>
             </View>
             </View>
           </Modal>
           </View>

           <View style = { styles.modalcontainer }>
           <Modal isVisible={this.state.attachModal} animationIn="fadeIn" animationOut="fadeOut" hasBackdrop={true} onBackdropPress={() => {this.setState({attachModal:false})}} useNativeDriver={true}>
             <View style={[styles.modalView,{backgroundColor:themeColor,}]}>
               <View style={{flexDirection: 'row',flexDirection: 'row',alignItems: 'center',justifyContent: 'center',paddingBottom:20,margin:0,marginTop: 20,}}>
                 <TouchableOpacity style={{flex: 1,}}  onPress={() => this.modalAttach('camera')}>
                   <View  style={{alignSelf:'center',}}>
                    <Icon type="ionicon" name='md-camera' color={'#fff'}  size={50} style={{textAlignVertical: 'center',}} />
                    <MonoText   style={{color:'#fff',fontSize:20,fontWeight:'bold'}}>Camera</MonoText>
                   </View>
                 </TouchableOpacity>
                  <TouchableOpacity  style={{flex: 1,}}  onPress={() => this.modalAttach('gallery')}>
                  <View style={{alignSelf:'center',}}>
                   <Icon type="ionicon" name='md-photos'  color={'#fff'} size={50} style={{textAlignVertical: 'center',}} />
                   <MonoText   style={{color:'#fff',fontSize:20,fontWeight:'bold'}}>Gallery</MonoText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity  style={{flex: 1,}}  onPress={() => this.modalAttach('video')}>
                  <View style={{alignSelf:'center',}}>
                   <Icon type="ionicon" name='md-videocam'  color={'#fff'} size={50} style={{textAlignVertical: 'center',}} />
                   <MonoText   style={{color:'#fff',fontSize:20,fontWeight:'bold'}}>Video</MonoText>
                  </View>
                </TouchableOpacity>
               </View>
            </View>
          </Modal>



      </View>
      </View>
      );
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
    marginLeft:10,
    fontSize:10,
    color:"#000",
  },
  timeout: {
    alignSelf: 'flex-end',
    marginRight:10,
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

  const mapStateToProps =(state) => {
      return {
      counter: state.cartItems.counter,
      cart : state.cartItems.cartItem,
      store:state.cartItems.store,
      myStore:state.cartItems.myStore,
    }
  }

  const mapDispatchToProps = (dispatch) => {
    return {
      addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
      decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
      increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
      setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
      emptyCartFunction:()=>dispatch(actions.emptyCart()),


    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(TalkToSeller);



//   <FlatList style={{paddingHorizontal: 17,paddingBottom: this.state.keyboardOpen? 30:80,}}
// //          inverted
//     data={this.state.messages}
//     keyExtractor= {(item , index) => {
//       return index.toString();
//     }}
//     renderItem={({item, index}) => {
//       let inMessage = item.moderator == null;
//       if(item.message == undefined|| (item.message!=undefined && item.message.length < 1 )) var m = ' ';
//       else var m = item.message
//       let itemStyle = inMessage ? styles.itemIn : styles.itemOut;
//       var format = null
//       if(item.attachment!=null){
//         var attachment = item.attachment.split('/').pop()
//         if(imageFormats.includes(attachment.split('.')[1])){
//            format = 'image'
//         }else{
//            format = 'file'
//         }
//       }
//       return (
//         <View style={[ itemStyle]}   >
//         <TouchableOpacity  onPress={() =>  {this.openMessage(item,format)} }>
//         {inMessage &&
//           <View style={[styles.item,styles.balloon]}>
//             {/*<HTML html={m}  />*/}
//             {format=='image'&&
//             <View style={{width:170,height:170}}>
//                <Image style={{width:'100%',height:'100%',resizeMode:'contain'}} source={{uri:SERVER_URL+item.attachment}} />
//             </View>
//             }
//             {format=='file'&&
//             <View style={{width:170,height:170,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}}>
//                <FontAwesome  name={'file-text-o'} size={55} color={themeColor}/>
//             </View>
//             }
//             <MonoText   style={{color:'#000',fontSize:15}}>{m}</MonoText>
//           </View>
//           }
//           {!inMessage &&
//           <View style={[styles.itemout,styles.balloon,{backgroundColor:themeColor,color:'#fff'}]}>
//             {/*<HTML html={m}   />*/}
//             {format=='image'&&
//             <View style={{width:170,height:170,backgroundColor:'#fff'}}>
//                <Image style={{width:'100%',height:'100%',resizeMode:'contain'}} source={{uri:SERVER_URL+item.attachment}} />
//             </View>
//             }
//             {format=='file'&&
//             <View style={{width:170,height:170,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}}>
//                <FontAwesome  name={'file-text-o'} size={55} color={themeColor}/>
//             </View>
//             }
//             <MonoText   style={{color:'#fff',fontSize:15}}>{m}</MonoText>
//           </View>
//           }
//           {inMessage && <MonoText   style={styles.time}>{moment(moment.utc(item.created).toDate()).local().format('HH:mm')}</MonoText> }
//           {!inMessage && <MonoText   style={styles.timeout}>{moment(moment.utc(item.created).toDate()).local().format('HH:mm')}</MonoText> }
//           </TouchableOpacity>
//         </View>
//
//       )
//     }}/>
// bottom:this.state.keyboardOpen? this.state.keyboardHeight: Platform.OS == 'ios'?10:0, important
// this.state.keyboardOpen? this.state.keyboardHeight-(this.state.keyboardHeight/3): Dimensions.get('window').height,
