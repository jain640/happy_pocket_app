import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  View,
  Slider,
  ActivityIndicator,RefreshControl,FlatList,AsyncStorage,Picker,Dimensions,StatusBar,Keyboard,NativeModules,LayoutAnimation,
} from 'react-native';
import settings from '../constants/Settings.js';
import StoreDisplayCard from '../components/StoreDisplayCard';
import  Constants  from 'expo-constants';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { StackActions, NavigationActions } from 'react-navigation';
import {FontAwesome,Ionicons,MaterialIcons,FontAwesome5}from '@expo/vector-icons';
import { Dropdown } from 'react-native-material-dropdown-v2';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Card ,SearchBar , Icon} from 'react-native-elements';
import { MonoText } from '../components/StyledText';
import Loader from '../components/Loader';
import * as Network from 'expo-network';
import Modal from "react-native-modal";

const SERVER_URL = settings.url
const storeType = settings.storeType
const themeColor = settings.themeColor

const { UIManager } = NativeModules;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


const {width} = Dimensions.get('window');

class StoreScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return{
      header:null
    }
  }
  constructor(props) {
    super(props);
    store = this;
    this.state = {
      storeList:[],
      connectionStatus:'',
      refreshing:false,
      location: null,
      errorMessage: null,
      pincode:null,
      showList:false,
      list:[],
      landmark:props.landmark,
      landmarkList:[],
      selectedStore:null,
      loadingVisible:true,
      searchText:'',
      searchResult:[],
      landmarkItems:[],
      landMarkAll:[],
      selectedLandMark:props.selectedLandmark,
      refreshingitems:false,
      connectionSlow:false,
      modalShow:false,
      keyboardOffset:0,
      keyboardOpen:false
    }
    Keyboard.addListener(
    'keyboardDidHide',
    this.keyboardDidHide
   )
   Keyboard.addListener(
      'keyboardDidShow', this.keyboardDidShow
   )

  }

  keyboardDidShow=(event)=> {
    LayoutAnimation.easeInEaseOut();
        this.setState({
            keyboardOpen:true,keyboardOffset: event.endCoordinates.height+27,
        })
    }

    keyboardDidHide=()=> {
      LayoutAnimation.easeInEaseOut();
        this.setState({
            keyboardOpen:false,keyboardOffset: 27,
        })
}

    netInfo=()=>{
        NetInfo.addEventListener(state => {

        if(state.isConnected){
          this.handleConnectivityChange
        }else{
          this.setState({connectionStatus : "Offline"})
        }
      })
    }
   //
   // getLocationAsync = async () => {
   // let { status } = await Permissions.askAsync(Permissions.LOCATION);
   // if (status !== 'granted') {
   //   this.setState({
   //     errorMessage: 'Permission to access location was denied',
   //   });
   // }
   //
   //
   // let location = await Location.getCurrentPositionAsync({});
   //   this.setState({ location });
   //   this.getPlace(location)
   // }

  // getPlace=async(location)=>{
  //   Object {
  // "coords": Object {
  //   "accuracy": 29.051000595092773,
  //   "altitude": 0,
  //   "heading": 0,
  //   "latitude": 12.8852861,
  //   "longitude": 77.6559358,
  //   "speed": 0,
  // },
  // "mocked": false,
  // "timestamp": 1583235599049,
  // }
  // var lat = location.coords.latitude
  // var long = location.coords.longitude
  // var apiKey = 'AIzaSyCx0C4dHOHoJ5f7BOoHj7cu2p7-nX_6_pk'
  //   fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + long + '&key=' + apiKey)
  //       .then((response) => response.json())
  //       .then((responseJson) => {
  //           responseJson.results[0].address_components.forEach((i)=>{
  //             i.types.forEach((j)=>{
  //               if(j == "postal_code"){
  //                 this.getlandmark(i.long_name)
  //               }
  //             })
  //           })
  //
  //   })
  // }

  // getlandmark=async(pincode)=>{
  //   var selected = await AsyncStorage.getItem("selectedStore")
  //   this.setState({pincode:pincode})
  //   fetch(SERVER_URL + '/api/POS/store/')
  //    .then((response) => response.json())
  //    .then((responseJson) => {
  //      var show = false
  //      responseJson.forEach((i,idx)=>{
  //        if(i.pincode == pincode){
  //          this.getStore(i.pk)
  //          show = true
  //        }
  //        if(i.pk == selected){
  //          this.setState({selected:i.pincode})
  //        }
  //      })
  //      if(!show){
  //        this.setState({showList:true,list:responseJson,loadingVisible:false})
  //      }
  //    })
  //    .catch((error) => {
  //      return
  //    });
  // }






    componentDidMount=()=>{

      this.userAsync()
      this.setState({unsubscribe:NetInfo.addEventListener(state =>{
         this.handleConnectivityChange(state);
       })})



       if(storeType == 'MULTI-OUTLET'){
         var params = this.props.navigation.getParam('userSelect')
         if(params!=undefined){
            this.getLandmarkItems(true)
         }else{
           this.checkSelected()
         }
       }else{
         this.getMasterStore();
       }
    }

    getSelectedLandmark=(landmark)=>{
      fetch(SERVER_URL + '/api/POS/landmark/'+landmark+'/')
      .then((response) =>{
         if( response.status != 200){
           return undefined
         }else{
           return response.json()
         }
      })
      .then((responseJson) => {
        if(responseJson==undefined){
          this.getLandmarkItems(false)
          return
        }
          this.setState({selectedLandMark:responseJson})
          this.props.setSelectedStoreFunction(responseJson.store);
          this.props.setSelectedLandmark(responseJson);
          this.getMasterStore()
        })
        .catch((error) => {
          return
        });
    }

    checkSelected=async()=>{
     var landmark = await AsyncStorage.getItem("landmarkSelected")
        if(landmark==null){
          this.getLandmarkItems(false)
        }else{
          this.getSelectedLandmark(landmark)
        }
    }

    logout=()=>{
      AsyncStorage.removeItem('sessionid')
      AsyncStorage.removeItem('csrf')
      AsyncStorage.removeItem('counter')
      AsyncStorage.removeItem('masterStore')
      AsyncStorage.removeItem('unitTypes')
      AsyncStorage.removeItem('myStorePK')
      AsyncStorage.removeItem('storeRole')
      AsyncStorage.removeItem('userpk')
      AsyncStorage.removeItem('profilePK')
      AsyncStorage.setItem("login", JSON.stringify(false))
      return
    }

    userAsync = async() => {

      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      if(userToken!=null){
      fetch(SERVER_URL + '/api/HR/userSearch/?mode=mySelf', {
        headers: {
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Accept': 'application/json',
           'Content-Type': 'application/json',
           'Referer': SERVER_URL,
           'X-CSRFToken': csrf
        }
      }).then((response) =>{
        if(response.status == 200){
          return response.json()
        }else{
          return undefined
        }
      })
      .then((responseJson)=>{
        if(responseJson==undefined){
          this.logout()
          return
        }else{
          return
        }
      })
      .catch((error) => {
        this.logout()
      });
    }else{
        this.logout()
        return
      }
    };

    // dropDownChange=(value,index)=>{
    // }

    // checkStoreSelected=async(bool)=>{
    //  var store = await AsyncStorage.getItem("selectedStore")
    //   if(storeType == 'MULTI-OUTLET'){
    //     if(store==null){
    //       if(bool){
    //         this.getlandmark(null)
    //       }
    //     }else{
    //       this.setState({selectedStore:store});
    //
    //       this.getStoreDetails(store)
    //     }
    //   }else{
    //     this.getMasterStore()
    //   }
    // }

    onRefresh=()=>{
      NetInfo.fetch().then(state => {
        if(state.isConnected){
             this.userAsync()
              if(storeType == 'MULTI-OUTLET'){
                var params = this.props.navigation.getParam('userSelect')
                if(params!=undefined){
                   this.getLandmarkItems(true)
                }else{
                  this.checkSelected()
                }
              }else{
                this.getMasterStore();
              }
        }else{
          this.setState({connectionStatus : "Offline"})
         }
      })
    }

    getMasterStore = ()=>{
      console.log('ffffffffffffffffffff');
        fetch(SERVER_URL + '/api/POS/getMasterStore/')
        .then((response) => {return response.json()})
        .then((responseJson) => {
            console.log(responseJson,'ffffffffffffffffffff');
          if(storeType == 'MULTI-OUTLET'){
            this.props.setStoreFunction(responseJson.masterStore);
            responseJson.unitTypes.push('Size and Color','Color','Quantity and Color')
            this.props.setServerParamsFunction(responseJson.masterStore,responseJson.unitTypes,responseJson.bankList)
            this.props.navigation.navigate('Main')
          }else{
            responseJson.unitTypes.push('Size and Color','Color','Quantity and Color')
            this.props.setStoreFunction(responseJson.masterStore);
            this.props.setSelectedStoreFunction(responseJson.masterStore);
            this.props.setServerParamsFunction(responseJson.masterStore,responseJson.unitTypes,responseJson.bankList)
            this.props.navigation.navigate('Main')
          }
        })
        .catch((error) => {
          return
        });

    }


