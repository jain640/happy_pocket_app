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
  TextInput, FlatList,ActivityIndicator,AsyncStorage,Animated,ImageBackground
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator,createAppContainer,createSwitchNavigator,NavigationActions } from 'react-navigation';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import GridLayout from 'react-native-layout-grid';

import DiscoverSellerCard from '../components/DiscoverSellerCard.js';
import settings from '../constants/Settings.js';
const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';
import ChatCard from '../components/ChatCard.js';
import ChatUserCard from '../components/ChatUserCard.js';



class EditProfile extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Edit Profile',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerTitleStyle: {
        flex:0.8,
        alignSelf:'center',
        textAlign:'center',
      },
      headerTintColor: '#fff',
    }
  };


  constructor(props){
    super(props);
    var bannerImageURL = '';
    if(props.myStore.banner==null){
      bannerImageURL ='http://i.imgur.com/IGlBYaC.jpg';
    }else{
      bannerImageURL = SERVER_URL+props.myStore.banner;
    }
    this.state = {
      store:props.store,
      myStore:props.myStore,
      bannerImageURL:bannerImageURL,
    }
  }

  componentWillReceiveProps(nextProps){
    console.log(nextProps.myStore.logo,'logo');
    console.log(nextProps.myStore.banner,'banner');
    if(nextProps.myStore.logo != null){
      if(nextProps.myStore.logo.includes('http')){
        image = '/media/'+nextProps.myStore.logo.split('/media/')[1]
        nextProps.myStore.logo = image
      }
    }
    if(nextProps.myStore.banner != null){
      if(nextProps.myStore.banner.includes('http')){
        bannerImage = '/media/'+nextProps.myStore.banner.split('/media/')[1]
        nextProps.myStore.banner = bannerImage
      }
    }
    this.setState({myStore:nextProps.myStore})
  }

  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    });
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

  showNoInternet=()=>{
    if(this.refs.toast!=undefined){
      this.refs.toast.show('No Internet Connection')
    }
  }

  componentWillUnmount=()=>{
    var unsubscribe = this.state.unsubscribe;
    unsubscribe()
  }

  editBasic=()=>{
    this.props.navigation.push('EditStore')
  }

  editAccount=()=>{
    this.props.navigation.navigate('EditBank')
  }


  render() {

    var themeColor = this.props.store.themeColor


     return (
       <View style={[styles.container]}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <ScrollView style={{flex:1,}}>
          <ImageBackground source={{uri:this.state.bannerImageURL }} style={[styles.backgroundImage,{height:200}]}>
           <View style={{height:width*0.5,alignItems:'center',justifyContent:'center'}}>
             {this.state.myStore.logo!=null&&
                <View style={{width:100,height:100,backgroundColor:themeColor,borderRadius:50}}>
                      <Image source={{uri:SERVER_URL+this.state.myStore.logo}} style={{width:100,height:100,overflow: "hidden",resizeMode:'cover',borderRadius:50}} />
                </View>
              }
             {this.state.myStore.logo==null&&this.state.myStore.name.length>0&&
                <View style={{width:100,height:100,backgroundColor:themeColor,borderRadius:50,alignItems:'center',justifyContent:'center'}}>
                      <MonoText   style={{fontSize:40,color:'#000'}}>{this.state.myStore.name.charAt(0)}</MonoText>
                </View>
              }
              <MonoText   style={{fontSize:17,color:'#000',fontWeight:'400',marginTop:5}}>{this.state.myStore.name}</MonoText>
           </View>
         </ImageBackground>
           <View style={{marginHorizontal:15,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
              <View style={{flexDirection:'row',marginVertical:15}}>
                <View style={{flex:0.7,}}>
                    <MonoText   style={{fontSize:17,color:themeColor}}>BUISNESS INFORMATION</MonoText>
                </View>
                <TouchableOpacity onPress={()=>{this.editBasic()}} style={{flex:0.3,alignItems:'flex-end'}}>
                    <FontAwesome name={'edit'} size={25} color={themeColor} />
                </TouchableOpacity>
              </View>
              <View style={{marginBottom:10,}}>
              <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Business Owner Name</MonoText>
              <MonoText   style={{fontSize:16,color:'grey',fontWeight:'400'}}>{this.state.myStore.owner.first_name} {this.state.myStore.owner.last_name} </MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>About Your Business</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',fontWeight:'400'}}>{this.state.myStore.description}</MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Business Type</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',fontWeight:'400'}}>{this.state.myStore.vendor_typ}</MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Industry</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',fontWeight:'400'}}>{this.state.myStore.industryType}</MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Establishment Year</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',fontWeight:'400'}}>{this.state.myStore.establishmentYear}</MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Minimum Order Value</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',fontWeight:'400'}}><FontAwesome name={'rupee'} size={16} color={'grey'} /> {this.state.myStore.minimumOrdervalue}</MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Mobile</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',fontWeight:'400'}}>{this.state.myStore.mobile!=null?this.state.myStore.mobile:'-'}  </MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Email</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',fontWeight:'400'}}>{this.state.myStore.email!=null?this.state.myStore.email:'-'}  </MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>GSTIN</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',fontWeight:'400'}}>{this.state.myStore.gstin} </MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Address</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',fontWeight:'400'}}>{this.state.myStore.address} {this.state.myStore.city} {this.state.myStore.state} {this.state.myStore.country} {this.state.myStore.pincode}</MonoText>
              </View>
           </View>



           <View style={{marginHorizontal:15,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
              <View style={{flexDirection:'row',marginVertical:15}}>
                <View style={{flex:0.7,}}>
                    <MonoText   style={{fontSize:17,color:themeColor}}>BANK ACCOUNT DETAILS</MonoText>
                </View>
                <TouchableOpacity onPress={()=>{this.editAccount()}} style={{flex:0.3,alignItems:'flex-end'}}>
                    <FontAwesome name={'edit'} size={25} color={themeColor} />
                </TouchableOpacity>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Account Holders Name</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',}}>{this.state.myStore.accountHolderName==null?'-':this.state.myStore.accountHolderName} </MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Account Number</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',}}>{this.state.myStore.bankaccountNumber==null?'-':this.state.myStore.bankaccountNumber}</MonoText>
              </View>
              <View style={{marginBottom:10,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Bank Name</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',}}>{this.state.myStore.bankName==null?'-':this.state.myStore.bankName}</MonoText>
              </View>
              <View style={{marginBottom:25,}}>
                <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Bank Type</MonoText>
                <MonoText   style={{fontSize:16,color:'grey',}}>{this.state.myStore.bankType==null?'-':this.state.myStore.bankType}</MonoText>
              </View>
           </View>

        </ScrollView>
       </View>
     );
   }
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    shadow: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 3,
    },backgroundImage: {
        flex: 1,
        borderRadius: 0,
        overflow: 'hidden',
        borderWidth:0,
        marginTop:0,
        resizeMode:'contain',
    },

  });


  const mapStateToProps =(state) => {
      return {
      counter: state.cartItems.counter,
      cart : state.cartItems.cartItem,
      store:state.cartItems.store,
      myStore:state.cartItems.myStore,
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

  export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);



 // <View style={{marginHorizontal:15,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
 //    <View style={{flexDirection:'row',marginVertical:15}}>
 //      <View style={{flex:0.7,}}>
 //          <MonoText   style={{fontSize:17,color:themeColor}}>USER INFORMATION</MonoText>
 //      </View>
 //    </View>
 //
 // </View>
 // <View style={{marginBottom:10,}}>
 //   <MonoText   style={{fontSize:16,color:'#000',fontWeight:'400'}}>Company Name</MonoText>
 //   <MonoText   style={{fontSize:16,color:'grey',}}>{this.state.myStore.company!=null?this.state.myStore.company:'-'}</MonoText>
 // </View>
