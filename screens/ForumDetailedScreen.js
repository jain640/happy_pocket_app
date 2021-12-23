import React from 'react';
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  View,
  Slider,
  Dimensions, Alert,StatusBar,FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,TouchableWithoutFeedback,NativeModules,LayoutAnimation,Keyboard
} from 'react-native';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import TextLoader from '../components/TextLoader';
import ActiveDispute from '../components/ActiveDispute';
import ResolveDispute from '../components/ResolveDispute';
import HTMLView from 'react-native-htmlview';
import { Card } from 'react-native-elements';
import TabBarStyle from '../components/TabBarStyle';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { FontAwesome,Entypo,MaterialIcons,MaterialCommunityIcons,AntDesign,SimpleLineIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollableTabView, DefaultTabBar, ScrollableTabBar, } from '@valdio/react-native-scrollable-tabview';
import { FloatingAction } from "react-native-floating-action";
import moment from 'moment';
import { Audio } from 'expo-av';
import  ModalBox from 'react-native-modalbox';
import Modal from "react-native-modal";
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { MonoText } from '../components/StyledText';
import { Camera } from 'expo-camera';
import Loader from '../components/Loader';


const SERVER_URL = settings.url

const { UIManager } = NativeModules;
const { width } = Dimensions.get('window');
const height = width * 0.8

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const recordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
}



class ForumDetailedScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      header:null
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      data:null,
      reply:'',
      keyboardOpen : false,
      keyboardHeight:0,
      scrollHeight:Dimensions.get('window').height-100,
      footerHeight:55,
      isFetching: false,
      isRecording: false,
      query: '',
      transcript: '',
      selectedImg:null,
      imageModal:false,
      attachOpen:false,
      image:[],
      filesPk:[],
      login:false,
      store:props.store,
      comments:[],
      commentShow:true,
      loader:false,
      userPk:null

    };
    this.recording = null;

    Keyboard.addListener(
     'keyboardDidHide',
     this.showKeyboard
    )
    Keyboard.addListener(
       'keyboardDidShow', this.hideKeyboard
    )

    willFocus = props.navigation.addListener(
   'willFocus',
     payload => {
       this.loginOrNot()
       }
    );

  }
  componentDidMount(){
   const data = this.props.navigation.getParam('data',null)
   const comment = this.props.navigation.getParam('comment',null)
   if(data!=null){
     this.setState({data:data})
     this.getComment(data.pk)
   }
   if(comment!=null){
     this.setState({commentShow:false})
   }
  }

  loginOrNot=()=>{
    AsyncStorage.getItem('login').then(userToken => {
      if(userToken == 'true' || userToken == true){
        this.setState({login:true})
      }else{
        this.setState({login:false})
      }
    }).done();
  }

  getTimeAgo = (date)=>{
    var today = new Date()
    var d = Date.parse(date)
    var delta = Math.abs(today - d) / 1000;
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    var seconds = delta % 60;

    if(days>0){
      if(days>=1&&days<2){
        return days + ' day ago'
      }else{
        return days + ' days ago'
      }
    }else{
      if(hours>0){
        if(hours>=1&&hours<2){
          return hours + ' hour ago'
        }else{
          return hours + ' hours ago'
        }
      }else{
        if(minutes>0){
          if(minutes>=1&&minutes<2){
            return minutes + ' min ago'
          }else{
            return minutes + ' mins ago'
          }
        }else{
          if(seconds>=1&&seconds<2){
            return parseInt(seconds) + ' sec ago'
          }else{
            return parseInt(seconds) + ' secs ago'
          }
        }
      }
    }
  }

  getComment=async(pk)=>{
    const user = await AsyncStorage.getItem('userpk');
    this.setState({userPk:user})
    await fetch(SERVER_URL+'/api/POS/forumComment/?parent='+pk)
    .then((response)=>{
      return response.json()
    }).then((json)=>{
      if(!json){
        return
      }
      this.setState({comments:json})

  })
  }


  postComment = async()=>{
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');

    var dataSend = {
      content:this.state.transcript,
      parent:this.state.data.pk,
      files:this.state.filesPk
    }
    console.log(dataSend,'hhhhh');
    fetch(SERVER_URL+'/api/POS/forumComment/',{
      method:"POST",
      headers: {
        "Cookie" :"csrftoken="+csrf+"; sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL+'/api/POS/forumComment/',
        'X-CSRFToken': csrf
      },
      body: JSON.stringify(dataSend)
    })
    .then((response)=>{
      console.log(response.status);
      return response.json()
    }).then((json)=>{
        this.setState({transcript:'',filesPk:[]})
        this.setState({loader:false})
        this.getComment(this.state.data.pk)
    }).catch((error)=>{
      this.setState({loader:false})
    })
  }


    componentDidUpdate(prevProps, prevState) {
        const { query } = this.state;
        if (prevState.query === null && query !== null) {
            // update search
        }
    }

    deleteRecordingFile = async () => {
      try {
        const info = await FileSystem.getInfoAsync(this.recording.getURI())
        await FileSystem.deleteAsync(info.uri)
      } catch (error) {
        console.log('There was an error deleting recorded file', error)
      }
    }

    resetRecording = () => {
      this.deleteRecordingFile()
      this.recording = null
    }

    handleOnPressOut = () => {
      this.stopRecording()
      this.getTranscription()
    }

      startRecording = async () => {

      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING)

      if (status !== 'granted') return

      this.setState({ isRecording: true })


      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: true,
        staysActiveInBackground: true,
      })
      const recording = new Audio.Recording()
      try {
        await recording.prepareToRecordAsync(recordingOptions)
        await recording.startAsync()
      } catch (error) {
        console.log(error)
        this.stopRecording()
      }

      this.recording = recording
      }


      stopRecording = async () => {
        this.setState({ isRecording: false })
        try {
          await this.recording.stopAndUnloadAsync()
        } catch (error) {
          console.log(error)
        }
    }

        resetRecording = () => {
            this.deleteRecordingFile();
            this.recording = null;
    }

  getTranscription = async () => {
  this.setState({ isFetching: true })
  try {
    const { uri } = await FileSystem.getInfoAsync(this.recording.getURI())
    const formData = new FormData()
    formData.append('audio', {
      uri,
      type: Platform.OS === 'ios' ? 'audio/x-wav' : 'audio/m4a',
      name: Platform.OS === 'ios' ? `${Date.now()}.wav` :`${Date.now()}.m4a`,
    })
    var config = {
         encoding: "LINEAR16",
         sampleRate: 16000,
         languageCode: "en-US"
       }
    formData.append('config', config)
    // 'Content-Type': 'multipart/form-data',LINEAR16FLACAMR_WB
    var payload = {
      config :{
           encoding: "FLAC",
           sampleRate: 16000,
           languageCode: "en-US"
         },
        audio:{
          content:uri
        }
    }

    const { data } = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
      method:"POST",
      "crossDomain": true,
      headers: {
          "x-goog-api-key": "AIzaSyCW6HObBLqDFfTt-bZVxQvAjSBXeieR5s8",
          "Content-Type": "multipart/formData",
          "cache-control": "no-cache",
      },
      body: formData
    }).then((response)=>{
      console.log(response,'speechhhh');
      response.json()
  }).then((json)=>{
    this.setState({ transcript: data.transcript })
  })
  }catch(error){
    console.log('There was an error reading file', error)
    this.stopRecording()
    this.resetRecording()
  }
  this.setState({ isFetching: false })
}

  showKeyboard =()=>{
      this.setState({keyboardOpen : false})
        this.setState({scrollHeight:this.state.scrollHeight+500})
    }
    hideKeyboard =(e)=>{
        this.setState({keyboardOpen : true})
        this.setState({
            keyboardHeight:
                 e.endCoordinates.height+27
        });
        try {
          this.setState({scrollHeight:this.state.scrollHeight-500})
        } catch (e) {

        } finally {

        }
  }

  modalShow=(img,bool)=>{
    this.setState({selectedImg:img,imageModal:bool})
  }
  attachShow=async(bool)=>{
    const { status, expires, permissions } = await Permissions.getAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );

      if(permissions.camera.status == 'granted'){
        if(permissions.cameraRoll.status == 'granted'){
          this.setState({attachOpen:bool})
        }else{
          this.getCameraRollAsync()
        }
      }else{
        this.getCameraAsync()
      }

  }

  modalAttach =async (event) => {
    if(event == 'gallery') return this._pickImage();
    if(event == 'camera') {
      this.handlePhoto()
    }
  };

  getCameraAsync=async()=> {

  const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
  if (status === 'granted') {
    this.attachShow(true)
  } else {
    throw new Error('Camera permission not granted');
  }
}

 getCameraRollAsync=async()=> {

  const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  if (status === 'granted') {
    this.attachShow(true)
  } else {
    throw new Error('Gallery permission not granted');
  }
}


  _pickImage = async () => {

      let result = await ImagePicker.launchImageLibraryAsync({
       mediaTypes: ImagePicker.MediaTypeOptions.Images,
       allowsMultipleSelection: true
     });
     this.attachShow(false)

      let img = new FormData();
      let filename = result.uri.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);

      var type = match ? `image/${match[1]}` : `image`;


      const photo = {
        uri: result.uri,
        type: type,
        name:filename,
      };
      var imageLib = this.state.image
      imageLib.push(photo)
      this.setState({ image: imageLib });

 };
