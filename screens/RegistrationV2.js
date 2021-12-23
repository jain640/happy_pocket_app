import * as React from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity, Platform, Image,AsyncStorage,Alert,ScrollView ,Clipboard,ToastAndroid,Dimensions,FlatList,BackHandler,TextInput,KeyboardAvoidingView,Keyboard,ActivityIndicator} from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { Icon } from "react-native-elements";
import { withNavigation } from 'react-navigation';
import { Card } from 'react-native-elements';
import {FontAwesome, Octicons ,MaterialCommunityIcons,MaterialIcons,SimpleLineIcons} from '@expo/vector-icons';
import { SearchBar } from 'react-native-elements';
import settings  from '../constants/Settings.js';
import FloatingInput from '../components/FloatingInput';
import * as Google from 'expo-google-app-auth';
import * as Facebook from 'expo-facebook';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';

import NetInfo from '@react-native-community/netinfo';

const mainUrl = settings.url;

const deviceId = Constants.deviceId ;
const { width } = Dimensions.get('window');





class RegistrationV2 extends React.Component {

  static navigationOptions =  {
        header:null
    }


    constructor(props) {
      super(props);

      this.state = {
        email:'',
        password:'',
        mobile:'',
        countryCode:'+91',
        name:'',
        scrollHeight:Dimensions.get('window').height-100,
        keyboardOpen : false,
        keyboardHeight:0,
        otp:false,
        otpNo:'',
        csrf:'',
        disableSignUp:false,
        errMsg:null,
        token:null,
        reg:null,
        showProcess:false,
        store: this.props.store,
      };
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

          this.setState({scrollHeight:this.state.scrollHeight+500})

      }
      hideKeyboard =(e)=>{
          this.setState({keyboardOpen : true})
          this.setState({
              keyboardHeight:
                   e.endCoordinates.height
          });

          try {
            this.setState({scrollHeight:this.state.scrollHeight-500})
          } catch (e) {

          } finally {

          }
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

    componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused) {
      this.setState({email:'',
      password:'',
      mobile:'',
      countryCode:'+91',
      name:'',
      otp:false,
      otpNo:'',
      csrf:'',
      disableSignUp:false,
      errMsg:null});
      }
    }

    componentDidMount=()=>{
      // this.setState({showProcess:true})
      this.setState({unsubscribe:NetInfo.addEventListener(state =>{
         this.handleConnectivityChange(state);
       })})
    }
    handleConnectivityChange=(state)=>{
      console.log('RegisterScreen');
      if(state.isConnected){
         this.setState({connectionStatus : true})
      }else{
        this.setState({connectionStatus : false})
        this.showNoInternet()
      }
    }

    logInfacebook = async () => {
      if(!this.state.connectionStatus){
        this.showNoInternet()
        return
      }
    const {
      type,
      token,
    } = await Facebook.logInWithReadPermissionsAsync('816503058819961', {
      permissions: ['public_profile', 'email', 'user_friends'],
    });

    if (type === 'success') {
      // Get the user's name using Facebook's Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?fields=email,name,first_name,last_name,friends&access_token=${token}`
      );
      var result = await response.json()
      var name = result.name
      var email = result.email
      var fname = result.first_name
      var lname = result.last_name

      var data = new FormData();
      data.append("name", email);
      data.append("email", email);
      data.append("fname", fname);
      data.append("lname", lname);
      data.append("secretKey", 'Titan@1');
      console.log(data, 'kkkkkkkkkk');
      return this.signupOrSignin(data)
    }
  }

    signInWithGoogleAsync = async () => {
      if(!this.state.connectionStatus){
        this.showNoInternet()
        return
      }

    const result = await Google.logInAsync({
      androidStandaloneAppClientId: '191589449736-vef81j4r4l40sbjmh9o4fntk7r6bmr7n.apps.googleusercontent.com',
      iosStandaloneAppClientId: '191589449736-f7udnoiffm7h6j352j1mto3eu91ukoe3.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
    });

      if (result.type === 'success') {
        console.log(result.user, 'gooleee', result.user.email);

        var name = result.user.name
        var email = result.user.email
        var fname = result.user.name
        var lname = result.user.name

        var data = new FormData();
        data.append("name", name);
        data.append("email", email);
        data.append("fname", fname);
        data.append("lname", lname);
        data.append("secretKey", 'Titan@1');
        console.log(data, 'kkkkkkkkkk');

        return this.signupOrSignin(data)

      } else {
        return { cancelled: true };
      }
}

    signupOrSignin = (data)=>{
     fetch( mainUrl+'/mobilelogin/', {
       method: 'POST',
       body: data,
     }).then((response) => {
       if (response.status == 200) {
         var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
         this.setState({ sessionid: sessionid })
         AsyncStorage.setItem("sessionid", sessionid)
         return response.json()
       }else if (response.status == 401) {
         this.refs.toast.show('Login was not sucessfull..');
         // ToastAndroid.show('Login was not sucessfull..', ToastAndroid.SHORT);
         return
       }
     }).then((responseJson) => {
       if (responseJson.pk) {
         var userPkk = responseJson.pk
         AsyncStorage.setItem("userpk", userPkk + '')
         AsyncStorage.setItem("csrf", responseJson.csrf_token)
         AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
           return this.props.navigation.navigate('Courses')
         })
       }
     })
    }

    showNoInternet=()=>{
      if(this.refs.toast!=undefined){
        this.refs.toast.show('No Internet Connection')
      }
    }

    getSignIn=()=>{
      if(!this.state.connectionStatus){
        this.showNoInternet()
        return
      }
      if(this.state.email.length< 3){
        return
      }
      this.setState({showProcess:true})
      this.setState({disableSignUp:true,})

      if(!this.state.otp){
        fetch(mainUrl+'/api/homepage/registration/',{
            method:"POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: this.state.email,
              mobile: this.state.mobile,
            }),
          })
        .then((response)=>{
          if(response.status == 201){
            console.log(response,'xxxxxxxxx');
            this.setState({showProcess:false,otp:true,});
          }
          this.setState({disableSignUp:false});
          console.log(response,'yyyyyyyyyyy');
          return response.json()
        }).then((json)=>{
          AsyncStorage.setItem("csrf", json.csrf)
          this.setState({token:json.token,csrf:json.csrf,reg:json.pk})
          return
        }).then((err)=>{
          this.setState({disableSignUp:false,showProcess:false})
        })
      }else{
        fetch(mainUrl+'/api/homepage/registration/'+this.state.reg+'/',{
          method:"PATCH",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: this.state.password,
            email: this.state.email,
            mobile: this.state.mobile,
            firstName: this.state.name,
            mobileOTP: this.state.otpNo,
            is_staff:false,
            agree:false,
            pk:this.state.reg,
            reg:this.state.reg,
            token:this.state.token,
          })
        })
        .then((response)=>{
          console.log(response,'jjjjjjjjjjj');
           // this.setState({disableSignUp:false});
          return response.json()
          if(response.status == 200){
            this.setState({showProcess:false,disableSignUp:false});
            try{
              var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
              this.setState({ sessionid: sessionid })
              AsyncStorage.setItem("sessionid", sessionid)
              return response.json()
            }
            catch (e) {
              return response.json()
            }
          } else{
            this.setState({showProcess:false,disableSignUp:false});
            return
          }
        }).then((responseJson)=>{
          console.log(responseJson,'wwwwwwwwww');
          if (responseJson!=undefined) {
              var userPkk = responseJson.pk
              AsyncStorage.setItem("userpk", userPkk + '')
              AsyncStorage.setItem("csrf", responseJson.csrf)
              console.log(userPkk,responseJson.csrf_token,this.state.sessionid);
              this.setState({showProcess:false,disableSignUp:false,otp:false});
              AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
                return this.props.navigation.navigate('Home')
              })
          }else{
            this.setState({errMsg: "Invalid OTP , please check both the OTP's and verify again"})
            this.setState({disableSignUp:false,showProcess:false,disableSignUp:false})
          }
          return
        }).then((err)=>{
          this.setState({disableSignUp:false,showProcess:false,})
        })
      }
      this.setState({disableSignUp:false,otp:false})
    }

    onChangeText=(text)=>{
      this.setState({email:text})
    }



  render(){
    const themeColor = this.props.store.themeColor
    var showProcess = this.state.showProcess
    console.log(showProcess , 'jkllllllllll');
    if(showProcess){
      return(
      <View style={{flex:1}}>
        <View style={[styles.statusBar,{backgroundColor: themeColor,}]} />
        <View style={{flex:1,justifyContent:'center',alignItems: 'center'}}>
          <ActivityIndicator size="large" color={themeColor} />
        </View>
      </View>
    )
    }else{
    return(
      <View style={{flex:1,backgroundColor: '#f8fafb',marginBottom:this.state.keyboardOpen?this.state.keyboardHeight:0}}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <View style={[styles.statusBar,{backgroundColor: themeColor,}]} />

        <View style={{flex:0.3,backgroundColor:'#f8fafb' }}>
          <View style={{flex:0.2}}>

          </View>
          <View style={{flex:0.8}}>
            <Image source={require('../assets/images/preview1.png')} style={{ width:'100%',height:'100%',resizeMode: 'contain'}}/>
          </View>
        </View>

        <View style={{flex:this.state.otp?0.55:0.6,backgroundColor:'#f8fafb',marginHorizontal:width*0.1,justifyContent: 'flex-start',marginTop:!this.state.otp?0:width*0.1}}>
        {!this.state.keyboardOpen&&
          <MonoText   style={{color:'#000',fontSize: 20,marginTop:width*0.05}}>Welcome to Family</MonoText> }
          <MonoText   style={{color:'#000',fontSize: 16,marginTop:width*0.05}}>A workspace for  Automation experts and leaders.</MonoText>
          {this.state.errMsg != null&&
            <MonoText   style={{color:'#ff0000',fontSize: 16,marginTop:width*0.01}}>{this.state.errMsg}</MonoText>
          }
          {!this.state.otp&&
            <View style={{}}>
          <TouchableOpacity onPress={()=>this.emailRef.focus()} activeOpacity={1.0} style={[styles.inputStyle,styles.shadow,{marginTop:width*0.05,borderBottomLeftRadius:0,borderBottomRightRadius:0,backgroundColor:'#f2f2f2'}]}>
            <View style={{flex:0.1,alignItems: 'center',justifyContent: 'center'}}>
              <Octicons name="mail" size={25} color='grey'  />
            </View>
            <View style={{flex:0.9,alignItems: 'center',justifyContent: 'center',marginLeft:15,height:'100%'}}>
              <FloatingInput
                label="Email"
                value={this.state.email}
                onChangeText={text => this.onChangeText(text)}
                outputRange = {'#a2a2a2'}
                passWord={false}
                email={true}
                type={true}
                onRef={(ref) =>{this.emailRef = ref}}
              />
            </View>
           </TouchableOpacity>

           <TouchableOpacity onPress={()=>this.passwordRef.focus()} activeOpacity={1.0} style={[styles.inputStyle,styles.shadow,{borderRadius: 0,backgroundColor:'#fff'}]}>
             <View style={{flex:0.1,alignItems: 'center',justifyContent: 'center'}}>
              <SimpleLineIcons name="lock" size={25} color='grey'  />
             </View>
             <View style={{flex:0.9,alignItems: 'center',justifyContent: 'center',marginLeft:15,height:'100%'}}>
               <FloatingInput
                 label="Password"
                 value={this.state.password}
                 onChangeText={text => this.setState({password:text})}
                 outputRange = {'#a2a2a2'}
                 passWord={true}
                 email={false}
                 type={true}
                 onRef={(ref) =>{this.passwordRef = ref}}
               />
            </View>
          </TouchableOpacity>

           <TouchableOpacity onPress={()=>this.mobileRef.focus()} activeOpacity={1.0} style={[styles.inputStyle,styles.shadow,{borderRadius: 0,borderTopWidth: 1,borderTopColor: '#f2f2f2',backgroundColor:'#fff'}]}>
             <View style={{flex:0.1,alignItems: 'center',justifyContent: 'center'}}>
              <FontAwesome name="mobile" size={30} color='grey'  />
             </View>
             <View style={{flex:0.9,alignItems: 'center',justifyContent: 'center',marginLeft:15,height:'100%'}}>
               <FloatingInput
                 label="Mobile"
                 value={this.state.mobile}
                 onChangeText={text => this.setState({mobile:text})}
                 outputRange = {'#a2a2a2'}
                 passWord={false}
                 email={false}
                 type={false}
                 onRef={(ref) =>{this.mobileRef = ref}}
               />
            </View>
           </TouchableOpacity>

           <TouchableOpacity onPress={()=>this.nameRef.focus()} activeOpacity={1.0} style={[styles.inputStyle,styles.shadow,{borderTopLeftRadius:0,borderTopRightRadius:0,backgroundColor:'#f2f2f2'}]}>
             <View style={{flex:0.1,alignItems: 'center',justifyContent: 'center'}}>
              <FontAwesome name="user-o" size={25} color='grey'  />
             </View>
             <View style={{flex:0.9,alignItems: 'center',justifyContent: 'center',marginLeft:15,height:'100%'}}>
               <FloatingInput
                 label="Name"
                 value={this.state.name}
                 onChangeText={text => this.setState({name:text})}
                 outputRange = {'#a2a2a2'}
                 passWord={false}
                 email={false}
                 type={true}
                 onRef={(ref) =>{this.nameRef = ref}}
               />
            </View>
          </TouchableOpacity>
           </View>
        }
        {this.state.otp&&
          <View style={{marginTop:width*0.05}}>
          <TouchableOpacity onPress={()=>this.otpRef.focus()} activeOpacity={1.0} style={[styles.inputStyle,styles.shadow,{backgroundColor:'#fff'}]}>
            <View style={{flex:0.1,alignItems: 'center',justifyContent: 'center'}}>
             <SimpleLineIcons name="lock" size={25} color='grey'  />
            </View>
            <View style={{flex:0.9,alignItems: 'center',justifyContent: 'center',marginLeft:15,height:'100%'}}>
              <FloatingInput
                label="OTP"
                value={this.state.otpNo}
                onChangeText={text => this.setState({otpNo:text})}
                outputRange = {'#a2a2a2'}
                passWord={false}
                email={false}
                type={false}
                onRef={(ref) =>{this.otpRef = ref}}
              />
           </View>
         </TouchableOpacity>
         <MonoText   style={{color:'#000',fontSize:14,marginTop:width*0.05}}>We have sent an Email with OTP</MonoText>
         </View>
        }

          <View style={{flexDirection:'row',marginTop:width*0.05}}>
            <TouchableOpacity disabled={this.state.disableSignUp} onPress={()=>{this.getSignIn()}} style={[{flex:0.5,height:40,justifyContent: 'center',alignItems: 'center',marginRight:20,backgroundColor:themeColor,borderRadius:25,opacity:this.state.disableSignUp?0.3:1}]}>
              <MonoText   style={{color:'#fff',fontSize:16,}}>Sign Up {this.state.otp?'':'Now'}</MonoText>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={[{flex:0.5,height:40,justifyContent: 'center',alignItems: 'center',backgroundColor: '#fff',borderWidth: 1,borderRadius:25,borderColor:'#f2f2f2'}]}>
              <MonoText   style={{color:'#000',fontSize:16,}}>Get Login</MonoText>
            </TouchableOpacity>
          </View>
        </View>
        {!this.state.keyboardOpen&&
        <View style={{flex:this.state.otp?0.15:0.1,flexDirection: 'row',marginHorizontal:width*0.1,justifyContent: 'flex-end'}}>
          <View style={{flex:0.5,flexDirection:'row',alignItems: 'center',marginBottom:5,marginVertical:10}}>
            <MonoText   style={{color:'#000',fontSize:16,}}>Or you can join with</MonoText>
          </View>
          <View style={{flex:0.5,flexDirection:'row',marginBottom:5,marginVertical:10,alignItems: 'center',justifyContent: 'center'}}>
            <TouchableOpacity onPress={()=>{this.signInWithGoogleAsync()}} style={[{flexDirection: 'row',height:40,width:40,justifyContent: 'center',alignItems: 'center',marginRight:20,backgroundColor:'#FF3D00',borderRadius:20}]}>
              <Image source={require('../assets/images/goolog.png')} style={{height:30,width:25 }}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{this.logInfacebook()}} style={[{width:40,flexDirection: 'row',height:40,justifyContent: 'center',alignItems: 'center',backgroundColor: '#3B5998',borderRadius:20,}]}>
              <Image source={require('../assets/images/faclog.png')} style={{height:30,width:25 }}/>
            </TouchableOpacity>
          </View>
        </View>
      }
      </View>
     )
   }
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
    elevation: 3,
  },
  shadowTop: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0, height: -10
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowRight: {
    shadowColor: "#000",
    shadowOffset: {
     width: 10, height: 0
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowLeft: {
    shadowColor: "#000",
    shadowOffset: {
     width: -10, height: 10
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusBar: {
   height: Constants.statusBarHeight,
 },
 inputStyle:{
   height: 50,
   width:'100%',
   borderRadius:5,
   paddingHorizontal: 15,
   paddingVertical: 5,
   fontSize: 16,
   flexDirection: 'row',
 },
 login:{
   height: 40,
   backgroundColor:'#032757',
   width:'100%',
   borderRadius:5,
   borderTopLeftRadius:20,
   paddingHorizontal: 15,
   paddingVertical: 5,
   fontSize: 16,
   alignItems: 'center',
   justifyContent: 'center'
 },
 btn:{
   borderRadius:10,
   height: 40,
   alignItems: 'center',
   justifyContent: 'center',
   width:'100%',
   flexDirection: 'row',
   paddingHorizontal: 15,
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
    emptyCartFunction:()=>dispatch(actions.emptyCart()),


  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationV2);