//   getStoreDetails=(store)=>{
//     try {
//
//       fetch(SERVER_URL + '/api/POS/store/'+store+'/')
//       .then((response) => response.json())
//       .then((responseJson) => {
//         this.props.setSelectedStoreFunction(responseJson)
//         this.getMasterStore()
//
//         })
//
//     } catch (error) {
//             return
//     }
//
// }



    clearCart = async () => {
      AsyncStorage.removeItem('cart')
      AsyncStorage.removeItem('counter')
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      const login = await AsyncStorage.getItem('login');
      if(JSON.parse(login)){


        await fetch(SERVER_URL + '/api/POS/cart/?user='+userToken+'&clearCart=221', {
          headers: {
             "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'Referer': SERVER_URL,
             'X-CSRFToken': csrf
          }
        }).then((response) => response.json()).then(()=>{
           this.getMasterStore()
        })
          .catch((error) => {
            return
          });
        }else{
          this.getMasterStore()
        }
    }
    showNoInternet=()=>{
      if(this.refs.toast!=undefined){
        this.refs.toast.show('No Internet Connection')
      }
    }


    componentWillUnmount() {
      var unsubscribe = this.state.unsubscribe;
      unsubscribe()
    }
     handleConnectivityChange =async (state) => {
           var isReachable = await Network.getNetworkStateAsync();
          if(state.isConnected&&isReachable.isInternetReachable){
            this.setState({connectionStatus : "Online",connectionSlow:false})

          }else if(state.isConnected&&!isReachable.isInternetReachable){
            this.setState({connectionStatus : "Offline",connectionSlow:true})
            this.showNoInternet()
          }else{
            this.setState({connectionStatus : "Offline",connectionSlow:false})
            this.showNoInternet()
          }
      };

 search=(text)=>{
   this.setState({searchText:text})
   if(text.length>0){
   fetch(SERVER_URL + '/api/POS/landmark/?search='+text)
   .then((response) => response.json())
   .then((responseJson) => {
       this.setState({landmarkItems:responseJson})
     })
     .catch((error) => {
       return
     });
   }else{
     this.setState({landmarkItems:this.state.landMarkAll})
   }
 }

 getLandmarkItems=async(bool)=>{
   this.setState({refreshingitems:true})
   var landmark = await AsyncStorage.getItem("landmarkSelected")
   await fetch(SERVER_URL + '/api/POS/landmark/')
   .then((response) => response.json())
   .then((responseJson) => {
       this.setState({landmarkItems:responseJson,landMarkAll:responseJson,showList:true})
       responseJson.forEach((i)=>{
         this.setState({refreshingitems:false})
         if(i.pk==landmark){
           this.setState({selectedLandMark:i})
           this.props.setSelectedStoreFunction(i.store);
           this.props.setSelectedLandmark(i);
           if(!bool){
             this.getMasterStore()
           }else{
             this.setState({showList:true})
           }
         }else{
           this.setState({showList:true})
         }
       })
     })
     .catch((error) => {
       this.setState({refreshingitems:false})
       return
     });
 }

 selectLandmark=(item)=>{
   this.setState({showList:false})
   this.setState({selectedLandMark:item})
   this.props.setSelectedStoreFunction(item.store);
   this.props.setSelectedLandmark(item);
   this.props.setSelectedLandmark(item);
   this.props.selectedAddressFunction({})
   if(this.state.selectedLandMark!=null&&this.state.selectedLandMark.pk==item.pk){
     this.getMasterStore()
   }else{
     this.clearCart()
   }


 }

 successModal =()=>{
   return(
     <Modal isVisible={this.state.modalShow} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>this.setState({modalShow:false})} onBackdropPress={()=>{this.setState({modalShow:false,})}} >
       <View style={[styles.modalView,{}]}>
          <View style={{paddingVertical:10,paddingHorizontal:15,zIndex:99,alignItems:'center',backgroundColor:'#fff'}}>
           <View style={{flexDirection:'row'}}>
              <MonoText style={{color:'grey',fontSize:16,marginTop:10,lineHeight:25}}>We have received your request. We will call you soon. Thank you
                <Text style={{paddingTop:5,textAlign:'center',alignSelf:'center'}}> <FontAwesome5 name="laugh" size={20} color={themeColor} /></Text>
              </MonoText>
           </View>
           <TouchableOpacity onPress={()=>this.setState({modalShow:false})} style={{marginVertical:15,marginHorizontal:20,alignItems:'flex-end',justifyContent:'flex-end'}}>
            <MonoText style={{color:'#000',fontSize:18,fontWeight:'700',}}>OK</MonoText>
           </TouchableOpacity>
        </View>
       </View>
     </Modal>
   )
 }

 setModal=()=>{
   this.setState({modalShow:true})
 }

  render() {
    var {loadingVisible} = this.state
    var {selectedLandMark} = this.state
    var themeColor = this.props.store.themeColor
    if(selectedLandMark==null){
      selectedLandMark = {pk:null}
    }

    let list = this.state.list.map( (s, i) => {
       return {label:s.pincode +'  '+ s.name, value:s.pk}
    });
      if(this.state.connectionStatus=="Offline"){
        return(
          <ScrollView contentContainerStyle={{flex:1,justifyContent: 'center',alignItems: 'center'}} refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={()=>this.onRefresh()}
            colors={['#000']}
            tintColor="#fff"
            titleColor="#fff"
          />}>
            <View style={{height:Constants.statusBarHeight,backgroundColor:'#142e5c'}} />
            <MonoText   style={{fontSize:22,color:'#000',fontWeight:'700',textAlign:'center',paddingHorizontal:10}}>{this.state.connectionSlow?'It seems your Internet was very slow for Better Experience Switch To Better Network':'No Internet Connection'}</MonoText>
            <FontAwesome name={'refresh'} size={18} color={'#000'}/>
          </ScrollView>
        )
      }else{
        if(!this.state.showList){
          return (
            <View style={{flex:1}}>
            <View style={{height: Constants.statusBarHeight,  backgroundColor: themeColor}} >
            <StatusBar  translucent={true} barStyle="light-content" backgroundColor={themeColor} networkActivityIndicatorVisible={false}    />
            </View>
            <View style={{flex:1,justifyContent: 'center',alignItems: 'center',backgroundColor:themeColor}}>
              <Loader
              modalVisible = {loadingVisible}
              animationType="fade"
              />
              <ActivityIndicator size="large" color={'black'} />
            </View>
            </View>
          );
        }else{
          return(
            <View style={{flex:1,backgroundColor: themeColor}}>
              <View style={{height: Constants.statusBarHeight,  backgroundColor: themeColor}} >
              <StatusBar  translucent={true} barStyle="light-content" backgroundColor={themeColor} networkActivityIndicatorVisible={false}    />
              </View>
              {settings.storeType == 'MULTI-OUTLET' &&
                <View style={{}}>
                   <Image source={require('../assets/images/happypockets.jpeg')} style={{ width:width,height:60,}}/>
                </View>
              }
              {!this.state.keyboardOpen&&<View style={{alignItems:'center',justifyContent:'center',marginTop:20,marginHorizontal:45,}}>
              <MonoText   style={{color:'#000',fontSize:25,fontWeight:'700'}}>You are 90 minutes away from your first delivery!</MonoText>
               </View>
             }
              {!this.state.keyboardOpen&&<View style={{alignItems:'flex-start',justifyContent:'flex-start',marginTop:20,marginHorizontal:15}}>
              <MonoText   style={{color:'#000',fontSize:18,fontWeight:'700'}}>Choose your apartment</MonoText>
               </View>
             }
              <View style={{flexDirection:'row',marginVertical:15,marginHorizontal:15,backgroundColor:'#f2f2f2',borderRadius:5}}>
                  <TouchableOpacity onPress={()=>this.input.focus()} style={{flex:0.2,justifyContent:'center',alignItems:'center'}}>
                      <FontAwesome name={'search'} size={20} color={'grey'} />
                  </TouchableOpacity>
                  <View style={{flex:0.8,justifyContent:'center',borderRadius:5}}>
                    <TextInput ref={(ref)=>this.input=ref} style={{height:50,width:'100%',paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:16,color:'#000',borderRadius:5}}
                        onChangeText={(searchText)=>{if(searchText.length==0){this.setState({searchText:searchText,landmarkItems:this.state.landMarkAll});return}else{this.search(searchText)};this.setState({searchText:searchText})}}  value={this.state.searchText} placeholder="Search by society or pincode">
                    </TextInput>
                  </View>
              </View>
              <View style={{backgroundColor:'#fff'}}>
                <MonoText   style={{color:'#000',fontSize:14,fontWeight:'700',marginVertical:20,marginHorizontal:15,}}>SOCIETIES NEAR YOU</MonoText>
              </View>
              <ScrollView  style={{flex:1,paddingBottom:15, backgroundColor: "#fff",}} contentContainerStyle={{paddingBottom:60}} refreshControl={
              <RefreshControl
                refreshing={this.state.refreshingitems}
                onRefresh={()=>this.getLandmarkItems(true)}
                colors={['#efa834']}
                tintColor="#fff"
                titleColor="#fff"
              />}>
                <FlatList
                  data={this.state.landmarkItems}
                  extraData={this.state}
                  keyExtractor={(item, index) => {
                    return index.toString();
                  }}
                   renderItem={({item, index}) => (
                    <TouchableOpacity onPress={()=>{this.selectLandmark(item)}} style={{backgroundColor:selectedLandMark.pk==item.pk?'#f2f2f2':'#fff',paddingVertical:15,borderBottomWidth:selectedLandMark.pk==item.pk?0:1,borderColor:'#f2f2f2',paddingHorizontal:15}}>
                        <MonoText   style={{color:'#000',fontSize:18,fontWeight:'700'}}>{item.landmark}</MonoText>
                        <MonoText   style={{color:'grey',fontSize:16,marginTop:5}}>{item.city} - <MonoText   style={{fontSize:14}}>{item.pincode}</MonoText> </MonoText>
                    </TouchableOpacity>
                  )}
                />
              </ScrollView>

              <View style={{position:'absolute',right:20,bottom:20}}>
                  <TouchableOpacity onPress={()=>this.props.navigation.navigate('RequestForm',{onGoBack:this.setModal})} style={[styles.shadow,{paddingVertical:7,paddingHorizontal:20,borderRadius:15,backgroundColor:themeColor}]}>
                    <MonoText   style={{color:'#fff',fontSize:16}}>+ Request Apartment</MonoText>
                  </TouchableOpacity>
              </View>

              {this.successModal()}

            </View>
          )
        }
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
    elevation: 2,
  },
  modalView: {
     backgroundColor: '#fff',
     marginHorizontal: width*0.03 ,
     borderRadius:5,
    },

});