handlePhoto = async () => {

 let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});

 this.attachShow(false)
 if(picture.cancelled == true){
   return
 }


 let img = new FormData();
 let filename = picture.uri.split('/').pop();
 let match = /\.(\w+)$/.exec(filename);
 let type = match ? `image/${match[1]}` : `image`;

 const photo = {
   uri: picture.uri,
   type: type,
   name:filename,
 };

 var imageLib = this.state.image
 imageLib.push(photo)
 this.setState({ image: imageLib });

}

removeImage=(index)=>{
  var imgs = this.state.image
  imgs.splice(index,1)
  this.setState({image:imgs})
}

requestAsync=(parameter,csrf,sessionid)=>{
 var formData  = new FormData();
 formData.append('typ', 'image');
 formData.append('attachment', parameter);

 return new Promise(resolve => {
    fetch(SERVER_URL+'/api/POS/forumCommentfies/',{
     method: 'POST',
     headers: new Headers({
       "Cookie" :"csrftoken="+csrf+"; sessionid=" + sessionid +";",
       'Accept': 'application/json',
       'Content-Type': 'multipart/form-data',
       'Referer': SERVER_URL+'/api/POS/forumCommentfies/',
       'X-CSRFToken': csrf
     }),
     body: formData
    }).then(function(response) {
        resolve(response);
        console.log(response.status,'staus checkkkk');
        return response.json()
    }).then((json)=>{
      var pk = json.pk
      console.log(json,pk,'jjjjjjjjjjjjjjjjjjjjjjjjjj');
      var filesPk = this.state.filesPk
      filesPk.push(pk)
      this.setState({filesPk:filesPk})
    }).catch((error) => {
        return
    });
 });
}

