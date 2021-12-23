import * as React from 'react';
import {Animated, StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList ,Platform,ScrollView,AsyncStorage,ActivityIndicator} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown-v2';
import Toast, {DURATION} from 'react-native-easy-toast';
import settings from '../constants/Settings.js';
import { NavigationActions } from 'react-navigation';
import { MonoText } from './StyledText';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url

export default class GiftComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gifts:[],
      scrollY: new Animated.Value(0),
      store: props.store,
      redeemed:[],
      user:props.user,
      primaryAddress:props.selectedAddress,
      selectedGift:null,
      addressScreen:props.addressScreen,
      loader:false
    }
  }
  componentDidMount(){
    this.getWalletTransition()
    this.getUser()
  }

  getUser=async()=>{
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    if(userToken == null){
      return
    }

  fetch(SERVER_URL+'/api/HR/users/'+ userToken + '/', {
    headers: {
       "Cookie" :"csrf="+csrf+"; sessionid=" + sessionid +";",
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Referer': SERVER_URL,
       'X-CSRFToken': csrf
    }
  }).then((response) => response.json())
    .then((responseJson) => {
      if(responseJson == undefined){
        return
      }
       this.setState({user:responseJson})
    })
    .catch((error) => {
      return
    });
  }

  componentWillReceiveProps(nextProps){
    console.log(nextProps.addressScreen,'kkkkkkkk');
    if(nextProps.addressScreen&&nextProps.selectedAddress!=null&&nextProps.selectedAddress.pk!=undefined){
      this.setState({primaryAddress:nextProps.selectedAddress,loader:true})
      this.getUserAsync(this.state.selectedGift)
      console.log(this.state.primaryAddress,'came');
    }
    // console.log(this.state.primaryAddress,'came');
  }


  getUserAsync = async (item) => {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      if(userToken == null){
        return
      }

  fetch(SERVER_URL+'/api/HR/users/'+ userToken + '/', {
    headers: {
       "Cookie" :"csrf="+csrf+"; sessionid=" + sessionid +";",
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Referer': SERVER_URL,
       'X-CSRFToken': csrf
    }
  }).then((response) => response.json())
    .then((responseJson) => {
      if(responseJson == undefined){
        return
      }
      this.props.updateAddressScreen(false)
       this.setState({user:responseJson})
       this.createOrder(item)
    })
    .catch((error) => {
      this.props.updateAddressScreen(false)
      this.setState({loader:false})
      return
    });
  }
  getWalletTransition=async()=>{
    const userToken = await AsyncStorage.getItem('userpk');
    var redeemed =null
    await fetch(SERVER_URL + '/api/POS/wallettransition/?type=debit&user='+userToken)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ redeemed: responseJson })
        redeemed = responseJson
      })
      .catch((error) => {
        return
      });
      this.getGifts(redeemed)
  }

  redeemNow=(item)=>{
    if(item.coins>this.state.user.profile.walletValue){
        this.refs.toast.show('U Do Not Have Enough Coins.. ');
        return;
    }
    this.setState({selectedGift:item})
    this.props.navigation.navigate('AddressScreen',{},NavigationActions.navigate({ routeName: 'AddressScreen',params:{checkout:true} }))
  }

  showAddress=()=>{
    console.log(this.state.primaryAddress,'lllllll');
  }

  createOrder=async(item)=>{
    this.props.updateAddressScreen(false)
    if(item.coins>this.state.user.profile.walletValue){
      this.setState({loader:false})
        this.refs.toast.show('U Do Not Have Enough Coins.. ');
        return;
      }

    var user = await AsyncStorage.getItem('userpk');
    var sessionid = await AsyncStorage.getItem('sessionid');
    var csrf = await AsyncStorage.getItem('csrf');

    var data = {
       billingAddress:{
         street:'',
         city:'',
         state:'',
         pincode:0,
         country:'India',
         landMark:'',
         selectedGift:null
       },
       mobile:null,
       address:{
         billingStreet:this.state.primaryAddress.billingStreet,
         billingCity:this.state.primaryAddress.billingCity,
         billingState:this.state.primaryAddress.billingState,
         billingPincode:this.state.primaryAddress.billingPincode,
         billingCountry:this.state.primaryAddress.billingCountry,
         billingLandMark:this.state.primaryAddress.billingLandMark,
         title:this.state.primaryAddress.title,
         primary:this.state.primaryAddress.primary,
         city:this.state.primaryAddress.city,
         country : this.state.primaryAddress.country,
         landMark:this.state.primaryAddress.landMark,
         mobileNo:this.state.primaryAddress.mobileNo,
         pincode:this.state.primaryAddress.pincode,
         sameAsShipping:this.state.primaryAddress.sameAsShipping,
         state:this.state.primaryAddress.state,
         street:this.state.primaryAddress.street,
         pk:this.state.primaryAddress.pk

       },
       modeOfPayment:'gift',
       modeOfShopping:"online",
       paidAmount:0,
       store:this.state.store.pk,
       giftpk:this.state.selectedGift.pk
     }

     fetch(SERVER_URL + '/api/POS/createOrder/', {
       headers: {
         "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Referer': SERVER_URL,
         'X-CSRFToken':csrf
       },
       body: JSON.stringify(data),
       method: 'POST',
     })
     .then((response) =>{
       return response.json()
     })
     .then((responseJson) => {
       if(responseJson!=undefined){
         this.getWalletTransition()
         this.props.walletUpdate()
       }
       this.setState({loader:false})
    })
    .catch((error) => {
      this.setState({loader:false})
      return
    });

  }

  getGifts=(redeemed)=>{
    fetch(SERVER_URL + '/api/POS/gift/?available=true&store'+this.state.store.pk)
    .then((response) => response.json())
    .then((responseJson) => {
      responseJson.forEach((item)=>{
          item.redeem = false
      })
      if(redeemed!=null){
        var redeemPk = redeemed.map((i)=>{
          return i.gift.pk
        })
        responseJson.forEach((item)=>{
          if(redeemPk.includes(item.pk)){
            item.redeem = true
          }
        })
      }
      this.setState({ gifts: responseJson})

    })
    .catch((error) => {
      return
    });

  }
  handleScroll=(event)=>{
    Animated.event(
        [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
    )(event)
    this.props.scollUpdate(this.state.scrollY)
  }

  // redeemNow = async(item)=>{
  //   if(item.coins>this.state.user.profile.walletValue){
  //     this.refs.toast.show('U Do Not Have Enough Coins.. ');
  //     return;
  //   }
  //   var user = await AsyncStorage.getItem('userpk');
  //   var sessionid =  await AsyncStorage.getItem('sessionid');
  //   var csrf = await AsyncStorage.getItem('csrf');
  //   var data = {
  //      type:'debit',
  //      value:item.coins,
  //      gift:item.pk,
  //      user:user
  //   }
  //   await fetch(SERVER_URL + '/api/POS/wallettransition/',{
  //     method:'POST',
  //     headers:{
  //       "Cookie" :"csrftoken="+ csrf +";sessionid=" + sessionid + ";" ,
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //       'Referer': SERVER_URL,
  //       'X-CSRFToken': csrf
  //     },
  //     body:JSON.stringify(data)
  //   })
  //   .then((response) =>{return response.json()})
  //   .then((responseJson) => {
  //     this.getWalletTransition()
  //     this.props.walletUpdate()
  //
  //
  //   })
  //   .catch((error) => {
  //     return
  //   });
  // }

render(){
   var themeColor = this.state.store.themeColor

   if(!this.state.loader){
  return(
    <View style={{flex:1,}}>
    <Animated.ScrollView ref={ref => { this.scrollView = ref; }} style={{flex:1,paddingVertical: 15, }}
    onScroll={this.handleScroll} scrollEventThrottle={16}>
    <Animated.View style={{flex:1,marginTop:185}} >
    <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
    <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',paddingBottom:15,}}
    data={this.state.gifts}
    onScroll={this.handleScroll}
    keyExtractor={(item,index) => {
      return index.toString();
    }}
    nestedScrollEnabled={true}
    numColumns={2}
    renderItem={({item, index}) => (
      <Card  containerStyle={[styles.shadow, { marginLeft:10,marginRight:10,borderWidth: 1, borderColor: '#fff', marginTop: 10, marginBottom: 10,width:width*0.5-20,paddingHorizontal: 7,}]}>
        <View style={{flex:1}}>
          <View style={{alignItems: 'center',justifyContent: 'center'}}>
            <Image key = { index } style={{width:width*0.25 ,height:width*0.25 }} source={{uri:item.image}} />
          </View>
          <View style={{alignItems: 'center',justifyContent: 'center',height:60}}>
            <MonoText   style={{color:'#000',fontSize:14,fontWeight:'700'}} numberOfLines={2}>{item.name}</MonoText>
          </View>
          <View style={{flexDirection:'row',borderTopWidth: 1,borderTopColor:'#f2f2f2',}}>
            <View style={{flex:0.5,alignItems: 'flex-start',justifyContent:'center',marginTop:10}}>
              <MonoText   style={{color:'#000',fontSize:12,fontWeight:'700',marginTop:5}}>{item.coins} coins</MonoText>
            </View>
            <View style={{flex:0.5,alignItems: 'flex-end',justifyContent:'center',marginTop:10}}>
              {!item.redeem?<TouchableOpacity onPress={()=>{this.redeemNow(item)}} style={{paddingVertical:5,paddingHorizontal:10,borderRadius:10,borderWidth:1,borderColor:themeColor}}><MonoText   style={{color:themeColor,fontSize:12,fontWeight:'700'}}>Redeem</MonoText> </TouchableOpacity>:<View style={{flexDirection:'row',alignItems:'center'}}><MonoText   style={{marginRight:5,fontSize:12,color:'#000',fontWeight:'700'}}>Redeemed</MonoText> </View>}
            </View>
          </View>
        </View>
      </Card>
    )}
    />
    </Animated.View>

    </Animated.ScrollView>
    </View>
  )
}
else{
  return(
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <ActivityIndicator size="large" color={themeColor} />
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
    elevation: 5,
  }
})
