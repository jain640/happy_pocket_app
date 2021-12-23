import * as React from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity, Platform, Image,AsyncStorage,Alert,ScrollView ,Clipboard,ToastAndroid,Dimensions,FlatList,BackHandler,TextInput,KeyboardAvoidingView,Keyboard} from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { Icon } from "react-native-elements";
import { withNavigation,NavigationActions } from 'react-navigation';
import { Card } from 'react-native-elements';
import { Octicons ,MaterialCommunityIcons,MaterialIcons,SimpleLineIcons} from '@expo/vector-icons';
import { SearchBar } from 'react-native-elements';
import settings  from '../constants/Settings.js';
import FloatingInput from '../components/FloatingInput';
import * as Google from 'expo-google-app-auth';
import * as Facebook from 'expo-facebook';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { MonoText } from '../components/StyledText';
import Toast, {DURATION} from 'react-native-easy-toast';

import NetInfo from '@react-native-community/netinfo';

const SERVER_URL = settings.url;

const deviceId = Constants.deviceId ;
const { width } = Dimensions.get('window');





class OTPLoginScreen extends React.Component {

  static navigationOptions =  {
        header:null
    }


    constructor(props) {
      super(props);

      this.state = {
        email:'',
        password:'',
        scrollHeight:Dimensions.get('window').height-100,
        keyboardOpen : false,
        keyboardHeight:0,
        disableSignUp:false,
        error:false,
        store: this.props.store,
        cartItems : this.props.cart,
        keyboardOffset:0
      };
      Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide
     )
     Keyboard.addListener(
        'keyboardDidShow', this.keyboardDidShow
    )
    }

    handleBackButtonClick=()=> {
      this.props.navigation.navigate('Home');
      return true;
    };





    componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused) {
      this.setState({disableSignUp:false,error:false,email:'',password:'',});
    }
  }




  keyboardDidShow=(event)=> {
        this.setState({
            keyboardOffset: event.endCoordinates.height+27,
            keyboardOpen:true
        })
    }

    keyboardDidHide=()=> {
        this.setState({
            keyboardOffset: 27,
            keyboardOpen:false
        })
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

        return this.signupOrSignin(data)

      } else {
        return { cancelled: true };
      }
}

    signupOrSignin = (data)=>{
     fetch( SERVER_URL+'/mobilelogin/', {
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

    requestPost=(item,sessionid,csrf)=>{
      var data = {
        product:item.product,
        productVariant:item.productVariant,
        store:item.store,
        qty:item.count,
       }
      return new Promise(resolve => {
       fetch(SERVER_URL + '/api/POS/cart/',{
         method: 'POST',
         headers:{
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Accept': 'application/json',
           'Content-Type': 'application/json',
           'Referer': SERVER_URL,
           'X-CSRFToken': csrf
         },
         body: JSON.stringify(data)
       })
       .then((response) => response.json())
       .then((responseJson) => {
          resolve(responseJson);
        })
       .catch((error) => {
         return
       });
     })
    }

    getInitial=async(pk,csrf)=>{
      var sessionid =  await AsyncStorage.getItem('sessionid');
      if(sessionid!=null){
      fetch(SERVER_URL + '/api/POS/cart/?user='+pk+'&store='+this.state.store.pk)
        .then((response) => response.json())
        .then((responseJson) => {
          var count = 0
          var arr = responseJson.map((item)=>{
            if(item.productVariant.images.length>0){
              var image = item.productVariant.images[0].attachment
            }else{
              var image = null
            }
              count += item.qty
              var obj = {product:item.product.pk,productVariant:item.productVariant.pk,store:item.store,count:item.qty,type:'GET_CART',customizable:item.productVariant.customizable,sellingPrice:item.productVariant.sellingPrice,mrp:item.productVariant.price,stock:item.productVariant.stock,discount:item.productVariant.price-item.productVariant.sellingPrice,maxQtyOrder:item.productVariant.maxQtyOrder,minQtyOrder:item.productVariant.minQtyOrder,dp:image,displayName:item.productVariant.displayName,user:pk,cart:item.pk}
              return obj
          })

          var promises = [];
          var cartItems = this.state.cartItems

          if(cartItems.length>0){
            cartItems.forEach((item,index)=>{
              item.check = false
              arr.forEach((i,idx)=>{
                if(i.product == item.product&&i.productVariant == item.productVariant&&i.store == item.store){
                  item.check = true
                  promises.push(this.requestPatch(i,item.count+i.count,sessionid,csrf));
               }
             })
             if(!item.check){
               promises.push(this.requestPost(item,sessionid,csrf));
             }
          })
        }
          Promise.all(promises).then(() => {
            AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
              this.setState({loader:false})
              return this.props.navigation.navigate('HomeScreen', {
                screen: 'ProfileScreen',
              })
            });
          })

        })
        .catch((error) => {
          return
        });
      }

    }

    showNoInternet=()=>{
      if(this.refs.toast!=undefined){
        this.refs.toast.show('No Internet Connection')
      }
    }

   logIn=async()=>{
     if(!this.state.connectionStatus){
       this.showNoInternet()
       return
     }
     this.setState({disableSignUp:true});
     var data = new FormData();
     data.append("username", this.state.email);
     data.append("password", this.state.password);
     fetch(SERVER_URL + '/login/?mode=api', {
       method: 'POST',
       body: data,
       headers: {
       }
     })
     .then((response)=>{
       if(response.status == 200){
         this.setState({error:false,disableSignUp:false});
         var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
         this.setState({ sessionid: sessionid })
         AsyncStorage.setItem("sessionid", sessionid)
         return response.json()
       }
       else{
         this.setState({error:true,disableSignUp:false});
         return
       }
     }).then((responseJson)=>{
       if (responseJson!=undefined) {
         var userPkk = responseJson.pk
         AsyncStorage.setItem("userpk", userPkk + '')
         AsyncStorage.setItem("csrf", responseJson.csrf_token)
         this.setState({disableSignUp:false,email:'',password:''})
         this.getInitial(responseJson.pk,responseJson.csrf_token)
         // AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
         //   return this.props.navigation.navigate('Home')
         // })
       }
       return
     }).then((err)=>{
       this.setState({disableSignUp:false,email:'',password:''})
     })
     this.setState({disableSignUp:false,})
   }

    componentDidMount(){
      this.setState({disableSignUp:false,error:false,email:'',password:''})
      this.setState({unsubscribe:NetInfo.addEventListener(state =>{
         this.handleConnectivityChange(state);
       })})
    }

    handleConnectivityChange=(state)=>{
      if(state.isConnected){
         this.setState({connectionStatus : true})
      }else{
        this.setState({connectionStatus : false})
        this.showNoInternet()
      }
    }

    onChangeText=(text)=>{
      this.setState({email:text,error:false})
    }

    getOtp() {
    if(this.state.mobileNo == undefined){
      this.refs.toast.show('Mobile no was incorrect ');
    }
    else{
      var data = new FormData();
      data.append( "mobile", this.state.mobileNo );
      fetch( SERVER_URL + '/api/homepage/registration/', {
        method: 'POST',
        body: data
      }).then((response)=>{
        if(response.status == 200 || response.status==201 ){
          var d = response.json()
          return d
        }else{
          this.refs.toast.show('Mobile No Already register with user ');
        }
      })
      .then((responseJson) => {
         this.setState({ userPk: responseJson.pk,token:responseJson.token,mobile:responseJson.mobile,username:this.state.mobileNo });
         AsyncStorage.setItem("userpk", responseJson.pk + '')
         this.props.navigation.navigate('OtpScreen',{
           username:this.state.mobileNo,
           screen:'',
           userPk:responseJson.pk,
           token:responseJson.token,
           mobile:responseJson.mobile,
           csrf:responseJson.csrf,
           mobileOTP:'',
         });
       })
      .catch((error) => {
        return
      });
    }
}



    sendOtp() {
    var mob = /^[1-9]{1}[0-9]{9}$/;
    if (this.state.mobileNo == undefined || mob.test(this.state.mobileNo) == false) {
      this.refs.toast.show('Enter Correct Mobile No');
    } else {
      this.refs.toast.show('OTP request sent.');
      var data = new FormData();
      data.append("id", this.state.mobileNo);
      fetch(SERVER_URL + '/generateOTP/', {
        method: 'POST',
        body: data
      })
        .then((response) => {
          if (response.status == 200) {
            this.setState({ username: this.state.mobileNo })
            return response.json()
          }
        })
        .then((responseJson) => {
          if (responseJson == undefined){
            this.getOtp()
          }else{
            this.setState({ OTP: responseJson })
            this.props.navigation.navigate('OtpScreen',{
              screen:'LogInScreen',
              username:this.state.mobileNo,
            });
            return
          }
        })
        .catch((error) => {
          this.refs.toast.show(error.toString());
          return
        });
    }
}



  render(){
    const themeColor = this.props.store.themeColor

    return(
      <View style={{flex:1,backgroundColor: '#f8fafb',}}>
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
          <View style={[styles.statusBar,{backgroundColor:themeColor}]} />
          {settings.storeType == 'MULTI-OUTLET' &&
            <View style={{}}>
               <Image source={require('../assets/images/happypockets.jpeg')} style={{ width:width,height:60,}}/>
            </View>
          }
          <ScrollView contentContainerStyle={{flex:1,backgroundColor:themeColor}}>
            <View style={{flex:1}}>
              <View style={{flex:0.6}}>
                <View style={{flex:0.5,alignItems:'center',justifyContent:'center'}}>
                  <MonoText   style={{color:'#fff',fontSize:30,fontWeight:'700'}}>HAPPY</MonoText>
                  <MonoText   style={{color:'#fff',fontSize:30,fontWeight:'700'}}>TO SEE YOU AGAIN!</MonoText>
                </View>
                <View style={{flex:0.5,justifyContent:'flex-end',alignItems:'center'}}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                      <MonoText   style={{ color: '#000', fontSize: 16, borderWidth: 1, borderTopLeftRadius: 7,
                        width: width * 0.15,     borderBottomLeftRadius: 7, borderColor: '#f2f2f2', height: 50,paddingVertical: 14, paddingHorizontal: 10, backgroundColor: '#f2f2f2' }}>+91</MonoText>
                      <TextInput style={{ borderWidth: 1,borderTopRightRadius: 7,borderBottomRightRadius: 7,
                        borderColor: '#fff', width: width * 0.7, height: 50, paddingHorizontal: 10,
                        backgroundColor: '#fff', color: '#000', fontSize: 16 }}
                        placeholder="Enter mobile no"
                        placeholderTextColor='black'
                        keyboardType={'numeric'}
                        onChangeText={query => {
                          this.setState({ mobileNo: query });
                          this.setState({ username: query })
                        }}
                        value={this.state.username} />
                    </View>
                    <View style={{}}>
                      <TouchableOpacity onPress={()=>{this.sendOtp();}} style={{justifyContent: 'center', alignItems: 'center',width: width * 0.85, textAlign: 'center',borderWidth: 1, borderRadius: 7, borderColor: themeColor, height: 50,marginVertical: 20,backgroundColor: 'rgba(0,0,0,.2)' }}>
                        <MonoText   style={{ color: '#fff', fontSize: 20, fontWeight: '700',
                        }}>Sign in with OTP</MonoText>
                     </TouchableOpacity>
                    </View>
                </View>
              </View>
              <View style={{flex:0.4,justifyContent:'flex-end',alignItems:'center'}}>
                 <MonoText   style={{color:'#fff',fontSize:18,fontWeight:'700'}}>A Secure App is Happiness In Itself.</MonoText>
                 <View style={{flexDirection:'row',height:60}}>
                   <View style={{flex:0.4,alignItems:'flex-end',justifyContent:'center'}}>
                      <Image source={require('../assets/images/protection.png')} style={{ width:60,height:60,resizeMode: 'contain'}}/>
                   </View>
                   <View style={{flex:0.6,alignItems:'flex-start',justifyContent:'center'}}>
                      <MonoText   style={{color:'#000',fontSize:13,fontWeight:'700',marginLeft:5,marginTop:-10}}>Secure Payment Gateway</MonoText>
                   </View>
                 </View>
              </View>
            </View>
          </ScrollView>

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

export default connect(mapStateToProps, mapDispatchToProps)(OTPLoginScreen);
