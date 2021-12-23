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
  TextInput, FlatList, AsyncStorage, Alert, Linking, PermissionsAndroid, ToastAndroid,ActivityIndicator
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast';
import { FontAwesome } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import * as Expo from 'expo';
import * as Permissions from 'expo-permissions';
import * as Google from 'expo-google-app-auth';
import * as Facebook from 'expo-facebook';
import settings from '../constants/Settings.js';
const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';
class LogInScreen extends React.Component {

  static navigationOptions = {
    header:null,
  }


  constructor(props) {
    super(props);
    this.state = {
      needOTP: false,
      username: '',
      sessionid: '',
      name: '',
      token: '',
      loginname: '',
      password: '',
      serverCart: '',
      csrf: '',
      store: this.props.store,
      cartItems : this.props.cart,
      loader:false
    }
  }



  logInfacebook = async () => {
    const {
      type,
      token,
    } = await Facebook.logInWithReadPermissionsAsync('2101704323212270', {
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

  signupOrSignin = (data)=>{
    fetch( SERVER_URL + '/mobilelogin/', {
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
          return this.props.navigation.navigate('Home', {screen: 'ProfileScreen'})
        })
      }
    })
  }





  signInWithGoogleAsync = async () => {

    const result = await Google.logInAsync({
      androidStandaloneAppClientId: '370697243487-7d4q3d937c602slucf99hfbbaat3fb2n.apps.googleusercontent.com',
      iosStandaloneAppClientId: '370697243487-74qvbrbfouv8svfk44orm867ho9c3chk.apps.googleusercontent.com',
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
        this.refs.toast.show(result.type);
        // ToastAndroid.show(result.type, ToastAndroid.SHORT);
        return { cancelled: true };
      }

  }

  checkNetwork = ()=>{
    NetInfo.fetch().then(state => {
      if(state.isConnected){
        return true
      }else{
        return false
      }
    })
  }

  getOtp() {
    if(this.state.mobileNo == undefined){
      this.refs.toast.show('Mobile no was incorrect ');
       // ToastAndroid.show('Mobile no was incorrect ', ToastAndroid.SHORT);
    }
    // else if(this.state.checked == false){
    //   this.refs.toast.show('Agree the Terms And Condition ');
    //   ToastAndroid.show('Agree the Terms And Condition ', ToastAndroid.SHORT);
    // }
    else{
      var data = new FormData();
      data.append( "mobile", this.state.mobileNo );
      fetch( SERVER_URL + '/api/homepage/registration/', {
        method: 'POST',
        body: data
      })
      .then((response) =>{console.log(response.status)
        if(response.status == 200 || response.status==201 ){
          var d = response.json()
          // this.setState({ needOTP: true })
          return d
        }else{
          this.refs.toast.show('Mobile No Already register with user ');
          // ToastAndroid.show('Mobile No Already register with user ', ToastAndroid.SHORT);
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
         });
       })
      .catch((error) => {
        return

      });
    }
  }


  sendOtp() {
    console.log('sendOtp function');
    var mob = /^[1-9]{1}[0-9]{9}$/;
    if (this.state.mobileNo == undefined || mob.test(this.state.mobileNo) == false) {
      this.refs.toast.show('Enter Correct Mobile No');
      // ToastAndroid.show('Enter Correct Mobile No', ToastAndroid.SHORT);
    } else {
      this.refs.toast.show('OTP request sent.');
      var data = new FormData();
      data.append("id", this.state.mobileNo);
      fetch(SERVER_URL + '/generateOTP/', {
        method: 'POST',
        body: data
      })
        .then((response) => {
          console.log(response.status)
          console.log(response)
          if (response.status == 200) {
            this.setState({ username: this.state.mobileNo })
            return response.json()
          }

        })

        .then((responseJson) => {
          console.log(responseJson)
          if (responseJson == undefined){
            console.log(responseJson,'ottttp');
            this.getOtp()

            // this.refs.toast.show('No user found , Please register');
            // ToastAndroid.show('No user found , Please register', ToastAndroid.SHORT);
          }else{
            this.setState({ OTP: responseJson })
            console.log(responseJson,'ottttp');
            this.props.navigation.navigate('OtpScreen',{
              screen:'LogInScreen',
              username:this.state.mobileNo,
            });
            return
          }
        })
        .catch((error) => {
          this.refs.toast.show(error.toString());
          // ToastAndroid.show(error.toString(), ToastAndroid.LONG);
          return
        });
    }
  }


