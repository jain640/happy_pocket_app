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
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,ActivityIndicator,KeyboardAvoidingView, ImageBackground
} from 'react-native';
import { FontAwesome,SimpleLineIcons ,Feather,MaterialIcons} from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import OrderDetails from '../components/OrderDetails';
import FloatingInput from '../components/FloatingInput';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import { LinearGradient } from 'expo';
import settings from '../constants/Settings.js';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { Fumi } from 'react-native-textinput-effects';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import ModalBox from 'react-native-modalbox';



class ProfileEditScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state

    return {
      title:  'Profile',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0,
        justifyContent:'center'
      },
      headerLeft: (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
       <TouchableOpacity onPress={()=>{navigation.navigate('HomeScreen')}}><MaterialIcons name={'arrow-back'} size={25} color={'#fff'}/></TouchableOpacity>
        </View>
     ),
      headerTintColor: '#fff',

    };
  }

  constructor(props){
    super(props);
    this.state = {
      user:{},
      firstName:'',
      lastName:'',
      mobile:'',
      email:'',
      confirm :'',
      password:'',
      csrf:'',
      sessionid:'',
      store:this.props.store,
      displayPicture:null,
      attachOpen:false,
      loader:false,
      imageAdd:false,
      selectedStore:props.selectedStore,
      selectedLandmark:props.selectedLandmark,
    }
    willFocus = props.navigation.addListener(
      'willFocus',
      payload => {
            this.getUserAsync()
      }
    );

  }

  getUserAsync = async () => {
    this.setState({loader:true})

    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    this.setState({userToken:userToken,sessionid:sessionid,csrf:csrf})
    if(userToken == null){
    this.setState({loader:false})
    return
    }
    fetch(SERVER_URL+'/api/HR/users/'+ userToken + '/', {
    headers: {
        "Cookie" :"csrftoken="+csrf+"; sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
    }
    }).then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson);
      AsyncStorage.setItem('first_name',JSON.stringify(responseJson.first_name))
      AsyncStorage.setItem('last_name',JSON.stringify(responseJson.last_name))
      AsyncStorage.setItem('user_name',JSON.stringify(responseJson.username))
      this.setState({firstName:responseJson.first_name,lastName:responseJson.last_name,displayPicture:{uri:responseJson.profile.displayPicture},email:responseJson.email})
      this.setState({loader:false})
    })
    .catch((error) => {
      this.setState({loader:false})
      return
    });
  }


  storeSelection=()=>{
    this.props.navigation.navigate('StoreScreen',{userSelect:true})
  }
  componentDidMount(){
     this.props.navigation.setParams({
       themeColor:this.state.store.themeColor
     });
     this.getUserAsync()
  }

  save=()=>{
    let data = new FormData();
    data.append('firstName',this.state.firstName)
    data.append('userID',this.state.userToken)
    data.append('lastName',this.state.lastName)
    data.append('email',this.state.email)
    this.setState({loader:true})
    if(this.state.imageAdd){
      data.append('displayPicture',this.state.displayPicture)
    }

    console.log(data);

    fetch(SERVER_URL + '/api/HR/updateUserProfile/', {
      headers: {
        "Cookie" :"csrftoken="+ this.state.csrf +";sessionid=" + this.state.sessionid + ";" ,
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data;',
        'Referer': SERVER_URL,
        'X-CSRFToken': this.state.csrf
      },
      method: 'POST',
      body: data
    })
    .then((response) =>{
      return response.json()
    })
    .then((responseJson) => {
      this.setState({loader:false})
      this.refs.toast.show('Profile Updated Sucessfully...');
      console.log(responseJson,'jjjjjjjjjjjjjjj');
    })
    .catch((error) => {
      this.setState({loader:false})
      this.refs.toast.show('Something went wrong...');
      return
    });
  }

  changeText=(value,key)=>{
     this.setState({[key]:value})
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

  getCameraAsync=async(obj)=> {
     const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
     if (status === 'granted') {
       this.attachShow(true)
     } else {
       throw new Error('Camera permission not granted');
    }
  }

  getCameraRollAsync=async(obj)=> {
     const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
     if (status === 'granted') {
       this.attachShow(true)
     } else {
       throw new Error('Gallery permission not granted');
    }
  }

  modalAttach =async (event) => {
     if(event == 'gallery') return this._pickImage();
     if(event == 'camera') {
       this.handlePhoto()
     }
  };

  _pickImage = async () => {
       let csrf = await AsyncStorage.getItem('csrf');
       let sessionid = await AsyncStorage.getItem('sessionid');
       let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true
      });
       let img = new FormData();
       let filename = result.uri.split('/').pop();
       let match = /\.(\w+)$/.exec(filename);
       var type = match ? `image/${match[1]}` : `image`;
       const photo = {
         uri: result.uri,
         type: type,
         name:filename,
       };
       if(photo.uri ==null||photo.name == null ){
         this.attachShow(false)
         return
       }
       this.setState({displayPicture:photo,imageAdd:true});
       this.attachShow(false)
  };


  handlePhoto = async () => {
    let csrf = await AsyncStorage.getItem('csrf');
    let sessionid = await AsyncStorage.getItem('sessionid');
    let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});
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
    if(photo.uri ==null||photo.name == null ){
      this.attachShow(false)
      return
    }
    this.setState({displayPicture:photo,imageAdd:true});
    this.attachShow(false)
  }


  render() {

  return (
    <View style={{flex:1,height:'100%'}}>
      <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
      <View style={{flex:1, height:'100%'}}>
      {this.state.loader&&
        <View style={{flex:1,justifyContent:'center',alignItems: 'center',marginTop:15}}>
          <ActivityIndicator size="large" color={this.state.store.themeColor} />
        </View>
      }
      {!this.state.loader&&
        <View style={{height:'100%'}}>
          <ScrollView style={{height:'100%', paddingBottom:15}}>
            <ImageBackground source={require('../assets/images/Profile_Background.png')} resizeMode="cover" style={{width:'100%', height:115, justifyContent:'center', top:0}}>                  
            </ImageBackground>
            <View style={[styles.container,{paddingHorizontal:15,paddingVertical:15}]} >
                <View style={{flexDirection:'row', justifyContent:'center'}}>
                  {this.state.displayPicture!=null&&
                    <TouchableOpacity style={{backgroundColor:'#ffffff',borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,height:100, width:100, top: -61}} onPress={()=>{this.attachShow(true)}}>
                      <View style={{justifyContent:'center',alignItems:'center'}}>
                        <Image source={this.state.displayPicture.uri!=null&&this.state.displayPicture.uri.length>0?{uri:this.state.displayPicture.uri}:null} style={{width:100,height:100,backgroundColor:'#f2f2f2',borderWidth:2,borderColor: "#f2f2f2",resizeMode:'cover'}}/>
                      </View>
                      <Image
                        source={require('../assets/images/edit_pen.png')}
                        style={{ position:'absolute', backgroundColor:'#fff', right:0, bottom:0  }}
                      />
                    </TouchableOpacity>
                  }
                </View>
                <View style={{ top:-40}}>
                  <View style={{marginBottom:15,borderWidth:1,borderColor:'#C7C7C7',borderRadius:8}}>
                    <MonoText   style={{fontSize:16,fontWeight:'700', top:-12, left:15, backgroundColor:'#fff', width:80}}>First Name</MonoText>
                    <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,fontSize:18,color:'#000',}}
                        onChangeText={(firstName)=>this.setState({firstName:firstName})}
                        value={this.state.firstName}>
                    </TextInput>
                  </View>
                  <View style={{marginBottom:15,borderWidth:1,borderColor:'#C7C7C7',borderRadius:8}}>
                    <MonoText   style={{fontSize:16,fontWeight:'700', top:-12, left:15, backgroundColor:'#fff', width:80}}>Last Name</MonoText>
                    <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,fontSize:18,color:'#000',}}
                        onChangeText={(lastName)=>this.setState({lastName:lastName})}
                        value={this.state.lastName}>
                    </TextInput>
                  </View>
                  <View style={{marginBottom:15,borderWidth:1,borderColor:'#C7C7C7',borderRadius:8}}>
                    <MonoText   style={{fontSize:16,fontWeight:'700', top:-12, left:15, backgroundColor:'#fff', width:40}}>Email</MonoText>
                    <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,fontSize:18,color:'#000',}}
                        onChangeText={(email)=>this.setState({email:email})}
                        value={this.state.email}
                        email={true}>
                    </TextInput>
                  </View>
                  <View style={{marginBottom:15, borderWidth:1,borderColor:'#C7C7C7',borderRadius:8}}>
                    <MonoText   style={{fontSize:16,fontWeight:'700', top:-12, left:15, backgroundColor:'#fff', width:80}}>Apartment</MonoText>
                    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                      <MonoText   style={{height:40,marginTop:5,paddingHorizontal:10,fontSize:18,color:'#000',}}>{this.state.selectedLandmark.landmark}</MonoText>
                      <TouchableOpacity onPress={()=>{this.storeSelection()}}  style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end',paddingTop:15,paddingBottom:10,paddingRight:15,paddingLeft:5}}>
                        <MonoText style={{color:this.state.store.themeColor, fontSize:12, fontWeight:'400'}}>Change</MonoText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
            </View>
          </ScrollView>
          <View style={[styles.footer,{backgroundColor:this.state.store.themeColor,height:45}]}>
            <TouchableOpacity onPress={() => {this.save() }} style={{width:'100%',height:'100%',justifyContent:'center',alignItems:'center'}}>
            <MonoText   style={{ color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', borderWidth: 1, borderRadius: 3, borderColor: this.state.store.themeColor,}}>SAVE</MonoText>
            </TouchableOpacity>
          </View>
        </View>
      }
      </View>
      <ModalBox
        style={{height:150}}
        position={'bottom'}
        ref={'attachModal'}
        isOpen={this.state.attachOpen}
        onClosed={()=>{this.setState({attachOpen:false})}}>
          <View style={{flex:1,flexDirection: 'row'}}>
            <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('gallery')}}>
              <View style={{height:60,width:60,backgroundColor: this.state.store.themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 30}} >
                <FontAwesome  name="photo" size={35} color="#fff" />
              </View>
              <MonoText   style={{fontSize: 18,color:this.state.store.themeColor,fontWeight: '600',}}>Gallery</MonoText>
            </TouchableOpacity>
            <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('camera')}}>
              <View style={{height:60,width:60,backgroundColor: this.state.store.themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 30}} >
                <FontAwesome  name="camera" size={25} color="#fff" />
              </View>
              <MonoText   style={{fontSize: 18,color:this.state.store.themeColor,fontWeight: '600',}}>Camera</MonoText>
            </TouchableOpacity>
          </View>
      </ModalBox>
    </View>



    );
  }
}

const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    selectedStore:state.cartItems.selectedStore,
    selectedLandmark:state.cartItems.selectedLandmark,
    myStore:state.cartItems.myStore,
    
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reOrderFunction:  (args) => dispatch(actions.reOrderAction(args)),
    addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
    emptyCartFunction:()=>dispatch(actions.emptyCart()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileEditScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height:'100%'
  },
  image: {
    width: width,
    height: width * 0.5
  },
  inputStyle:{
    height: 50,
    width:'100%',
    borderRadius:5,
    fontSize: 16,
    flexDirection: 'row',
    borderWidth:1,
    borderColor:'#f2f2f2'
  },
  textInput:{
    borderBottomWidth: 2,
    borderColor: '#f2f2f2',
    color: '#000',
    fontSize: 18,
    width:'100%',
    marginTop:10
  },
  footer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    borderWidth: 0,
  }


});
