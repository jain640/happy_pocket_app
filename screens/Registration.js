import React,{Component} from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,TextInput,Alert,Dimensions,AsyncStorage,Keyboard,
  TouchableOpacity,LayoutAnimation,KeyboardAvoidingView,
  View,Button,ImageBackground,FlatList,ToastAndroid,
} from 'react-native';
import { Card,SearchBar} from 'react-native-elements';
import Constants from 'expo-constants';
import { Ionicons ,FontAwesome} from '@expo/vector-icons';
import { Dropdown } from 'react-native-material-dropdown-v2';
import * as DocumentPicker from 'expo-document-picker';
import * as Permissions from 'expo-permissions';
import Modal from "react-native-modal";
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import settings from '../constants/Settings';
import { Camera } from 'expo-camera';
import * as  ImagePicker  from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MonoText } from '../components/StyledText';

const IS_IOS = Platform.OS === 'ios';
const { width } = Dimensions.get('window');
const SERVER_URL = settings.url
const themeColor = settings.themeColor

 class Registration extends Component {
  constructor (props) {
    super(props);
      this.state ={
        store:this.props.store,
        firstnametext:'',
        lastnametext:'',
        usernametext:'',
        passwordtext:'',
        mobilenumber:0,
        gstintext:'',
        }
      Keyboard.addListener('keyboardDidHide',this.showKeyboard)
      Keyboard.addListener('keyboardDidShow', this.hideKeyboard)
    };

    showKeyboard =()=>{
        this.setState({keyboardOpen : false})
        this.setState({scrollHeight:this.state.scrollHeight+500})
        setTimeout(()=> {
            if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
              return
            }
            this.refs._scrollView.scrollToEnd({animated: true});
          }, 500);
    }

    hideKeyboard =(e)=>{
        this.setState({keyboardOpen : true})
        this.setState({keyboardHeight: e.endCoordinates.height+30});
        try {
          this.setState({scrollHeight:this.state.scrollHeight-500})
        }catch(e){}
         finally{}
        setTimeout(()=> {
          if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
            return
          }
          this.refs._scrollView.scrollToEnd({animated: true});
        }, 500);
    }

    static navigationOptions=({navigation})=>{
      const { params ={} }=navigation.state
      return{
        header:null
        // title:'Registration',
        // headerLeft:(
        //   <View style={{justifyContent:'flex-start',paddingLeft:15,}}>
        //       <TouchableOpacity >
        //         <MaterialIcons name="arrow-back" size={30} color={'#fff'}/>
        //       </TouchableOpacity>
        //   </View>
        // ),
        // headerStyle:{
        //     backgroundColor:params.themeColor
        // },
        // headerTintColor: '#fff',
      }
    }

    componentDidMount=async()=>{
      this.props.navigation.setParams({
        themeColor:this.state.store.themeColor
      })
    }

    modalAttach =async (event) => {
        if(event == 'gallery') return this._pickImage();
        if(event == 'camera'){
            this.handlePhoto()
        }
    };

    _pickImage = async () => {
        this.setState({photoshoot:false});
        let result = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: ImagePicker.MediaTypeOptions.Images,
           allowsMultipleSelection: true
        });
        this.attachShow(false)
        let filename = result.uri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        var type = match ? `image/${match[1]}` : `image`;
        const photo = {
           uri: result.uri,
           type: type,
           name:filename,
        };
        console.log(filename,'photopick')
        this.setState({ image: photo });
        this.setState({logo:filename});
        console.log(this.state.logo,'logo')
   };


   handlePhoto = async () => {
        this.setState({photoshoot:false});
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
        console.log(filename,'photopick')
        this.setState({ image: photo });
        this.setState({logo:filename});
        console.log(this.state.logo,'logo handlePhoto')
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

     getCameraRollAsync=async()=> {
         const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
         if(status === 'granted'){
            this.attachShow(true)
         }else{
            throw new Error('Gallery permission not granted');
         }
      }

      getCameraAsync=async()=> {
           const{ status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
           if(status === 'granted'){
              this.attachShow(true)
           }else{
              throw new Error('Camera permission not granted');
           }
        }
      save=()=> {
          console.log('fgh');


          var data={
              companyName:'',
              first_name:this.state.firstnametext,
              last_name:this.state.lastnametext,
              username:this.state.usernametext,
              password:this.state.passwordtext,
              mobile:this.state.mobilenumber,
              gstin:this.state.gstintext,
              email:'',
              pk:null,
          }
          // if(companyName.length>0){
          //   data.companyName=
          // }
          // var data = new FormData();
          // data.append("companyName", '');
          // data.append("first_name", this.state.firstnametext);
          // data.append("last_name", this.state.lastnametext);
          // data.append("username", this.state.usernametext);
          // data.append("password", this.state.passwordtext);
          // data.append("mobile", this.state.mobilenumber);
          // data.append("gstin", this.state.gstintext);
          // data.append("email", '');
          // data.append("pk", null);
          console.log(data,'data')
          fetch(SERVER_URL + '/api/HR/usersAdminMode/', {
              method: 'POST',
              body: JSON.stringify(data),
              headers: {
              }
          }).then((response) => {
                console.log(response,'responseusersAdminMode')
                console.log(response.status,'responseusersAdminModestatus')
          if (response.status == 200) {
              var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
              console.log(sessionid,'kkkkkkkkkkkkksessionids');
              this.setState({ sessionid: sessionid })
              AsyncStorage.setItem("sessionid", sessionid)
              return response.json()
          } else {
              Alert.alert('Incorrect Username or Password');
              // ToastAndroid.show('Incorrect Username or Password', ToastAndroid.SHORT);
              return
            }
          }).then((responseJson) => {
              console.log(responseJson.csrf_token.split('"')[0], 'kkkkkkkkkkkkktESTcsrf_token');
              AsyncStorage.setItem("csrf", responseJson.csrf_token)
              AsyncStorage.setItem("userpk", responseJson.pk + '')
              this.getInitial(responseJson.pk,responseJson.csrf_token)
                // AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
                //   return this.props.navigation.navigate('HomeScreen', {
                //     screen: 'ProfileScreen',
                //
                //   })
                // });
          }).catch((error) => {
              this.setState({loader:false})
              Alert.alert(error);
              // ToastAndroid.show('Incorrect Username or Password', ToastAndroid.SHORT);
          });
        }








    render(){
        return(
          <View style={[styles.container,{marginBottom: this.state.keyboardOpen?this.state.keyboardHeight:0,backgroundColor:'#f1f1f1'}]}>
            <View style={{backgroundColor:themeColor,height:Constants.statusBarHeight}} />
              <ScrollView>
                <View style={{justifyContent:'center',marginTop:20}}>
                      <MonoText   style={{textAlign:'center',fontSize:22,color:themeColor}}>Welcome</MonoText>
                      <MonoText   style={{textAlign:'center',fontSize:22,color:themeColor}}>to</MonoText>
                      <MonoText   style={{textAlign:'center',fontSize:22,color:themeColor}}>Made-for-India!</MonoText>
                </View>
                <View style={{flexDirection:'column',padding:8,marginHorizontal:10,marginTop:10}}>
                     <View style={{flexDirection:'column',}}>
                        <MonoText   style={{paddingBottom:2,fontSize:16}}>First Name</MonoText>
                        <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
                                           fontSize:width*0.037,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0}}
                            onChangeText={(firstnametext) => this.setState({firstnametext})}
                            value={this.state.firstnametext}>
                        </TextInput>
                    </View>
                   <View style={{flexDirection:'column',}}>
                        <MonoText   style={{paddingTop:6,paddingBottom:2, fontSize:16}}>Last Name</MonoText>
                        <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
                                           fontSize:width*0.037,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0}}
                            onChangeText={(lastnametext) => this.setState({lastnametext})}
                            value={this.state.lastnametext}>
                        </TextInput>
                   </View>
                   <View style={{flexDirection:'column',}}>
                        <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>Username</MonoText>
                        <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
                                           fontSize:width*0.037,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0}}
                             keyboardType='numeric'
                             onChangeText={(usernametext) => this.setState({usernametext})}
                             value={this.state.usernametext}>
                       </TextInput>
                   </View>

                  <View style={{flexDirection:'column',}}>
                      <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>Password</MonoText>
                      <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
                                         fontSize:width*0.037,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0}}
                           onChangeText={(passwordtext) => this.setState({passwordtext})}
                           value={this.state.passwordtext}>
                      </TextInput>
                 </View>
                 <View style={{flexDirection:'column',}}>
                     <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>Phone Number</MonoText>
                     <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
                                        fontSize:width*0.037,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0}}
                          keyboardType='numeric'
                          onChangeText={(mobilenumber) => this.setState({mobilenumber})}
                          value={this.state.mobilenumber}>
                     </TextInput>
                </View>

                  <View style={{flexDirection:'column',}}>
                       <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>GSTIN</MonoText>
                       <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
                                          fontSize:width*0.037,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0}}
                            onChangeText={(gstintext) => this.setState({gstintext})}
                            value={this.state.gstintext}>
                        </TextInput>
                  </View>

                  <View style={{flexDirection:'column',}}>
                    <TouchableOpacity
                        style={{backgroundColor:themeColor,marginTop:10}}
                        onPress={()=>{this.save();}}>
                        <MonoText   style={{fontSize:width*0.045,color:'#ffffff',textAlign:'center',
                                      paddingHorizontal:width*0.15,paddingVertical:width*0.015}}>Sign up</MonoText>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection:'row',marginTop:20,alignItems:'center'}}>
                    <View style={{flexDirection:'row',alignSelf:'center',paddingHorizontal:width*0.12}}>
                        <View style={{borderWidth:0.2,width:width*0.3,height:0.2,marginTop:8,borderColor:'#909090'}}></View>
                        <MonoText   style={{fontSize:16,color:'#000',paddingHorizontal:6}}>Or</MonoText>
                        <View style={{borderWidth:0.2,width:width*0.3,height:0.2,marginTop:8,borderColor:'#909090'}}></View>
                    </View>
                  </View>

                  <View style={{flexDirection:'column',}}>
                    <View
                        style={{backgroundColor:'#ffffff',marginTop:10,flexDirection:'row',activeOpacity:0}}>
                        <MonoText   style={{fontSize:16,color:'#000',textAlign:'left',
                                      paddingLeft:width*0.15,paddingVertical:width*0.015}}>Already have an account? </MonoText>
                        <TouchableOpacity onPress={()=>{this.props.navigation.navigate('LogInScreen')}}>
                        <MonoText   style={{fontSize:16,color:themeColor,textAlign:'center',fontWeight:'bold',
                                      paddingVertical:width*0.015}}>Sign In</MonoText>
                        </TouchableOpacity>
                        <MonoText   style={{fontSize:16,color:'#000',textAlign:'right',
                                      paddingRight:width*0.15,paddingVertical:width*0.015}}> now</MonoText>
                    </View>
                  </View>

               </View>
             </ScrollView>

              <Modal
                    isVisible={this.state.photoshoot}
                    hasBackdrop={true}
                    backdropColor={'#ddd9cc'}
                    style={[styles.modalView1,{position:'absolute',bottom:-20,left:0,}]}
                    onBackdropPress={()=>{this.setState({photoshoot:false});}} >
                    <View style={{paddingVertical:width*0.01,}}>
                        <View style={{flexDirection:'row',height:width*0.25,justifyContent:'space-between',
                                      borderWidth:0,backgroundColor:'transparent',borderRadius:0,paddingTop:width*0.05}}>
                              <TouchableOpacity
                                      style={{alignItems:'center',justifyContent:'center',backgroundColor:'#fff',paddingHorizontal:4,
                                              paddingVertical:6,borderWidth:0,borderRadius:0}}
                                      onPress={()=>{this.modalAttach('gallery')}}>
                                      <FontAwesome
                                          name="folder"
                                          size={width*0.16}
                                          style={{marginRight:5,color:themeColor,
                                                  textAlign: 'center',marginLeft:width*0.1}} />
                                          <MonoText   style={{fontSize:16,color:themeColor,textAlign:'center',
                                                        marginLeft:width*0.1}}>Gallary</MonoText>
                              </TouchableOpacity>
                              <TouchableOpacity
                                      style={{flexDirection: 'column',alignItems: 'center',
                                              justifyContent: 'center',backgroundColor:'#fff',
                                              paddingHorizontal:4,paddingVertical:6,borderWidth:0,borderRadius:0,}}
                                      onPress={()=>{this.modalAttach('camera')}}>
                                      <FontAwesome
                                          name="camera"
                                          size={width*0.14}
                                          style={{marginRight:5,color:themeColor,textAlign: 'center',
                                                  marginRight:width*0.1}}
                                          />
                                      <MonoText   style={{fontSize:16,color:themeColor,textAlign:'center',
                                                    marginRight:width*0.1}}>camera</MonoText>
                              </TouchableOpacity>
                        </View>
                   </View>
            </Modal>
            <Modal
                  isVisible={this.state.photoshoot1}
                  hasBackdrop={true}
                  backdropColor={'#ddd9cc'}
                  style={[styles.modalView1,{position:'absolute',bottom:-20,left:0,}]}
                  onBackdropPress={()=>{this.setState({photoshoot1:false});}} >
                  <View style={{paddingVertical:width*0.01,}}>
                      <View style={{flexDirection:'row',height:width*0.25,justifyContent:'space-between',
                                    borderWidth:0,backgroundColor:'transparent',borderRadius:0,paddingTop:width*0.05}}>
                          <TouchableOpacity
                                style={{alignItems:'center',justifyContent:'center',backgroundColor:'#fff',paddingHorizontal:4,
                                        paddingVertical:6,borderWidth:0,borderRadius:0}}
                                onPress={()=>{this.modalAttach1('gallery')}}>
                                <FontAwesome
                                      name="folder" size={width*0.16}
                                      style={{marginRight:5,color:themeColor,
                                              textAlign: 'center',marginLeft:width*0.1}} />
                                <MonoText   style={{fontSize:16,color:themeColor,textAlign:'center',
                                              marginLeft:width*0.1}}>Gallary</MonoText>
                          </TouchableOpacity>
                          <TouchableOpacity
                                style={{flexDirection: 'column',alignItems: 'center',
                                        justifyContent: 'center',backgroundColor:'#fff',
                                        paddingHorizontal:4,paddingVertical:6,borderWidth:0,borderRadius:0,}}
                                onPress={()=>{this.modalAttach1('camera')}}>
                                <FontAwesome
                                      name="camera"
                                      size={width*0.14}
                                      style={{marginRight:5,color:themeColor,textAlign: 'center',
                                              marginRight:width*0.1}}
                                      />
                                <MonoText   style={{fontSize:16,color:themeColor,textAlign:'center',
                                              marginRight:width*0.1}}>camera</MonoText>
                          </TouchableOpacity>
                      </View>
                </View>
         </Modal>
      </View>
    );
  }
}

const styles=StyleSheet.create({
    container: {
        flex:1,
        flexDirection:'column',
        margin:0,
        backgroundColor: 'transparent',
        padding:0,
  },

  root: {
        flex: 1,
        paddingTop: 0,
        backgroundColor:'#eee',
        flexDirection: 'column',
        justifyContent: 'flex-start',
  },
  AutoSuggest: {
       width: 300,
       paddingLeft: 10,
       fontSize: 12,
       backgroundColor: 'lightgrey',
       height: 40,
   },
   modalView1:{
     backgroundColor: '#fff',
     marginHorizontal: 0 ,
     borderTopLeftRadius:5,
     borderTopRightRadius:5,
     justifyContent: 'flex-end',
     width:width
   }
  });
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
      emptyCartFunction:()=>dispatch(actions.emptyCart()),


    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(Registration)
