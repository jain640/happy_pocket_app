
import wamp from 'wamp.js2';
import React from 'react';
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
  CameraRoll,
  PermissionsAndroid,
  ListView,
  KeyboardAvoidingView
} from 'react-native';
import Modal from "react-native-modal";
import { Icon } from "react-native-elements";
import HTML from 'react-native-render-html';
import { DocumentPicker, ImagePicker } from 'expo';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';




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


const serverURL = "https://app.syrow.com"
const wamp_prefix = "uniqueKey123.";
const options = {
  title: 'Select Avatar',
  customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};
export default class ChatScreen extends React.Component {



  static navigationOptions =  ({ navigation }) => {
  const { params = {} } = navigation.state
     return {
          headerLeft: (
                 <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
                  <TouchableOpacity  onPress={() => params.searchWorkouts()}  ><Icon type="ionicon" name={Platform.OS === "ios" ? "ios-search" : "md-arrow-back"} color="#fff" style={{textAlignVertical: 'center'}}/></TouchableOpacity  >
                <Image
                     source={{uri : params.getDisplayPic}}
                     style={{ width: 40, height: 40, borderRadius: 40/2,marginLeft:10 ,marginRight:15 }}
                 />
                 </View>
              ),
           title: params.getAgentName,
           headerStyle: {
                 backgroundColor: params.themeColor,
                 marginTop:Constants.statusBarHeight
               },
            headerTintColor: '#fff',
             headerRight: (
                  <View style={styless.iconContainer}>
                    <View style={{width: 12,height: 12,borderRadius: 44,backgroundColor:'green', alignSelf:"center"}} />
                  </View>
                ),
               headerTitleStyle: {
                  alignSelf: 'center',
                  marginLeft:50,

                }
               }
         };

  constructor(props) {
    super(props);
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
       connection : new wamp.Connection({url: 'wss://ws.syrow.com:443/ws', realm: 'default'}),
       companyName : null,
       mascotName : null,
       mascotIcon : null,
       agentPk : null,
       starIcon :['md-star','md-star','md-star','md-star','md-star'],
       starRating : 5 ,
       rateColor:['#10254E','#10254E','#10254E','#10254E','#10254E'],
       attachModal:false,
       file:{},
       image: null,
       hasCameraPermission: null,
       type: Camera.Constants.Type.back,

    };

