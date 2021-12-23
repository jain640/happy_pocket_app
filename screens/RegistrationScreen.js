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
  TextInput,FlatList,AsyncStorage,ToastAndroid,Linking
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import { FontAwesome } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import settings from '../constants/Settings.js';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';

const  content = {
    billingCity	:'',
    billingCountry:'',
    billingLandMark	:'',
    billingPincode:0,
    billingState:'',
    billingStreet	:'',
    sameAsShipping:true,
    street:'' ,
    city:'Bengaluru',
    state:'Karnataka',
    pincode:560061,
    country:"India",
    mobileNo:null,
    landMark:'Mantri Alpyne',
    title:"Address",
    primary:true,
  }


export default class RegistrationScreen extends React.Component {

  static navigationOptions = {
    header:null
  };
// mobileNo:this.props.navigation.getParam('username'),
  constructor(props){
    super(props);
    this.state = {
      needOTP : false,
      agree:false,
      checked:false,
      sessionid:'',
      mobileNo:'',
    }

  }

  otpScreen(){
    var mob = /^[1-9]{1}[0-9]{9}$/;
    if(this.state.mobileNo == undefined || this.state.mobileNo == '' || mob.test(this.state.mobileNo) == false){
      this.refs.toast.show('Enter Mobile No ');
      return
    }else{
      if(this.state.mobileNo.length == 10 ){
        var data = new FormData();
        data.append( "mobile", this.state.mobileNo );
        fetch( SERVER_URL + '/api/homepage/registration/', {
          method: 'POST',
          body: data
        })
        .then((response) =>{console.log(response.status)
          if(response.status == 200 || response.status==201 ){
            var d = response.json()
            this.setState({ needOTP: true })
            return d
          }else{
            this.refs.toast.show('Mobile No Already register with user ');
            // ToastAndroid.show('Mobile No Already register with user ', ToastAndroid.SHORT);
          }
        })
        .then((responseJson) => {
           this.props.navigation.navigate('OtpScreen',{data:{userPk: responseJson.pk,token:responseJson.token,mobile:responseJson.mobile,username:this.state.mobileNo},username:this.state.mobileNo,screen:'register'})
            })
        .catch((error) => {
          this.refs.toast.show('Some thing went wrong..');
          return

        });

      }else{
        this.refs.toast.show('Enter Valid Mobile No ');
        return
      }

    }
  }

