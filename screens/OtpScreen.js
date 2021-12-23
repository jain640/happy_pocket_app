import React from 'react';
import SmsRetriever from 'react-native-sms-retriever';
//import RNOtpVerify from 'react-native-otp-verify';
import {

  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Slider,
  Dimensions,
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,Button,ToastAndroid,ActivityIndicator,PermissionsAndroid,Clipboard,Image
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
const { width } = Dimensions.get('window');
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import OTPInputView from 'react-native-otp-input';
import { Ionicons } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import CountDown from 'react-native-countdown-component';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import Loader from '../components/Loader';
const storeType = settings.storeType


class OtpScreen extends React.Component {


static navigationOptions =  {
  header:null
}


  constructor(props){
    super(props);
    this.state = {
      username:'',
      otp:'',
      needOTP:true,
      text:'',
      screen:'',
      mobileNo:'',
      checked:true,
      store:this.props.store,
      selectedStore:this.props.selectedStore,
      csrf:null,
      cartItems:this.props.cart,
      sessionid:null,
      loadingVisible:false,

    };
    this.SMSReadSubscription = {};
  }


_onSmsListenerPressed = async () => {
  try {
    const registered = await SmsRetriever.startSmsRetriever();
    if (registered) {
      SmsRetriever.addSmsListener(event => {
        console.log(event.message);
        SmsRetriever.removeSmsListener();
      }); 
    }
  } catch (error) {
    console.log(JSON.stringify(error));
  }
};

  componentDidMount(){
    
    this._onSmsListenerPressed();  
    
    var screen = this.props.navigation.getParam('screen',null)
    var username = this.props.navigation.getParam('username',null)
    var userPk = this.props.navigation.getParam('userPk',null)
    var token = this.props.navigation.getParam('token',null)
    var mobile = this.props.navigation.getParam('mobile',null)
    var csrf = this.props.navigation.getParam('csrf',null)
    console.log(this.state.cartItems,'ghjjjjjjjjj');


    if(screen == 'LogInScreen'){
      this.setState({text:'Login to Happypockets',screen:'login',username:username})
    }else{
      this.setState({text:'Register to Happypockets',screen:'register',username:username,mobileNo:username})
      this.setState({userPk: userPk,token:token,mobile:mobile,mobileNo:username,csrf:csrf})
    }
  }

  copyCodeFromClipBoardOnAndroid=()=>{
    if (Platform.OS === "android") {
            this.checkPinCodeFromClipBoard()
            this._timer = setInterval(() => {
                this.checkPinCodeFromClipBoard()
            }, 400)
}
  }

  checkPinCodeFromClipBoard=()=>{

    Clipboard.getString().then(code => {
             if ( this.state.clipboard !== code) {
                 this.setState({clipboard:code})
             }
          })
  }
  resend(){
   this.refs.toast.show('request sent!');
   if(this.state.screen == 'login'){
     var data = new FormData();
     data.append("id", this.state.username);
     fetch(SERVER_URL + '/generateOTP/', {
       method: 'POST',
       body: data
     })
       .then((response) => {

         if (response.status == 200) {
           this.setState({ username: this.state.username })
           this.setState({ needOTP: true })
           return response.json()
         }

       })

       .then((responseJson) => {
         if (responseJson == undefined){
           this.refs.toast.show('No user found , Please register');
         }else{
           return
         }
       })
       .catch((error) => {
         this.refs.toast.show(error.toString());
         return
       });
   }else{
     var data = new FormData();
     data.append( "mobile", this.state.mobileNo );
     fetch( SERVER_URL + '/api/homepage/registration/', {
       method: 'POST',
       body: data
     })
     .then((response) =>{
       if(response.status == 200 || response.status==201 ){
         var d = response.json()
         this.setState({ needOTP: true })
         return d
       }else{
         this.refs.toast.show('Mobile No Already register with user ');
       }
     })
     .then((responseJson) => {
        this.setState({ userPk: responseJson.pk,token:responseJson.token,mobile:responseJson.mobile,username:this.state.mobileNo })
         })
     .catch((error) => {
       return

     });
   }

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
       resolve();
     });
   })
  }

  requestPatch =(item,count,sessionid,csrf)=>{
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
        resolve(responseJson);
      })
     .catch((error) => {
       resolve();
     });
   })
  }

  getInitial=async(pk,csrf)=>{
    console.log('jjjjjjjjjjjjj');
    var sessionid =  await AsyncStorage.getItem('sessionid');
    console.log(SERVER_URL,this.state.selectedStore,sessionid,csrf,pk);
    if(sessionid!=null){
    fetch(SERVER_URL + '/api/POS/cart/?user='+pk+'&store='+this.state.selectedStore.pk)
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

        console.log(cartItems,'lllllllllll');

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
      this.setState({loader:false})
        Promise.all(promises).then(() => {
          AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
            return this.props.navigation.navigate('HomeScreen', {
              screen: 'ProfileScreen',
            })
          });
        })

      })
      .catch((error) => {
        this.setState({loader:false})
        AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
          return this.props.navigation.navigate('HomeScreen', {
            screen: 'ProfileScreen',
          })
        });
      });
    }

  }


  getMyStore = async ()=>{
    fetch(SERVER_URL + '/api/POS/getMyStore/',{
      headers: {
        "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': this.state.csrf
      }
    })
     .then((response) => {return response.json()})
     .then((responseJson) => {
          if(responseJson.found){
            this.props.setMyStoreFunction(responseJson.store,responseJson.role)
          }else{
            this.props.removeMyStoreFunction()
          }
        })
     .catch((error) => {
       return
     });
  }

  verify() {
    if(this.state.otp.length < 4){
      this.setState({otp:this.state.clipboard})
    }
    this.setState({loadingVisible:true})
     if(this.state.screen == 'login'){
      var data = new FormData();
      data.append("username", this.state.username);
      data.append("otp", this.state.otp);
      fetch(SERVER_URL + '/login/?otpMode=True&mode=api', {
        method: 'POST',
        body: data,
        headers: {
        }
      }).then((response) => {
        this.setState({loadingVisible:false})
        console.log(response.status,response.headers,'llll');
        if (response.status == 200) {
          var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
          // if(Platform.OS==='ios'){
          //   console.log(csrftoken,sessionid,'hhhhhhhhfdsgrg');
          //   var csrftoken = response.headers.get('set-cookie').split('csrftoken=')[1].split(';')[0]
          //   AsyncStorage.setItem("csrf", csrftoken)
          //   this.setState({ sessionid: sessionid })
          //   this.setState({ csrf: csrftoken})
          // }

          // console.log(csrftoken,sessionid,'hhhhhhhhfdsgrg');
          this.setState({ sessionid: sessionid })
          AsyncStorage.setItem("sessionid", sessionid)
          return response.json()
        }
        else {
          this.refs.toast.show('Mobile no was incorrect...');
          this.setState({loadingVisible:false})
          return response.json()
        }
      }).then((responseJson) => {
        console.log(responseJson,'egdssssssssssssss');
        this.setState({ needOTP: false })
        // if(Platform.OS==='android'){
          AsyncStorage.setItem("csrf", responseJson.csrf_token)
          this.setState({ csrf: responseJson.csrf_token })
        // }
        AsyncStorage.setItem("userpk", responseJson.pk+'')
        // this.getInitial(responseJson.pk,responseJson.csrf_token)
        this.setState({loader:false})
        AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
          return this.props.navigation.navigate('HomeScreen', {
            screen: 'ProfileScreen',
          })
        });

        // this.getMyStore()
        this.setState({loadingVisible:false})

      }).catch((error) => {
        this.setState({loadingVisible:false})
        this.refs.toast.show('Incorrect OTP');
      });
    }else{
      if(this.state.otp == undefined){
        this.refs.toast.show('OTP was incorrect..');
        return
      }else{
        if(this.state.otp.length < 4){
          this.setState({otp:this.state.clipboard})
        }
        var data = new FormData();
        data.append( "token", this.state.token );
        data.append( "mobileOTP", this.state.otp );
        data.append( "mobile", this.state.username );
        data.append( "email", null );
        data.append( "is_staff", 'False');
        data.append( "password", this.state.username );
        data.append( "firstName", this.state.username );
        data.append( "csrf", this.state.csrf );
        fetch( SERVER_URL +'/api/homepage/registration/'+ this.state.userPk+'/', {
          method: 'PATCH',
          body: data
        })
        .then((response) =>{
          this.setState({loadingVisible:false})
          if(response.status == '200' || response.status == '201'){
            var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
            AsyncStorage.setItem("sessionid", sessionid)
            this.setState({sessionid:sessionid})
            return response.json()
          }
        })
        .then((responseJson) => {
         AsyncStorage.setItem("csrf", responseJson.csrf)
          var result = responseJson

          AsyncStorage.setItem("userpk", JSON.stringify(result.pk))
          AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
                return  this.props.navigation.navigate('HomeScreen',{
                  screen:'ProfileScreen'
                })
            });

          })
        .catch((error) => {
          return
        });
     }
    }

  }


  render(){
    var themeColor = this.props.store.themeColor
    var {loadingVisible} = this.state
    return(


      <View style={{flex:1,backgroundColor: '#f2f2f2'}}>
      <Loader
      modalVisible = {loadingVisible}
      animationType="fade"
      />
      <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
      <View style={{height:Constants.statusBarHeight,backgroundColor:themeColor}}></View>

      <ScrollView style={{flex:0.64,paddingHorizontal:25,backgroundColor: '#f2f2f2'}}>
        <TouchableOpacity style={{marginTop:20  }} onPress={() => this.props.navigation.goBack()}  ><Ionicons name="md-arrow-back" size={28} color="#000" /></TouchableOpacity  >
        <MonoText style={{color:'#000',fontSize: 22,fontWeight:'700', marginTop: 30}}>Hi! </MonoText>
        <MonoText style={{color:'grey',fontSize: 22,fontWeight:'700'}}>{this.state.username}</MonoText>

        <MonoText style={{color:'#000',fontSize: 20,alignSelf:'flex-start',marginTop:40}}>Enter OTP</MonoText>

        <View style={{flex:1,alignItems:'center',justifyContent:'flex-start',marginTop:30}}>

         <TextInput style={{ borderBottomWidth: 2, borderColor: themeColor, width: '100%', height: 60, color: '#000', fontSize: 22 ,paddingVertical: 10}} autoFocus={true} keyboardType='numeric' value={this.state.password} placeholderTextColor='#000' onChangeText={query => {
              this.setState({ otp: query });
            }}/>

        </View>
        <View style={{flex:1,alignItems:'flex-end',justifyContent:'flex-start',}}>
          <TouchableOpacity  onPress={() => this.resend()} >
            <MonoText style={{ color: '#000', fontSize: 15, fontWeight: '700', marginVertical: 10 ,}}>Resend OTP</MonoText>
          </TouchableOpacity>
        </View>
        <View style={{flex:1,alignItems:'flex-start',justifyContent:'flex-start'}}>
          <TouchableOpacity  onPress={() => {this.verify() }} style={{width:'100%',}}>
          <MonoText style={{ color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', borderWidth: 1, borderRadius: 3, borderColor: themeColor,  paddingVertical: 9, paddingHorizontal: 10, backgroundColor: themeColor }}>VERIFY</MonoText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={()=>{this.props.navigation.navigate('Pages',{url:'terms-of-use'})}} style={{alignItems:'center',justifyContent:'center',}}>
          <MonoText style={{ color:'grey',fontSize:15,textAlign:'center',marginTop:5 }}>By Verifying I'm accepting the terms and conditions.</MonoText>
        </TouchableOpacity>
         <View style={{flex:0.37,marginHorizontal:20,}}>
           <View style={{marginTop:15}}>
             <Image source={require('../assets/images/satellite.png')} style={{ width:80,height:80,resizeMode: 'contain'}}/>
           </View>
           {storeType=='MULTI-OUTLET'&&

             <MonoText   style={{color:themeColor,fontSize:18,fontWeight:'700',marginTop:15,textAlign:'center'}}>Awaiting Happy Pockets satellite uplink...</MonoText>
           }
           <View style={{marginTop:10,justifyContent:'flex-end',alignItems:'flex-end'}}>
             <Image source={require('../assets/images/satellite1.png')} style={{ width:80,height:80,resizeMode: 'contain'}}/>
           </View>
         </View>


        </ScrollView>
      </View>

    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: '#fff',
  },
  underlineStyleBase:{
    width: 40,
    height:45,
    borderWidth:2,
    borderColor: "#a2a2a2",
    marginHorizontal:25,
  },
  underlineStyleHighLighted: {
     borderColor: themeColor,
   },
  button:{
   backgroundColor:themeColor,
   },
  buttonText:{

   },


});

const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    selectedStore:state.cartItems.selectedStore,
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
    removeMyStoreFunction:()=>dispatch(actions.removeMyStore()),

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OtpScreen);