  requestPatch=(item,qty,sessionid,csrf)=>{
    console.log(item,qty,sessionid,csrf,'jjjj');
    return new Promise(resolve => {
     fetch(SERVER_URL + '/api/POS/cart/'+item.cart+'/',{
       method: 'PATCH',
       headers:{
         "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Referer': SERVER_URL,
         'X-CSRFToken': csrf
       },
       body: JSON.stringify({qty:qty})
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

  logIn() {
    var connection = this.checkNetwork()
    console.log(connection,'ghjk');
    console.log('fgh');
    if (this.state.needOTP == false) {
      console.log(this.state.username, this.state.password, 'hhh')
      this.setState({loader:true})
      var data = new FormData();
      data.append("username", this.state.username);
      data.append("password", this.state.password);
      fetch(SERVER_URL + '/login/?mode=api', {
        method: 'POST',
        body: data,
        headers: {
        }
      })
        .then((response) => {
          console.log(response,'datadatadata')
          if (response.status == 200) {
            var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
            console.log(sessionid,'kkkkkkkkkkkkks');
            this.setState({ sessionid: sessionid })
            AsyncStorage.setItem("sessionid", sessionid)
            return response.json()
          } else {
            this.refs.toast.show('Incorrect Username or Password');
            // ToastAndroid.show('Incorrect Username or Password', ToastAndroid.SHORT);
            return
          }
        })
        .then((responseJson) => {
          console.log(responseJson.csrf_token.split('"')[0], 'kkkkkkkkkkkkktEST');
          AsyncStorage.setItem("csrf", responseJson.csrf_token)
          AsyncStorage.setItem("userpk", responseJson.pk + '')
          this.getInitial(responseJson.pk,responseJson.csrf_token)
          // AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
          //   return this.props.navigation.navigate('HomeScreen', {
          //     screen: 'ProfileScreen',
          //
          //   })
          // });
        })
        .catch((error) => {
          this.setState({loader:false})
          this.refs.toast.show('Incorrect Username or Password');
          // ToastAndroid.show('Incorrect Username or Password', ToastAndroid.SHORT);
        });

    } else {
      var data = new FormData();
      data.append("username", this.state.username);
      data.append("otp", this.state.otp);
      fetch(SERVER_URL + '/login/?otpMode=True&mode=api', {
        method: 'POST',
        body: data,
        headers: {
        }
      }).then((response) => {
        console.log(response)
        console.log(response.headers)
        if (response.status == 200) {
          var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
          this.setState({ sessionid: sessionid })
          AsyncStorage.setItem("sessionid", sessionid)
          return response.json()
        }
        else {
          this.refs.toast.show('Mobile no was incorrect...');
          // ToastAndroid.show('Mobile no was incorrect...', ToastAndroid.SHORT);
        }
      }).then((responseJson) => {
        console.log(responseJson.csrf_token,this.state.sessionid, 'kkkkkkkkkkkkkksessionidTest');

        this.setState({ needOTP: false })
        AsyncStorage.setItem("csrf", responseJson.csrf_token)
        AsyncStorage.setItem("userpk", responseJson.pk+'')
        AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
          return this.props.navigation.navigate('Home', {
            screen: 'ProfileScreen'
          })
        });

      }).catch((error) => {
        console.log(error);
        this.refs.toast.show('Incorrect OTP');
        // ToastAndroid.show('Incorrect OTP', ToastAndroid.SHORT);
      });

    }
  }

  render() {
    const { navigation } = this.props;
    const color = this.props.store.themeColor

    if(this.state.loader){
      return(
        <View style={{flex:1,justifyContent:'center',alignItems: 'center'}}>
          <ActivityIndicator size="large" color={color} />
        </View>
      )
    }else{
    return (

      <View style={{flex:1}}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <View style={{backgroundColor:color,height:Constants.statusBarHeight}} />
        <View style={[styles.container, { backgroundColor: '#f2f2f2' }]}>
            <View style={{}}>
                <View style={{backgroundColor: '#f2f2f2'}}>
                      <MonoText   style={{ fontWeight: '700', alignSelf: 'center', fontSize: 26, color: color,paddingTop:15,marginTop:width*0.2  }}>Login</MonoText>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop:width*0.2}}>
                      <MonoText   style={{ color: '#fff', fontSize: 16, borderWidth: 1, borderTopLeftRadius: 7,
                                      width: width * 0.15,     borderBottomLeftRadius: 7, borderColor: color, height: 50,
                                      paddingVertical: 12, paddingHorizontal: 10, backgroundColor: color }}>+91</MonoText>
                      <TextInput style={{ borderWidth: 1,borderTopRightRadius: 7,borderBottomRightRadius: 7,
                                          borderColor: color, width: width * 0.7, height: 50, paddingHorizontal: 10,
                                          backgroundColor: '#fff', color: '#000', fontSize: 16 }}
                                 placeholder="Enter mobile no"
                                 placeholderTextColor='#000'
                                 onChangeText={query => {
                                                this.setState({ mobileNo: query });
                                                this.setState({ username: query })
                                              }}
                                 value={this.state.username} />
                </View>
              <TextInput style={{ borderWidth: 1,borderRadius: 7,borderColor: color, width: width * 0.85,
                                  height: 50,marginTop: 20, paddingHorizontal: 10, backgroundColor: '#fff',
                                  color: '#000', fontSize: 16 }}
                         placeholder="Password"
                         secureTextEntry={true}
                         placeholderTextColor='#000'
                         onChangeText={query => {this.setState({ password: query });}}
                         value={this.state.password} />
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress={()=>{this.logIn();
                        // this.sendOtp();
                      }}>
                      <MonoText   style={{ color: '#fff', fontSize: 20, fontWeight: '700', width: width * 0.85, textAlign: 'center',
                                      borderWidth: 1, borderRadius: 7, borderColor: color, height: 50,
                                      marginVertical: 20, paddingVertical: 9, paddingHorizontal: 10,
                                      backgroundColor: color }}>Sign in with OTP</MonoText>
                   </TouchableOpacity>
              </View>
              <View style={{flexDirection:'row'}}>
                    <MonoText   style={{color:'#000',fontSize:16}}>New register? </MonoText>
                    <TouchableOpacity onPress={()=>{this.props.navigation.navigate('Registration')}}>
                          <MonoText   style={{color:themeColor,fontSize:16,fontWeight:'bold'}}>Sign Up </MonoText>
                    </TouchableOpacity>
              </View>
           </View>

        </View>
      </View>
    );
  }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  contentImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInPart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  footerPart: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginVertical: 20,
  },
  image: {
    width: width*0.4,
    height: width * 0.2,
    resizeMode: 'contain'
  }

});
// <TouchableOpacity onPress={() => {
//   this.props.navigation.navigate('RegistrationView', {
//     color: color
//   })
// }} ><MonoText   style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginVertical: 10 }}>New User?</MonoText> </TouchableOpacity>
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

export default connect(mapStateToProps, mapDispatchToProps)(LogInScreen);

// <View style={[styles.contentImage,{flex:1,backgroundColor: '#f2f2f2'}]}>
//   <Image style={styles.image} source={require('../assets/images/SYSTUNIX_logo_dark.png')} />
//   <MonoText   style={{ fontWeight: '700', alignSelf: 'center', fontSize: 26, color: color,  }}>Login</MonoText>
// </View>
// <View style={{backgroundColor:color,height:Constants.statusBarHeight*2}} />
