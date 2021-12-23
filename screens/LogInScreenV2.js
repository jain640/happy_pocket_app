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
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';

import NetInfo from '@react-native-community/netinfo';

const SERVER_URL = settings.url;

const deviceId = Constants.deviceId ;
const { width } = Dimensions.get('window');





class LogInScreenV2 extends React.Component {

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
      };
      Keyboard.addListener(
             'keyboardDidHide',
             this.showKeyboard
           )

           Keyboard.addListener(
             'keyboardDidShow', this.hideKeyboard
         )
    }

    handleBackButtonClick=()=> {
      this.props.navigation.navigate('Home');
      return true;
    };

    // componentWillUnmount() {
    // this.keyboardDidShowListener.remove();
    // this.keyboardDidHideListener.remove();
    // BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  // }
  //
  // componentWillMount() {
  //     BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  // }




    componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused) {
      this.setState({disableSignUp:false,error:false,email:'',password:'',});
    }
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
    cartUpdate =(item,count,sessionid,csrf)=>{
      var data = {
        qty:count,
       }
      return new Promise(resolve => {
       fetch(SERVER_URL + '/api/POS/cart/'+item.pk+'/',{
         method: 'PATCH',
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
         console.log(responseJson,'kkkkkkllllllll');
          resolve(responseJson);
        })
       .catch((error) => {
         return
       });
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
         console.log(responseJson,'kkkkkkllllllll');
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

          console.log(pk,sessionid,csrf,'three',SERVER_URL);
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



    getMyStore = ()=>{
      fetch(SERVER_URL + '/api/POS/getMyStore/')
       .then((response) => {return response.json()})
       .then((responseJson) => {
         console.log(responseJson,'my store data');
         //    if(responseJson.data.found){
         //      this.setMyStoreFunction(responseJson.data.store,responseJson.data.role)
         //    };
          })
       .catch((error) => {
         return
       });
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
         AsyncStorage.setItem("sessionid", sessionid);
         this.getMyStore();
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
         console.log(userPkk,responseJson.csrf_token,this.state.sessionid);
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
      console.log('LoginScreen');
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

// happypockets image banner
            // <Image source={require('../assets/images/Preview2.png')} style={{ width:'100%',height:'100%',resizeMode: 'contain'}}/>
// shubhbazar image banner
            // <Image source={require('../assets/images/cioc.png')} style={{ width:'100%',height:'100%',resizeMode: 'contain'}}/>

  render(){
    const themeColor = this.props.store.themeColor
    return(
      <View style={{flex:1,backgroundColor: '#f8fafb',marginBottom:this.state.keyboardOpen?this.state.keyboardHeight:0,}}>
      <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
      <View style={[styles.statusBar,{backgroundColor:themeColor}]} />
        {settings.storeType == 'MULTI-OUTLET' &&

          <View style={{flex:0.3,backgroundColor:'#f8fafb' }}>
          <View style={{flex:0.2}}>

          </View>
          <View style={{flex:0.8}}>
          <Image source={require('../assets/images/Preview2.png')} style={{ width:'100%',height:'100%',resizeMode: 'contain'}}/>
          </View>
          </View>
        }
        <View style={{flex:0.5,backgroundColor:'#f8fafb',marginHorizontal:width*0.1,justifyContent: 'center',marginTop:this.state.keyboardOpen?width*0.05:0}}>
        {!this.state.keyboardOpen&&
          <MonoText   style={{color:'#000',fontSize: 20,marginTop:width*0.05}}>Welcome Back :)</MonoText> }
          <MonoText   style={{color:'#000',fontSize: 16,marginTop:width*0.05}}>Get an amazing journey for your career</MonoText> 
          {this.state.error&&
            <MonoText   style={{color:'#ff0000',fontSize: 16,marginTop:width*0.01}}>Incorrect username or password.</MonoText> 
          }
          <TouchableOpacity onPress={()=>this.emailRef.focus()} activeOpacity={1.0} style={[styles.inputStyle,styles.shadow,{marginTop:width*0.05,borderBottomLeftRadius:0,borderBottomRightRadius:0,backgroundColor:'#f2f2f2'}]}>
            <View style={{flex:0.1,alignItems: 'center',justifyContent: 'center'}}>
              <Octicons name="mail" size={25} color='grey'  />
            </View>
            <View style={{flex:0.9,alignItems: 'flex-end',justifyContent: 'flex-end',marginLeft:15,height:'100%'}}>
              <FloatingInput
                label="Email"
                value={this.state.email}
                onChangeText={text => this.onChangeText(text)}
                outputRange = {'#a2a2a2'}
                passWord={false}
                email={true}
                onRef={(ref) =>{this.emailRef = ref}}
              />
            </View>

           </TouchableOpacity>
           <TouchableOpacity onPress={()=>this.passwordRef.focus()} activeOpacity={1.0} style={[styles.inputStyle,styles.shadow,{borderTopLeftRadius:0,borderTopRightRadius:0,backgroundColor:'#fff'}]}>
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
                 onRef={(ref) =>{this.passwordRef = ref}}
               />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{this.props.navigation.navigate('PasswordResetScreen')}} style={{marginTop:width*0.05,alignSelf: 'flex-start'}}><MonoText   style={{color:'#000',fontSize:14,}}>Forget Password?</MonoText> </TouchableOpacity>
          <View style={{flexDirection:'row',marginTop:width*0.05}}>
            <TouchableOpacity onPress={()=>{this.logIn()}} disabled={this.state.disableSignUp} style={[{flex:0.5,height:40,justifyContent: 'center',alignItems: 'center',marginRight:20,backgroundColor:themeColor,borderRadius:25,opacity:this.state.disableSignUp?0.5:1}]}>
              <MonoText   style={{color:'#fff',fontSize:16,}}>Login Now</MonoText> 
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{this.props.navigation.navigate('Registration')}} style={[{flex:0.5,height:40,justifyContent: 'center',alignItems: 'center',backgroundColor: '#fff',borderWidth: 1,borderRadius:25,borderColor:'#f2f2f2'}]}>
              <MonoText   style={{color:'#000',fontSize:16,}}>Create Account</MonoText> 
            </TouchableOpacity>
          </View>
        </View>
        {!this.state.keyboardOpen&&
          <View style={{flex:0.2,flexDirection: 'row',marginHorizontal:width*0.1,justifyContent: 'center'}}>
            <View style={{flex:0.5,flexDirection:'row',alignItems: 'center',marginTop:20}}>
              <MonoText   style={{color:'#000',fontSize:16,}}>Or you can join with</MonoText> 
            </View>
            <View style={{flex:0.5,flexDirection:'row',marginTop:20,alignItems: 'center',justifyContent: 'center'}}>
              <TouchableOpacity onPress={()=>{this.signInWithGoogleAsync()}} style={[{width:40,flexDirection: 'row',height:40,justifyContent: 'center',alignItems: 'center',marginRight:20,backgroundColor:'#FF3D00',borderRadius:20}]}>
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
    setMyStoreFunction:(myStore,storeRole)=>dispatch(actions.setMyStore(myStore,storeRole)),

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogInScreenV2);