  componentDidMount(){
    var no = this.props.navigation.getParam('username','')
    this.setState({mobileNo:no})
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
         this.setState({ userPk: responseJson.pk,token:responseJson.token,mobile:responseJson.mobile,username:this.state.mobileNo })
          })
      .catch((error) => {
        return

      });
    }
  }

  SignIn(){
    if(this.state.otp == undefined){
      return
    }else{
      var data = new FormData();
      data.append( "reg", this.state.userPk );
      data.append( "token", this.state.token );
      data.append( "mobileOTP", this.state.otp );
      data.append( "mobile", this.state.username );
      data.append( "agree", this.state.checked );
      fetch( SERVER_URL +'/api/homepage/registration/'+ this.state.userPk+'/', {
        method: 'PATCH',
        body: data
      })
      .then((response) =>{

        if(response.status == '200' || response.status == '201'){
          var sessionid = response.headers.get('set-cookie').split('sessionid=')[1].split(';')[0]
          AsyncStorage.setItem("sessionid", sessionid)
          this.setState({sessionid:sessionid})
          return response.json()
        }
      })
      .then((responseJson) => {
        console.log(responseJson.csrf,'jjjjjjjjjjj');
       AsyncStorage.setItem("csrf", responseJson.csrf)
        var result = responseJson

        AsyncStorage.setItem("userpk", JSON.stringify(result.pk))
        AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
              return  this.props.navigation.navigate('Home',{
                screen:'ProfileScreen'
              })
          });

        })
      .catch((error) => {
        return
      });

  }
}


    render() {
      const { navigation } = this.props;
      const color = navigation.getParam('color','#000')
      return (
        <View style={[styles.container,{backgroundColor:color}]}>
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
          <View style={styles.contentImage}>
            <Image style={styles.image} source={require('../assets/images/happypockets.jpeg')}  />
            <MonoText   style={{fontWeight:'700',alignSelf:'center',fontSize:26,color:'#fff',paddingVertical:10}}>Registration</MonoText> 
          </View>
          <View style={styles.logInPart}>
            <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
              <MonoText   style={{color:'#000',fontSize:16,borderWidth:1,borderTopLeftRadius:7,width:width*0.15,borderBottomLeftRadius:7,borderColor:'#f2f2f2',height:40,paddingVertical:9,paddingHorizontal:10,backgroundColor:'#f2f2f2'}}>+91</MonoText> 
              <TextInput style={{borderWidth:1,borderColor:'#fff',width:width*0.48,height:40,paddingHorizontal:10,backgroundColor:'#fff',color:'#000',fontSize:16}}  placeholder="Enter Mobile No" placeholderTextColor='#000' keyboardType='numeric' onChangeText={query => { this.setState({ mobileNo: query }); }}
              value={this.state.mobileNo} />
              <TouchableOpacity onPress={() => this.otpScreen()}><MonoText   style={{color:'#000',fontSize:16,width:width*0.22,borderWidth:1,borderTopRightRadius:7,borderBottomRightRadius:7,borderColor:'#f2f2f2',height:40,paddingVertical:9,paddingHorizontal:10,backgroundColor:'#f2f2f2'}}>Get OTP</MonoText> </TouchableOpacity>
            </View>

            {this.state.needOTP? <View  style={{flex:1}}>
              <TextInput style={{borderWidth:1,borderRadius:7,borderColor:'#fff',width:width*0.85,height:40,paddingHorizontal:10,backgroundColor:'#fff',color:'#000',marginHorizontal:1,fontSize:16}} placeholder="OTP" placeholderTextColor='#000' secureTextEntry={true} onChangeText={query => { this.setState({ otp: query }); }}
              value={this.state.otp}/>
            </View >:<View></View>}
            <View style={{flex:1}}>
              <TouchableOpacity onPress={() => {
                this.otpScreen()
              }}><MonoText   style={{color:'#fff',fontSize:20,fontWeight:'700',width:width*0.85,textAlign:'center',borderWidth:1,borderRadius:7,borderColor:'#d47921',height:50,marginVertical:0,paddingVertical:9,paddingHorizontal:10,backgroundColor:'#d47921'}}>PROCEED</MonoText> </TouchableOpacity>
              <TouchableOpacity onPress={() => {this.props.navigation.navigate('LogInScreen')}}><MonoText   style={{color:'#fff',fontSize:15,fontWeight:'700',marginVertical:10}}>Already User?</MonoText> </TouchableOpacity>
            </View>
          </View>
          <View style={styles.footerPart}>
            <View style={{flex:1,justifyContent:'flex-end',}}>
            </View>
            <View style={{flex:1,justifyContent:'flex-end',}}>

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
    contentImage:{
      flex: 1,
      alignItems: 'center',
      marginTop:Constants.statusBarHeight,
      justifyContent: 'flex-start',
    },
    logInPart:{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    footerPart:{
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      marginVertical:20,
    },
    image:{
      width:width,
      height:width*0.2
    }

  });


  // {!this.state.needOTP? <View  style={{}}>
  // <CheckBox
  //   containerStyle={{width:width*0.85,backgroundColor:color,borderWidth:0,marginBottom:9}}
  //   textStyle={{color:'#fff',}}
  //   center
  //   checkedColor="#fff"
  //   uncheckedColor="#fff"
  //   title='I have read, understood, and I agree to the " Terms and Conditions " set forth by Happy Pockets.'
  //   checked={this.state.checked}
  //   onPress={() => this.setState({checked: !this.state.checked,})}
  //   />
  // </View >:<View></View>}
  // <View style={{width:width*0.85,backgroundColor:color,borderWidth:0,marginBottom:10,justifyContent: 'center'}}>
  //   <MonoText   style={{color:'#fff',fontSize:17,fontWeight:'700',marginVertical:10,textAlign:'center'}}>By proceeding, you agree to our <MonoText   onPress={() => this.props.navigation.navigate('TermsAndCondition')} style={{color:'#000',fontSize:15,}}>{`\n" Terms and Conditions "`}</MonoText>   set forth by Happy Pockets.</MonoText> 
  // </View>
  // if(this.state.otp == undefined){
  //   this.getOtp()
  // }else{
  //   this.SignIn()
  // }