postImages=async()=>{
  const userToken = await AsyncStorage.getItem('userpk');
  const sessionid = await AsyncStorage.getItem('sessionid');
  const csrf = await AsyncStorage.getItem('csrf');

  if(this.state.login){
    var promises = [];

    this.state.image.map((data,i) => {
      promises.push(this.requestAsync(data,csrf,sessionid));
    });
    this.setState({loader:true})
    Promise.all(promises).then(() => {
      this.setState({image:[]})
      this.postComment()
    })
  }else{
    this.props.navigation.navigate('Login')
  }
}


  render(){
    var themeColor = this.props.store.themeColor
    return (
    <View style={{flex:1,backgroundColor:'#f2f2f2',}}>
    <View style={{height:Constants.statusBarHeight,backgroundColor:'#032757'}}></View>

    <View  style={{flex:1,}}>
      <View style={{}}>
        <View style={{height:55,alignItems: 'center',flexDirection: 'row',marginHorizontal: 15}}>
        <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{flex:0.1}}>
          <MaterialIcons name="arrow-back" size={25} color='#000' />
        </TouchableOpacity>
        <View style={{flex:0.9}}>
        {this.state.data!=null&&
          <MonoText   style={{fontSize:20,fontWeight:'800',color:'#000',}} numberOfLines={1}>{this.state.data.title}</MonoText>
        }
        </View>
        </View>

        <ScrollView style={{marginHorizontal: 15,marginBottom:this.state.keyboardOpen?60:this.state.footerHeight}} showsVerticalScrollIndicator={false}>
          <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', borderRadius: 7,width:'100%',margin:0,padding: 0,}]}>
          {this.state.data!=null&&
            <View style={{}}>
              <View style={{}}>
                <View style={{flex:0.2,flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginTop: 10}}>
                    <View style={{flex:1,justifyContent: 'flex-start',alignItems: 'flex-end',marginRight:15}}>
                      <MonoText   style={{fontSize:14,color:'grey',}} numberOfLines={1}>{moment(this.state.data.created).format('MMM DD YYYY')}</MonoText>
                    </View>
                 </View>
                <View style={{flex:0.8,marginHorizontal: 15}}>
                  {this.state.data.description.length>0&&
                    <View style={{fontSize:15,color:'grey',letterSpacing:0.5,marginVertical: 15,}} >
                    <HTMLView value = {"<div>"+this.state.data.description+"</div>"} stylesheet={styles} />
                    </View>
                  }

                  <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginBottom:15}}
                  data={this.state.data.files}
                  showsVerticalScrollIndicator={false}
                  numColumns={5}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item,index) => {
                    return index.toString();
                  }}
                  nestedScrollEnabled={true}
                  renderItem={({item, index}) => (
                    <View>
                    {item.attachment!=null&&
                    <TouchableOpacity style={{borderRadius:10,}} onPress={()=>this.modalShow(item.attachment,true)}>
                      <Image
                      source={{uri:item.attachment}}
                      style={{ width: width*0.146, height:width*0.146, borderRadius: 10,marginLeft:index%5==0?0:width*0.02,marginTop:width*0.02 }}
                      />
                    </TouchableOpacity>
                   }
                   </View>
                  )}
                  />

                </View>
              </View>
            </View>
          }
          </Card>
          {this.state.data!=null&&
            <MonoText   style={{fontSize:20,fontWeight:'800',color:'#000',marginTop: 20,}}>Replies ({this.state.comments.length})</MonoText>
          }
          <FlatList style={{borderColor : '#f2f2f2' , borderWidth:2,margin:0,backgroundColor:'#f2f2f2',marginBottom:50}}
          data={this.state.comments}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item,index) => {
            return index.toString();
          }}
          nestedScrollEnabled={true}
          renderItem={({item, index}) =>{
            var userPk = null
            if(item.user!=null&&item.user!=undefined){
               userPk = item.user.pk
            }
            return  (
            <View style={{flex:1,backgroundColor:'#f2f2f2'}}>
              <View style={{paddingVertical: 10,}}>
                <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor:this.state.userPk==userPk? '#fff':themeColor, borderRadius: 7,width:'100%',margin:0,padding: 0,}]}>
                  <View style={{}}>
                    <View style={{flex:1,}}>
                    <View style={{flex:0.2,flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginTop: 10}}>
                        <View style={{flex:1,justifyContent: 'flex-start',alignItems: 'flex-end',marginRight:10}}>
                          <MonoText   style={{fontSize:12,color:'#000',fontWeight:'700'}} numberOfLines={1}>{this.getTimeAgo(item.created)}</MonoText>
                        </View>
                    </View>
                    <View style={{flex:0.8,marginHorizontal: 15}}>
                      <MonoText   style={{fontSize:15,color:'#000',marginVertical: 10}} >{item.content}</MonoText>
                      <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginBottom:15}}
                      data={item.files}
                      showsVerticalScrollIndicator={false}
                      numColumns={5}
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item,index) => {
                        return index.toString();
                      }}
                      nestedScrollEnabled={true}
                      renderItem={({item, index}) => (
                        <View>
                        {item.attachment!=null&&
                        <TouchableOpacity style={{borderRadius:10,}} onPress={()=>this.modalShow(item.attachment,true)}>
                          <Image
                          source={{uri:item.attachment}}
                          style={{ width: width*0.146, height:width*0.146, borderRadius: 10,marginLeft:index%5==0?0:width*0.02,marginTop:width*0.02 }}
                          />
                        </TouchableOpacity>
                       }
                       </View>
                     )}
                      />
                    </View>

                    </View>
                  </View>
                </Card>
              </View>
            </View>

          )}}
          />
        </ScrollView>


      </View>
    </View>
    {this.state.commentShow&&<View style={{position: 'absolute',bottom:0,left:0,width:'100%',flexDirection:'row',backgroundColor:'#fff',minHeight:55,}}  onLayout={(event) => {
        this.setState({  footerHeight: event.nativeEvent.layout.height,  });
    }}>
      <View style={{flex:0.6,justifyContent: 'center',marginHorizontal: 15}}>
      {this.state.image.length>0&&!this.state.loader&&
      <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginBottom:15}}
      data={this.state.image}
      showsVerticalScrollIndicator={false}
      numColumns={4}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item,index) => {
        return index.toString();
      }}
      nestedScrollEnabled={true}
      renderItem={({item, index}) => (
        <View>
        <TouchableOpacity style={{borderRadius:10,}} onPress={(index)=>this.removeImage(index)}>
          <Image
          source={{uri:item.uri}}
          style={{ width: width*0.1, height:width*0.1, borderRadius: 10,marginLeft:index%4==0?0:width*0.03,marginTop:width*0.02 }}
          />
          <View style={{position: 'absolute',top:0,right:-10,width:20,height:20,backgroundColor: '#fa4616',alignItems: 'center',justifyContent: 'center',borderRadius:10}}>
            <FontAwesome  name="close" size={15} color="#fff" />
          </View>
        </TouchableOpacity>
       </View>
      )}
      />
    }
      {!this.state.isRecording&&!this.state.isFetching&&
        <TextInput style={{fontSize: 16,color: '#000',maxHeight: 120,marginBottom:this.state.image.length>0?5:0}}
        placeholder="Type a message..."
        underlineColorAndroid='transparent'
        ref={input => { this.textInput = input }}
        onChangeText={(text) => this.setState({transcript:text})}
        value={this.state.transcript}
        multiline={true}/>
      }
      {this.state.isRecording&&!this.state.isFetching&&
        <MonoText   style={{fontSize:15,color:'grey',alignSelf: 'center'}} >Listening...</MonoText>
      }
      {!this.state.isRecording&&this.state.isFetching&&
        <MonoText   style={{fontSize:15,color:'grey',alignSelf: 'center'}} >Fetching...</MonoText>
      }
      </View>

        <View style={{flex:0.4,alignItems: 'center',}}>
          <View style={{flex:1,justifyContent: 'center',alignItems: 'center',flexDirection: 'row'}} >
            <View style={[{backgroundColor: 'grey',alignItems: 'center',justifyContent: 'center',width:40,height:40,borderRadius: 20}]}>
              <TouchableOpacity style={[{backgroundColor: '#fff',alignItems: 'center',justifyContent: 'center',width:40,height:40,borderRadius: 20}]} onPress={()=>{this.attachShow(true)}} >
                <MaterialIcons  name="attach-file" size={25} color={themeColor} />
              </TouchableOpacity>
            </View>
            <View style={[{backgroundColor: 'grey',alignItems: 'flex-end',justifyContent: 'center',width:40,height:40,borderRadius: 20,marginLeft: 5}]}>
              <TouchableOpacity style={[{backgroundColor: '#fff',alignItems: 'center',justifyContent: 'center',width:40,height:40,borderRadius: 20}]} onPress={this.postImages} >
                <MaterialIcons  name="send" size={25} color={themeColor} />
              </TouchableOpacity>
            </View>
        </View>
      </View>

    </View>
  }
    <Modal style={{justifyContent: 'center',alignItems: 'center',margin: 0}} isVisible={this.state.imageModal} animationIn="fadeIn"  animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} onRequestClose={() => { this.modalShow(null,false) }} onBackdropPress={() => {this.modalShow(null,false)}} >
      <View style={{width:width*1,height:width*0.8,backgroundColor: '#fff',marginHorizontal:0,alignItems: 'center',justifyContent: 'center'}}>
      <Image
      source={{uri:this.state.selectedImg}}
      style={{ width:'100%', height:'100%', }}
      />
      </View>
    </Modal>

    <ModalBox
        style={{height:150}}
        position={'bottom'}
        ref={'attachModal'}
        isOpen={this.state.attachOpen}
        onClosed={()=>{this.setState({attachOpen:false})}}>
          <View style={{flex:1,flexDirection: 'row'}}>
            <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('gallery')}}>
              <View style={{height:60,width:60,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 30}} >
                <FontAwesome  name="photo" size={35} color="#fff" />
              </View>
              <MonoText   style={{fontSize: 18,color:themeColor,fontWeight: '600',}}>Gallery</MonoText>
            </TouchableOpacity>
            <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('camera')}}>
              <View style={{height:60,width:60,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 30}} >
                <FontAwesome  name="camera" size={25} color="#fff" />
              </View>
              <MonoText   style={{fontSize: 18,color:themeColor,fontWeight: '600',}}>Camera</MonoText>
            </TouchableOpacity>
          </View>
    </ModalBox>

    {this.state.loader&&
      <View >
      <Loader
      modalVisible = {this.state.loader}
      animationType="fade"
      />
      </View>
    }

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
    shadowOpacity: 0,
    shadowRadius: 3.84,
    elevation: 0,
  },
  h3:{
    fontSize: 18,
    fontWeight: '500',
    paddingVertical:10,
  },
  ul:{
    flex:1
  }

})


