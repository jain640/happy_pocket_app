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
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import OrderDetails from '../components/OrderDetails';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import { LinearGradient } from 'expo';
import settings from '../constants/Settings.js';
const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';



class ProfileScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state

    return {
      title: params ? params.profile : 'Profile',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },

      headerTintColor: '#fff',


  };
}

constructor(props){
  super(props);
  this.state = {
    profileName:'',
    userdetails:[],
    loader:true,
    userPk:null,
    sessionid:'',
    csrf:'',
    store:this.props.store
  }

}


    getUserAsync = async () => {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      this.setState({userPk:userToken,sessionid:sessionid,csrf:csrf})
      fetch(SERVER_URL + '/api/HR/userSearch/?mode=mySelf', {
        headers: {
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Accept': 'application/json',
           'Content-Type': 'application/json',
           'Referer': SERVER_URL,
           'X-CSRFToken': csrf
        }
      }).then((response) => {
        if(response.status == '200'){
          this.setState({userScreen:'ProfileScreen'})
          return response.json()
        }else{
          AsyncStorage.removeItem('userpk')
          AsyncStorage.removeItem('sessionid')
          AsyncStorage.removeItem('csrf')
          AsyncStorage.removeItem('cart')
          AsyncStorage.removeItem('counter')
          AsyncStorage.setItem("login", JSON.stringify(false))
          this.setState({userScreen:'LogInScreen'})
          return
        }
    })
        .then((responseJson) => {
          if(responseJson == undefined){
            this.props.navigation.navigate('LogInScreen',{
              color:this.state.store.themeColor
            })
            return
          }
          this.setState({ userdetails: responseJson[0]})
          this.setState({ profileName: responseJson[0].first_name,loader:false})

           var username = 'Hi '+ this.state.profileName
           this.props.navigation.setParams({
             profile:username
           });
        })
        .catch((error) => {
          return
        });
    }




   componentDidMount(){
     this.getUserAsync()
     this.props.navigation.setParams({
       account: this.gotoAccount,
       themeColor: this.state.store.themeColor,
     });
   }
   gotoAccount = () => {
     this.props.navigation.navigate('ProfileEditScreen', {
       user: this.state.userdetails
     })
   }

   logout=()=>{
     new Promise((resolve, reject) => {
         Alert.alert(
             'Confirm',
             'Are you sure want to Logout?',
             [
                 {text: "Yes", onPress: () => {
                   try {
                      AsyncStorage.removeItem('userpk')
                      AsyncStorage.removeItem('sessionid')
                      AsyncStorage.removeItem('csrf')
                      AsyncStorage.removeItem('cart')
                      AsyncStorage.removeItem('counter')
                      AsyncStorage.setItem("login", JSON.stringify(false))
                      this.props.navigation.navigate('Home',{
                        screen:'LogInScreen',
                      })
                    } catch (error) {
                      return
                    }

                  } },
                  {
                    text: 'No',
                    onPress: () => {return},
                    style: 'cancel',
                  },
             ],
             { cancelable: false }
         )
     })

   }


    render() {
      var themeColor = this.props.store.themeColor
      if(this.state.loader == true){
        return (
          <View style={{flex:1,justifyContent:'center',alignItems: 'center' }}>
          <ActivityIndicator size="large" color={themeColor} />
          </View>
        )
      }else{

      return (

        <View style={[styles.container]}>

            <TouchableOpacity onPress={()=>this.props.navigation.navigate('OrderDetailsScreen')} style={[{flexWrap:'nowrap',flexDirection:'row',justifyContent:'flex-start',marginTop:0,backgroundColor:'#e7e7e7',paddingHorizontal:20,paddingVertical:15,borderTopWidth:1,borderTopColor:"#e7e7e7",}]}>
              <FontAwesome name="shopping-bag" size={22} color={themeColor} style={{marginTop:5}} />
              <MonoText   style={{color:'grey',fontSize:22,marginLeft:10}}>Orders</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <FontAwesome name="angle-right" size={32} color={themeColor}  />
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>this.props.navigation.navigate('AddressScreen',{from:'profile'})} style={[{flexWrap:'nowrap',flexDirection:'row',justifyContent:'flex-start',marginTop:2,backgroundColor:'#e7e7e7',paddingHorizontal:20,paddingVertical:15,borderTopWidth:1,borderTopColor:"#e7e7e7",borderBottomWidth:1,borderBottomColor:"#e7e7e7"}]}>
              <FontAwesome name="address-card" size={22} color={themeColor} style={{marginTop:5}} />
              <MonoText   style={{color:'grey',fontSize:22,marginLeft:10}}>Address</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <FontAwesome name="angle-right" size={32} color={themeColor}  />
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>this.props.navigation.navigate('SupportScreen')} style={[{flexWrap:'nowrap',flexDirection:'row',justifyContent:'flex-start',marginTop:2,backgroundColor:'#e7e7e7',paddingHorizontal:20,paddingVertical:15,borderTopWidth:1,borderTopColor:"#e7e7e7",borderBottomWidth:1,borderBottomColor:"#e7e7e7"}]}>
              <FontAwesome name="phone" size={22} color={themeColor} style={{marginTop:5}} />
              <MonoText   style={{color:'grey',fontSize:22,marginLeft:10}}>Support</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <FontAwesome name="angle-right" size={32} color={themeColor}  />
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>this.props.navigation.navigate('FaqScreen')} style={[{flexWrap:'nowrap',flexDirection:'row',justifyContent:'flex-start',marginTop:2,backgroundColor:'#e7e7e7',paddingHorizontal:20,paddingVertical:15,borderTopWidth:1,borderTopColor:"#e7e7e7",borderBottomWidth:1,borderBottomColor:"#e7e7e7"}]}>
              <FontAwesome name="question" size={22} color={themeColor} style={{marginTop:5}} />
              <MonoText   style={{color:'grey',fontSize:22,marginLeft:10}}>FAQ</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <FontAwesome name="angle-right" size={36} color={themeColor}  />
              </View>
            </TouchableOpacity>



            <TouchableOpacity onPress={()=>this.logout()} style={[{flexWrap:'nowrap',flexDirection:'row',justifyContent:'flex-start',marginTop:2,backgroundColor:'#e7e7e7',paddingHorizontal:20,paddingVertical:15,borderTopWidth:1,borderTopColor:"#e7e7e7",borderBottomWidth:1,borderBottomColor:"#e7e7e7"}]}>
              <FontAwesome name="sign-out" size={22} color={themeColor} style={{marginTop:5}} />
              <MonoText   style={{color:'grey',fontSize:22,marginLeft:10}}>Logout</MonoText>
              <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
                <FontAwesome name="angle-right" size={32} color={themeColor}  />
              </View>
            </TouchableOpacity>

         </View>


        );
      }
    }
}


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',


    },
    contentImage:{
      flexWrap: 'nowrap',
      flexDirection:'row',
      alignItems: 'flex-start',
      marginTop:Constants.statusBarHeight,
      justifyContent: 'flex-start',
    },
    item: {
      marginTop:10,
      borderRadius:10
    },
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

TouchableOpacityStyle: {
   position: 'absolute',
   width: 50,
   height: 50,
   alignItems: 'center',
   justifyContent: 'center',
   right: 30,
   bottom: 30,
   backgroundColor: '#1f5b82',
   zIndex: 1,
   borderRadius:25,

 },
 modalcontainer:{
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
  modalView: {
     backgroundColor: '#fff',
     marginHorizontal: width*0.05 ,
     borderRadius:5,
    },

 FloatingButtonStyle: {
   resizeMode: 'contain',
   width: 50,
   height: 50,


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

  export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);
