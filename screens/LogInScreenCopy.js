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
  TextInput, FlatList, AsyncStorage, Alert, Linking, PermissionsAndroid, ToastAndroid
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



  logIn() {
    if (this.state.needOTP == false) {
      console.log(this.state.username, this.state.password, 'hhh')

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
          console.log(response)
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
          console.log(responseJson.csrf_token.split('"')[0], 'kkkkkkkkkkkkkkkkkkkkkkkkkk');
          AsyncStorage.setItem("csrf", responseJson.csrf_token)
          AsyncStorage.setItem("userpk", responseJson.pk + '')
          AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
            return this.props.navigation.navigate('Home', {
              screen: 'ProfileScreen',

            })
          });
        })
        .catch((error) => {
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
        console.log(responseJson.csrf_token,this.state.sessionid, 'kkkkkkkkkkkkkkkkkkkkkkkkkk');

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
    const color = this.state.store.themeColor
    return (

      <View style={[styles.container, { backgroundColor: color }]}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <View style={styles.contentImage}>
          <Image style={styles.image} source={require('../assets/images/happypockets.jpeg')} />
          <MonoText   style={{ fontWeight: '700', alignSelf: 'center', fontSize: 26, color: '#fff', paddingVertical: 10 }}>Login</MonoText>
        </View>
        <View style={styles.logInPart}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <MonoText   style={{ color: '#000', fontSize: 16, borderWidth: 1, borderTopLeftRadius: 7, width: width * 0.15, borderBottomLeftRadius: 7, borderColor: '#f2f2f2', height: 40, paddingVertical: 9, paddingHorizontal: 10, backgroundColor: '#f2f2f2' }}>+91</MonoText>
            <TextInput style={{ borderWidth: 1, borderColor: '#fff', width: width * 0.48, height: 40, paddingHorizontal: 10, backgroundColor: '#fff', color: '#000', fontSize: 16 }} placeholder="Username/MobileNo" placeholderTextColor='#000' onChangeText={query => {
              this.setState({ mobileNo: query });
              this.setState({ username: query })
            }}
              value={this.state.username} />
            <TouchableOpacity onPress={() => this.sendOtp()}><MonoText   style={{ color: '#000', fontSize: 16, width: width * 0.22, borderWidth: 1, borderTopRightRadius: 7, borderBottomRightRadius: 7, borderColor: '#f2f2f2', height: 40, paddingVertical: 9, paddingHorizontal: 10, backgroundColor: '#f2f2f2' }}>Get OTP</MonoText> </TouchableOpacity>
          </View>
          {this.state.needOTP ? <View style={{ flex: 1 }}>
            <TextInput style={{ borderWidth: 1, borderRadius: 7, borderColor: '#fff', width: width * 0.85, height: 40, paddingHorizontal: 10, backgroundColor: '#fff', color: '#000', marginHorizontal: 1, fontSize: 16 }} placeholder="OTP" placeholderTextColor='#000' secureTextEntry={true} keyboardType='numeric' onChangeText={query => { this.setState({ otp: query }); }}
              value={this.state.otp} />
          </View > : <View style={{ flex: 1 }}>
              <TextInput style={{ borderWidth: 1, borderRadius: 7, borderColor: '#fff', width: width * 0.85, height: 40, paddingHorizontal: 10, backgroundColor: '#fff', color: '#000', marginHorizontal: 1, fontSize: 16 }} placeholder="Password" placeholderTextColor='#000' secureTextEntry={true} onChangeText={query => { this.setState({ password: query }); }}
                value={this.state.password} />
            </View>}
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => {

              this.logIn()

            }}>
              <MonoText   style={{ color: '#fff', fontSize: 20, fontWeight: '700', width: width * 0.85, textAlign: 'center', borderWidth: 1, borderRadius: 7, borderColor: '#d47921', height: 50, marginVertical: 0, paddingVertical: 9, paddingHorizontal: 10, backgroundColor: '#d47921' }}>Sign In</MonoText> </TouchableOpacity>

          </View>
        </View>
        <View style={styles.footerPart}>
          <View style={{ flex: 1, justifyContent: 'flex-end', }}>
          </View>
          <View style={{ flex: 1, justifyContent: 'flex-end', }}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', }} onPress={this.signInWithGoogleAsync}>
              <View style={{ backgroundColor: '#ffffff', height: 40 }}>
                <Image style={{ width: width * 0.10, height: 35, marginTop: 2 }} source={require('../assets/images/googleicon.png')} /></View>
              <MonoText   style={{ color: '#fff', fontSize: 15, fontWeight: '700', width: width * 0.75, textAlign: 'center', borderWidth: 1, borderTopRightRadius: 7, borderBottomRightRadius: 7, borderColor: '#DA3D29', height: 40, marginVertical: 0, paddingVertical: 9, paddingHorizontal: 10, backgroundColor: '#DA3D29' }}>Sign In With Google</MonoText>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', }} onPress={this.logInfacebook}>
              <View style={{ backgroundColor: '#ffffff' }}>
                <Image style={{ width: width * 0.10, height: 40 }} source={require('../assets/images/fbicon.png')} /></View>
              <MonoText   style={{ color: '#fff', fontSize: 15, fontWeight: '700', width: width * 0.75, textAlign: 'center', borderWidth: 1, borderTopRightRadius: 7, borderBottomRightRadius: 7, borderColor: '#3B5A9A', height: 40, paddingVertical: 9, paddingHorizontal: 10, backgroundColor: '#3B5A9A' }}>Sign In With Facebook</MonoText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  contentImage: {
    flex: 1,
    alignItems: 'center',
    marginTop: Constants.statusBarHeight,
    justifyContent: 'flex-start',
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
    width: width,
    height: width * 0.2
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