    async function requestReadPermission() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Cool Photo App Camera Permission',
            message:
              'Cool Photo App needs access to your camera ' +
              'so you can take awesome pictures.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
        }
      } catch (err) {
        console.warn(err);
      }
    }
    requestReadPermission()
      async function CameraPermission() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
      }
    CameraPermission()

  }

          _pickImage = async () => {
              let result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              });

              if (result.cancelled) {
                return;
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

              img.append('attachmentType', 'image');
              img.append('uid' , this.state.uid);
              img.append('attachment', photo);

              this.textInput.clear()


              fetch(serverURL + "/api/support/supportChat/", {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'multipart/form-data',
                },
                body: img,
              }).then((response) => {
              return response.json()})
              .then((responseJson) => {
                let dataToPublish = [this.state.uid, 'M', responseJson, this.state.company, false, this.state.chatThreadPk, this.state.companyName, this.state.company]

                this.state.connection.session.publish(wamp_prefix+'service.support.agent', dataToPublish, {}, {
                  acknowledge: true
                })
                responseJson.message = '<img style="width:50%;height:30%" src="'+ responseJson.attachment +'" >' ;
                responseJson.timeDate = this.timeWithDate(new Date())
                this.setState(prevState => ({
                  data: [ ...prevState.data, responseJson],
                }))
              })
              .catch((error) => {
                return
              });


        };






  supportChat = (args)=>{

    if (args[0] == 'M') {
      args[1].type = 'in';
      args[1].timeDate = this.timeWithDate(new Date());
      this.setState(prevState => ({
        data: [  ...prevState.data, args[1]],
        agentPk : args[1].user
      }))
    }else if (args[0] == 'MF') {

      fetch(serverURL + "/api/support/supportChat/" + args[1].filePk + '/')
      .then((response) => response.json())
      .then((responseJson) => {

        responseJson.type = 'in';
        responseJson.timeDate = this.timeWithDate(new Date());
        responseJson.message = '<img src="'+ responseJson.attachment +'" >' ;
        this.setState(prevState => ({
          data: [  ...prevState.data, responseJson],
          agentPk : responseJson.user
        }))



      })
      .catch((error) => {
        return
      });





    }else if (args[0] == 'ML') {

      if (args[1].attachmentType == 'youtubeLink') {
        args[1].message = '<a href="'+args[1].message+'">'+ args[1].message +'</a>';
        args[1].type = 'in';
        this.setState(prevState => ({
          data: [  ...prevState.data, args[1]],
          agentPk : args[1].user
        }))
      }

    }

    if (args.length >2) {
      this.props.navigation.setParams({
        getAgentName: args[2].last_name,
        getDisplayPic : args[2].agentDp,
      });
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

  componentDidMount() {


    this.state.connection.onopen = (session)=>{
      this.setState({session : session});

       console.log('subscribing to' , wamp_prefix+'service.support.chat.' + this.state.uid);

      session.subscribe(wamp_prefix+'service.support.chat.' + this.state.uid, this.supportChat).then(
      (sub) => {
      },
      (err) => {
        console.log("failed to subscribe: service.support.chat"+err);
      });


      session.subscribe(wamp_prefix+'service.support.checkHeartBeat.'+this.state.uid, this.checkHeartBeat).then(
      function (res) {
        console.log("subscribed to service.support.createDetailCookie'");
      },
      function (err) {
        console.log("failed to subscribe: service.support.createDetailCookie");
      }
    );

    };

    this.state.connection.open();

    AsyncStorage.getItem('uid').then((value) => {
      if(value == null){
        AsyncStorage.setItem('uid', ''+ new Date().getTime());
        this.setState({uid : value});
        return;
      }
      this.setState({uid : value});

      fetch(serverURL + "/api/support/supportChat/?uid=" + value)
      .then((response) => response.json())
      .then((responseJson) => {

        for (var i = 0; i < responseJson.length; i++) {
          responseJson[i].timeDate = this.timeWithDate(new Date(responseJson[i].created));
          if (responseJson[i].sentByAgent == true) {
            responseJson[i].type = 'in';
          }else{
            responseJson[i].type = 'out';
            responseJson[i].message = '<div style="color:white;">' + responseJson[i].message + '</div>';
          }

          if (responseJson[i].attachmentType == 'image') {
            responseJson[i].message = '<img style="width:50%;" src="'+ responseJson[i].attachment +'" >' ;
          }else if (responseJson[i].attachmentType == 'youtubeLink') {
            responseJson[i].message = '<a href="'+responseJson[i].message+'">'+ responseJson[i].message +'</a>';
            responseJson[i].type = 'in';
            this.setState(prevState => ({
              data: [  ...prevState.data, responseJson[i]]
            }))
          }

        }

        this.setState(prevState => ({
          data: [  ...prevState.data, ...responseJson]
        }))



      })
      .catch((error) => {
        return
      });


    })

    AsyncStorage.getItem('chatThreadPk').then((value) => {
      this.setState({chatThreadPk : value});
    })

    // Alert.alert('Loaded!')
    fetch( serverURL + '/api/support/customerProfile/?service=' + this.state.company)
    .then((response) => response.json())
    .then((responseJson) => {


      if(responseJson[0] == 'undefined') this.setState({color:'#f3961d'});
      else  this.setState({color:responseJson[0]['windowColor'] , firstMessage : responseJson[0]['firstMessage'] , companyName :  "iOS" });

      this.setState(prevState => ({
        data: [ {pk:0, type:'in',  message: responseJson[0]['firstMessage'] }, ...prevState.data],
        mascotIcon : responseJson[0]['dp'],
        mascotName : responseJson[0]['name'],
      }))

      this.props.navigation.setParams({
        getAgentName: responseJson[0]['name'],
        getDisplayPic : responseJson[0]['dp'],
        themeColor : responseJson[0]['windowColor'],
      });
      // AsyncStorage.setItem('colortheme',JSON.stringify(responseJson[0]['windowColor']));
    })
    .catch((error) => {
      return
    });


    this.props.navigation.setParams({
      searchWorkouts: this.searchWorkoutHandler,
    });

    this.props.navigation.setParams({
      getAgentName: "Pradeep",
    });
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
    });;
  }

  sendMessage = (message) => {
    if(message.length < 1) this.setState({message:'   '}) ;
    if (this.state.chatThreadPk != null) {
      this.publishMessage(message);
    }else{
      this.createNewChatThread(message);
    }



  }

  userTextChanged = (text)=>{
    this.setState({message:text})
    if (this.state.agentPk == null) {
      return;
    }
    this.state.connection.session.publish(wamp_prefix+'service.support.agent.'+ this.state.agentPk, [this.state.uid , 'T' , text] , {}, {
        acknowledge: true
    })
  }

 searchWorkoutHandler = () => {
   if (this.state.data.length >1) {
     if(this.state.modalVisible == false) this.setState({modalVisible:true});
     else this.setState({modalVisible:false})
   }
  };

  modalAttach = (event) => {

    this.setState({attachModal:!this.state.attachModal});
    if(event == 'gallery') this._pickImage();
    if(event == 'camera') {
     this.setState({ hasCameraPermission: true });
    }


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
      var dataToSend = {uid:this.state.uid , usersFeedback:feedback  , rating:this.state.starRating , sentByAgent:false };

       this.state.connection.session.publish(wamp_prefix+'service.support.agent.'+ this.state.agentPk, [this.state.uid , 'FB' , dataToSend ] , {}, {
         acknowledge: true
       })

     this.resetChat();

      this.setState({modalVisible: false});
    }
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
  let starIcon =['md-star-outline','md-star-outline','md-star-outline','md-star-outline','md-star-outline'];
    arr.forEach((val,index)=>{
      if(index > count-1) return ;
      arr[index] = '#10254E'
     }) ;
     starIcon.forEach((val,index)=>{
      if(index > count-1) return ;
      starIcon[index] = 'md-star'
     })


  this.setState({starIcon:starIcon});
  this.setState({rateColor:arr});
  this.setState({starRating:count});

 }