const mapStateToProps =(state) => {
  return {
    store:state.cartItems.store,
    landmark:state.cartItems.landmark,
    selectedLandmark:state.cartItems.selectedLandmark,
    setSelectedStore:state.cartItems.setSelectedStore
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    setStoreFunction:  (args) => dispatch(actions.setStore(args)),
    setSelectedStoreFunction:  (args) => dispatch(actions.setSelectedStore(args)),
    setStoreTypeFunction:  (args) => dispatch(actions.setStoreType(args)),
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    setSelectedLandmark:  (landmark) => dispatch(actions.selectedLandmark(landmark)),
    setServerParamsFunction:  (masterStore,unitTypes,bankList) => dispatch(actions.setServerParams(masterStore,unitTypes,bankList)),
    selectedAddressFunction:(address)=>dispatch(actions.selectedAddress(address)),
    removeSelectedAddressFunction:()=>dispatch(actions.removeSelectedAddress()),

  };
}


export default connect(mapStateToProps, mapDispatchToProps)(StoreScreen);

// <View style={{height: Constants.statusBarHeight,  backgroundColor: themeColor}} />
// <View style={{alignItems:'flex-start',marginTop:30,marginLeft:10}}><MonoText   style={{color:'#fff',fontSize:30,fontWeight:'700'}}>Hi,</MonoText> </View>
// <View style={{alignItems:'flex-start',marginTop:10,marginLeft:10}}><MonoText   style={{color:'#fff',fontSize:30,fontWeight:'700'}}>Select NearBy Happy Store :)</MonoText> </View>
// <ScrollView style={{flex:1,marginTop:50,marginLeft:1,marginRight:1}}>
// <FlatList
//   data={this.state.list}
//   keyExtractor={(item, index) => {
//     return index.toString();
//   }}
//   renderItem={({item, index}) => (
//     <StoreDisplayCard multiOutletStore ={item} navigation={this.props.navigation} onChange={ (args)=> this.getStore(args)}></StoreDisplayCard>
//   )}
// />
// </ScrollView>