const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
    emptyCartFunction:()=>dispatch(actions.emptyCart()),


  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ForumDetailedScreen);


// <View style={{flex:0.2,justifyContent: 'center',alignItems: 'center'}}>
// {item.user!=null&&
//   <View style={{}}>
//   {item.user.profile.displayPicture!=null&&
//   <Image
//   source={{uri:item.user.profile.displayPicture}}
//   style={{ width: 40, height: 40, borderRadius: 40/2 }}
//   />
//   }
//   {item.user.profile.displayPicture==null&&
//     <View style={{width: 40, height: 40, borderRadius: 40/2,backgroundColor: '#f2f2f2'}}></View>
//   }
// </View>
// }
// {item.user==null&&
//   <View style={{width: 40, height: 40, borderRadius: 40/2,backgroundColor: '#f2f2f2'}}></View>
// }
// </View>
//
//   <View style={{flex:0.55,justifyContent: 'flex-start',alignItems: 'flex-start'}}>
//   {item.user!=null&&
//   <MonoText   style={{fontSize:14,color:'#000',fontWeight:'700'}} numberOfLines={1}>{item.user.first_name} </MonoText>
// }
//   </View>


// this.state.keyboardOpen? this.state.keyboardHeight: Platform.OS == 'ios'?10:
// marginBottom:this.state.keyboardOpen?this.state.keyboardHeight+this.state.footerHeight:this.state.footerHeight