cameraRef = React.createRef();

handlePhoto = async () => {
  if(this.cameraRef){
    let picture = await this.cameraRef.current.takePictureAsync();
    this.setState({hasCameraPermission:false})
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


    fetch(serverURL + "/api/support/supportChat/", {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: img,
    }).then((response) => {
    return response.json()})
    .then((responseJson) => {
      let dataToPublish = [this.state.uid, 'M', responseJson, this.state.company, false, this.state.chatThreadPk, this.state.companyName, this.state.company]

      this.state.connection.session.publish(wamp_prefix+'service.support.agent', dataToPublish, {}, {
        acknowledge: true
      })
      responseJson.message = '<img style="width:50%;height:30%" src="'+ responseJson.attachment +'" >' ;
      responseJson.timeDate = this.timeWithDate(new Date())
      this.setState(prevState => ({
        data: [ ...prevState.data, responseJson],
      }))
    })
    .catch((error) => {
      return
    });
  }
}


  render() {
   if (this.state.hasCameraPermission === true) {

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
                style={{  flexWrap: 'nowrap',alignItems: 'flex-end',justifyContent:'center',width:60, height:60, borderRadius:30, backgroundColor:"#fff"}}
                onPress={this.handlePhoto} />
            </View>
          </Camera>
        </View>
      );
    }
    else{

    return (
      <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={{flex:1}} enabled>


        <ScrollView
          ref='_scrollView'
          onContentSizeChange={() => { this.refs._scrollView.scrollToEnd({animated: true}); }}
        >
        <FlatList style={styles.list}
//          inverted
          data={this.state.data}
          keyExtractor= {(item , index) => {
            return index.toString();
          }}
          renderItem={(message) => {
            const item = message.item;
            let inMessage = item.type === 'in';
            if(item.message.length < 1 || item.message == 'undefined') var m = ' ';
            else var m = item.message
            let itemStyle = inMessage ? styles.itemIn : styles.itemOut;
            return (
              <View style={[ itemStyle]}>
              {inMessage &&
                <View style={[styles.item,styles.balloon]}>
                  <HTML html={item.message}  />
                </View>
                }
                {!inMessage &&
                <View style={[styles.itemout,styles.balloon,{backgroundColor:this.state.color}]}>
                  <HTML html={m}   />
                </View>
                }
                {inMessage && <MonoText   style={styles.time}>{item.timeDate}</MonoText> }
                {!inMessage && <MonoText   style={styles.timeout}>{item.timeDate}</MonoText> }

              </View>

            )
          }}/>
          </ScrollView>

         <View  style={styles.footer} >
          <View style={[styles.inputContainer,{borderColor: this.state.color,}]}>
            <TextInput style={styles.inputs}
                placeholder="Type a message..."
                underlineColorAndroid='transparent'
                ref={input => { this.textInput = input }}
                onChangeText={(text) => this.userTextChanged(text)}/>
             <TouchableOpacity   onPress={() => this.modalAttach()} style={{marginHorizontal: 15,}}>
                <Icon type="ionicon" name="md-attach"   size={22} style={{textAlignVertical: 'center',}} />
             </TouchableOpacity>
          </View>

            <TouchableOpacity style={[styles.btnSend,{backgroundColor:this.state.color}]} onPress={() => this.sendMessage(this.state.message)}>
                <Icon type="ionicon" name= "md-send" color="#fff" style={{textAlignVertical: 'center'}}/>
            </TouchableOpacity>

        </View>

        <View style = { styles.modalcontainer }>
       <Modal isVisible={this.state.modalVisible} animationIn="fadeIn" animationOut="fadeOut" hasBackdrop={true} >
         <View style={styles.modalView}>
         <View style={styles.signupTextCont}>
             <TouchableOpacity   onPress={() => this.rating(1)}>
                <Icon type="ionicon" name={this.state.starIcon[0]} color={this.state.rateColor[0]}  size={32} style={{textAlignVertical: 'center',}} />
             </TouchableOpacity>
             <TouchableOpacity   onPress={() => this.rating(2)}>
                <Icon type="ionicon" name={this.state.starIcon[1]}  color={this.state.rateColor[1]} size={32} style={{textAlignVertical: 'center',}} />
             </TouchableOpacity>
             <TouchableOpacity   onPress={() => this.rating(3)}>
                <Icon type="ionicon" name={this.state.starIcon[2]}  color={this.state.rateColor[2]} size={32} style={{textAlignVertical: 'center',}} />
             </TouchableOpacity>
             <TouchableOpacity   onPress={() => this.rating(4)}>
                <Icon type="ionicon" name={this.state.starIcon[3]}  color={this.state.rateColor[3]} size={32} style={{textAlignVertical: 'center',}} />
             </TouchableOpacity>
             <TouchableOpacity   onPress={() => this.rating(5)}>
                <Icon type="ionicon" name={this.state.starIcon[4]}  color={this.state.rateColor[4]}  size={32} style={{textAlignVertical: 'center',}} />
             </TouchableOpacity>
          </View>
           <TextInput
                   style={{height: 150, borderWidth: 0, marginTop: 0,paddingHorizontal:20,fontSize:18,}}
                   underlineColorAndroid='#fff'
                   multiline={true}
                   numberOfLines={5}
                   placeholder="Write your review here"
                   onChangeText={(text) => this.setState({feedback:text})}
             />
         <View style={{flexDirection: 'row',flexDirection: 'row',alignItems: 'center',justifyContent: 'center',padding:0,margin:0,marginTop: 20,}}>
           <TouchableOpacity style={{flex: 1,backgroundColor:"#fff",borderWidth:1,borderColor:'#c2c2c2'}}  onPress={() => this.setModalVisible()}>
              <View  style={{alignSelf:'center',}}>
                <MonoText   style={{color:"#000",fontSize:17,paddingVertical:8}}>Next Time</MonoText>
              </View>
           </TouchableOpacity>
            <TouchableOpacity  style={{flex: 1,backgroundColor:"#10254E",borderWidth:1,borderColor:'#10254E'}}  onPress={() =>{
              this.setModalVisible(this.state.feedback);
              this.props.navigation.goBack()
            } }>
              <View style={{alignSelf:'center',}}>
                <MonoText   style={{color:"#fff",fontSize:17,paddingVertical:8}}>Submit</MonoText>
              </View>
            </TouchableOpacity>
         </View>
         </View>
       </Modal>
        </View>

        <View style = { styles.modalcontainer }>
          <Modal isVisible={this.state.attachModal} animationIn="fadeIn" animationOut="fadeOut" hasBackdrop={true} onBackdropPress={() => {this.modalAttach()}}>
            <View style={[styles.modalView,{backgroundColor:"#10254E",}]}>
               <MonoText   style={{color:"#FFF",fontSize:20,alignSelf:'center',padding:10,fontWeight:'bold'}}>Attach Document</MonoText>
               <View style={{flexDirection: 'row',flexDirection: 'row',alignItems: 'center',justifyContent: 'center',paddingBottom:20,margin:0,marginTop: 20,}}>
                 <TouchableOpacity style={{flex: 1,}}  onPress={() => this.modalAttach('camera')}>
                    <View  style={{alignSelf:'center',}}>
                      <Icon type="ionicon" name='md-camera' color="#fff"  size={50} style={{textAlignVertical: 'center',}} />
                      <MonoText   style={{color:"#FFF",fontSize:20,fontWeight:'bold'}}>Camera</MonoText>
                    </View>
                 </TouchableOpacity>
                  <TouchableOpacity  style={{flex: 1,}}  onPress={() => this.modalAttach('gallery')}>
                    <View style={{alignSelf:'center',}}>
                      <Icon type="ionicon" name='md-photos'  color="#fff" size={50} style={{textAlignVertical: 'center',}} />
                      <MonoText   style={{color:"#FFF",fontSize:20,fontWeight:'bold'}}>Gallery</MonoText>
                    </View>
                  </TouchableOpacity>
              </View>
           </View>
         </Modal>
        </View>
      </KeyboardAvoidingView>
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
      backgroundColor: '#fff',
      marginHorizontal: 20 ,
//      padding: 20,
      borderRadius:5,

     },
    signupTextCont:{
       flexDirection: 'row',
       justifyContent: 'space-between',
       paddingHorizontal: 20,
       marginTop: 20,
      },

  container:{
    flex:1,
  },
  list:{
    paddingHorizontal: 17,
    paddingBottom: 80,

  },
  footer:{
   position: 'absolute',
    bottom:60,right:0,
    flexDirection: 'row',
    width:'100%',
    height:60,
    backgroundColor: '#eeeeee',
    paddingHorizontal:10,
    padding:5,
  },
  btnSend:{
//    backgroundColor:color,
    width:40,
    height:40,
    borderRadius:360,
    alignItems:'center',
    justifyContent:'center',
  },
  iconSend:{
    width:30,
    height:30,
    alignSelf:'center',
  },
  inputContainer: {
//    borderColor: color,
    backgroundColor: '#FFFFFF',
    borderRadius:30,
    borderBottomWidth: 1,
    height:45,
    flexDirection: 'row',
    justifyContent:'flex-start',
    alignItems:'center',
    flex:1,
    marginRight:10,
    borderWidth:1,
  },
  inputs:{
    height:45,
    marginLeft:16,
    borderBottomColor: '#FFFFFF',
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
    fontSize:12,
    color:"#000",
  },
  timeout: {
    alignSelf: 'flex-end',
    marginRight:15,
    fontSize:12,
    color:"#000",
  },
  item: {
    marginVertical: 14,
    backgroundColor:'#fff',
    borderRadius:300,
    borderTopLeftRadius:0,
    padding:5,

  },
  itemout: {
    marginVertical: 14,
    backgroundColor:'#fff',
    borderRadius:300,
    borderTopRightRadius:0,
    padding:5,
  },
   iconContainer: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: 120
    },
});
