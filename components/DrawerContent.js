import React from 'react';
import { Platform ,AsyncStorage,StyleSheet,ScrollView,View,Image,Dimensions,StatusBar,Alert,TouchableOpacity,TouchableNativeFeedback,Picker,Share, ImageBackground} from 'react-native';
import { createBottomTabNavigator,createAppContainer,createSwitchNavigator,NavigationActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator,DrawerItems } from 'react-navigation-drawer';
import Constants from 'expo-constants';
import SafeAreaView from 'react-native-safe-area-view';
import { FontAwesome ,MaterialCommunityIcons,MaterialIcons,SimpleLineIcons,AntDesign, Feather} from '@expo/vector-icons';
import constants  from '../constants/Settings.js';
import { Dropdown } from 'react-native-material-dropdown-v2';
import { Text, TouchableRipple } from 'react-native-paper';
const mainUrl = constants.url;
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import { MonoText } from './StyledText';
import Toast, {DURATION} from 'react-native-easy-toast';
import * as actionTypes from '../actions/actionTypes';
import settings from '../constants/Settings';
const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');
const SERVER_URL = settings.url
const themeColor = settings.themeColor
const appName = settings.title
const storeType = settings.storeType
const sellerZone = settings.sellerZone
const shareMessage = settings.shareMessage

const playStoreUrl = settings.playStoreUrl
const appStoreUrl = settings.appStoreUrl


class DrawerContent  extends React.Component {

    constructor(props) {
        super(props);
        store = this
        this.state ={
          name:'',
          login:false,
          store:props.store,
          is_staff:false,
          userStore:null,
          displayPicture:null,
          landmarkList:[],
          dropdownShow:false,
          selectedStore:props.selectedStore,
          selectedLandmark:props.selectedLandmark,
        }
    }

    gotoCategories = ()=>{
      this.props.navigation.closeDrawer();
      this.props.navigation.navigate('CategoriesScreen', {
        color: this.state.primaryColor
      })
    }
    gotoDiscoverScreen = ()=>{
      this.props.navigation.closeDrawer();
      this.props.navigation.navigate('DiscoverSellerScreen', {
        color: this.state.primaryColor
      })
    }
    gotoChatScreen = async()=>{
      var login = await AsyncStorage.getItem("login")
       if(JSON.parse(login)){
         // if(this.state.myStore.pk!=undefined){
        this.props.navigation.navigate('ChatListScreen', {
          color: this.state.primaryColor
         })
         // }else{
         //   this.props.navigation.navigate('NewStore')
         // }
       }else{
         this.login()
       }
    }

    gotorefer = () => {
      this.props.navigation.closeDrawer();
      this.props.navigation.navigate('ReferEarn', {
        color: this.state.store.themeColor
      });
    }
    gotoProfile = ()=>{
      this.props.navigation.closeDrawer();
      this.props.navigation.navigate('ProfileScreen', {
        color: this.state.store.themeColor
      })
    }
    gotoHome = ()=>{
      this.props.navigation.closeDrawer();
      this.props.navigation.navigate('HomeScreen');
    }

    checkout=async()=>{
      var login = await AsyncStorage.getItem("login")
   
       if(JSON.parse(login)){
         if(this.props.counter > 0){
           this.props.navigation.navigate('CheckoutProducts', {
             color: this.state.primaryColor
         })
       }else{
           this.refs.toast.show('No Items Added in the Cart ')
         }
       }else{
         this.login()
       }
     }

    getUserAsync = async () => {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      if(userToken == null){
        return
      }

      fetch(mainUrl+'/api/HR/users/'+ userToken + '/', {
        headers: {
          "Cookie" :"csrf="+csrf+"; sessionid=" + sessionid +";",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': mainUrl,
          'X-CSRFToken': csrf
        }
      }).then((response) => response.json())
      .then((responseJson) => {
        AsyncStorage.setItem('first_name',JSON.stringify(responseJson.first_name))
        AsyncStorage.setItem('last_name',JSON.stringify(responseJson.last_name))
        AsyncStorage.setItem('user_name',JSON.stringify(responseJson.username))
        this.setState({first_name:responseJson.first_name,last_name:responseJson.last_name,is_staff:responseJson.is_staff,userStore:responseJson.store,displayPicture:responseJson.profile.displayPicture})
      })
      .catch((error) => {
        return
      });
    }

    UNSAFE_componentWillReceiveProps() {
      // StatusBar.setTranslucent( true)
        AsyncStorage.getItem('login').then(userToken => {
          if(userToken == 'true' || userToken == true){
            this.setState({login:true})
            this.getUserAsync()
            this.getStore();
          }else{
            this.setState({login:false})
          }
        }).done();
    }
    componentDidMount=()=>{
      console.log(Constants,'dbvbnsdbjk');
      this.getUserAsync();
      this.getStore();
    }


    onShare = async () => {
      // const playStoreUrl = 'https://play.google.com/store/apps/details?id='+'in.cioc.happypockets'+'&hl=en';
      // const appStoreUrl = 'https://itunes.apple.com/91lookup?bundleId=in.cioc.happypockets';
      try {
        const result = await Share.share({
          message: shareMessage+'\n\nFor Android device: '+playStoreUrl+'\n\nFor IOS device: '+appStoreUrl,
        });

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        alert(error.message);
      }
    };



    setSelectedStore=async()=>{
      var store = await AsyncStorage.getItem('selectedStore');
      if(store != null){
        await fetch(SERVER_URL+'/api/POS/store/',{
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Referer': SERVER_URL
          },
        }).then((response) =>{
          return  response.json()}
        ).then((responseJson) => {
            this.setState({selectedStore:responseJson})
        }).catch((error) => {
            return
        });
      }
    }

    getlandmark=async()=>{
        var csrf = await AsyncStorage.getItem('csrf');
        const userToken = await AsyncStorage.getItem('userpk');
        const sessionid = await AsyncStorage.getItem('sessionid');
        await fetch(SERVER_URL+'/api/POS/landmark/',{
          method: 'GET',
          headers: {
            "Cookie" :"csrf="+csrf+";sessionid=" + sessionid+";",
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken':csrf,
            'Referer': SERVER_URL
          },
        }).then((response) =>
           response.json()
        ).then((responseJson) => {
            this.setState({ landmarkList: responseJson})
        }).catch((error) => {
            return
        });
    }

    getStore=async()=>{
        var csrf = await AsyncStorage.getItem('csrf');
        const userToken = await AsyncStorage.getItem('userpk');
        const sessionid = await AsyncStorage.getItem('sessionid');
        await fetch(SERVER_URL+'/api/POS/store/?owner='+userToken,{
          method: 'GET',
          headers: {
            "Cookie" :"csrf="+csrf+";sessionid=" + sessionid+";",
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken':csrf,
            'Referer': SERVER_URL
          },
        }).then((response) =>
           response.json()
        ).then((responseJson) => {
            this.setState({ Storepk: responseJson[0].pk})
        }).catch((error) => {
            return
        });
    }


    logout = ()=>{
        Alert.alert('Log out','Do you want to logout?',
            [{text: 'Cancel', onPress: () => {
                return null
              }},
              {text: 'Confirm', onPress: () => {
                // AsyncStorage.clear();
                AsyncStorage.removeItem('userpk')
                AsyncStorage.removeItem('sessionid')
                AsyncStorage.removeItem('csrf')
                AsyncStorage.removeItem('cart')
                AsyncStorage.removeItem('counter')
                AsyncStorage.removeItem('myStorePK')
                AsyncStorage.removeItem('storeRole')
                AsyncStorage.removeItem('totalAmount')
                AsyncStorage.removeItem('saved')
                this.props.setInitialFunction([],0,0)
                AsyncStorage.setItem("login", JSON.stringify(false))
                this.setState({login:false})
                this.getUserAsync()
                this.props.navigation.closeDrawer();
                this.props.navigation.navigate('HomeScreen', {'login':false}, NavigationActions.navigate({ routeName: 'Home' }))
              }},
          ],
          { cancelable: false }
        )
    }



    storeSelection=()=>{
      this.props.navigation.navigate('StoreScreen',{userSelect:true})
    }



    render(){
      var routeName = this.props.items.find(it => it.key === this.props.activeItemKey)
      var themeColor = '#000';//this.props.store.themeColor;
      let fontWeight = 500;
      var {counter} = this.props
      counter = counter.toString()

      return(
        <View style={{height:'100%'}}>
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
            <SafeAreaView style={{flex: 1}} forceInset={{ top: 0}}>
              {Platform.OS === 'android' &&
                <View style={{height: Constants.statusBarHeight,  backgroundColor: themeColor,}}>
                  <StatusBar  translucent={true} barStyle="light-content" backgroundColor={themeColor} networkActivityIndicatorVisible={false}    />
                </View>
              }
              {Platform.OS === 'ios' &&
                <View style={{height: Constants.statusBarHeight,  backgroundColor: themeColor,}}>
                  <StatusBar barStyle="light-content" backgroundColor={themeColor}  />
                </View>
              }
              <View style={{ backgroundColor: themeColor, height:storeType=="MULTI-OUTLET"?180:180, flexDirection:'row',alignItems:storeType=="MULTI-OUTLET"?'flex-start':'flex-start',paddingTop:storeType=="MULTI-OUTLET"?10:10 }}>
                <ImageBackground source={require('../assets/images/Profile_Background.png')} resizeMode="cover" style={{width:'100%', height:115, justifyContent:'center', top:0}}>                  
                </ImageBackground>
                <View style={{ position:'absolute', backgroundColor:'#E5E5E5', left:0,top:125, width:'100%', height:55, flexDirection:'row', flexWrap:'wrap'}}>
                  {this.state.login&&this.state.displayPicture!=null&&
                    <Image
                      source={this.state.displayPicture!=null&&this.state.displayPicture.length>0?{uri:this.state.displayPicture}:null}
                      style={{ position:'absolute', width:100,height: 100, backgroundColor:'rgba(0,0,0,0.6)', marginLeft:15, left:33, top:-61, justifyContent:'center',}}
                    />
                  }
                  {!this.state.login&&this.state.displayPicture==null&&
                    <View style={{ position:'absolute', width:100,height: 100, backgroundColor:'rgba(0,0,0,0.6)', marginLeft:15, left:33, top:-61, justifyContent:'center', textAlign:'center'}}>
                      <FontAwesome name={'user-circle'} size={78} color={'#fff'}/>
                    </View>
                  }
                  {this.state.login&&
                    <View style={{position:'absolute',justifyContent:'center', top:0, left:157, }}>
                    <MonoText numberOfLines={1}  style={{color:'#000',fontSize:24, fontWeight:"700", paddingTop:storeType=="MULTI-OUTLET"?0:0}} >{this.state.first_name} {this.state.last_name}</MonoText>
                    </View>
                  }
                  {/*this.state.login&&
                    <TouchableOpacity onPress={()=>{console.log('Pressed');this.props.navigation.closeDrawer();this.props.navigation.navigate('MyAccount')}} style={{justifyContent:'center', position:'absolute', right:10, top: 127}}>
                      <FontAwesome name={'pencil'} color={'#000'} size={20} />
                    </TouchableOpacity>
                  */}
                  {storeType == 'MULTI-OUTLET' && this.state.selectedLandmark!=null&&
                    <View style={{position:'absolute', left:157,top:30, flex:1, flexDirection:'row', flexWrap:'wrap', width:'60%', justifyContent:'space-between'}}>
                      <View style={{paddingBottom:10}}>
                        <MonoText   style={{color:'#000', fontSize:16, fontWeight:'600'}} noOfLines={1}>{this.state.selectedLandmark.landmark}</MonoText>
                      </View>
                      <TouchableOpacity onPress={()=>{this.props.navigation.closeDrawer();this.props.navigation.navigate('MyAccount')}} style={{alignItems:'flex-end', flexDirection:'column-reverse', justifyContent:'center'}}>
                          {/*<MonoText   style={{color:'#000',fontSize:18}} noOfLines={1}>Edit</MonoText>*/}
                          <FontAwesome name={'pencil'} color={'#000'} size={20} />
                      </TouchableOpacity>
                      
                    </View>
                  }
                </View>
              </View>
              <View style={{flex:1,minHeight: height-230, backgroundColor:'#fff'}}>
                <DrawerItems {...this.props} inactiveTintColor={themeColor} activeTintColor={themeColor} iconContainerStyle={{color:'#000',opacity:1}}/>

                {!this.state.login&&Platform.OS === 'android' &&
                  <TouchableNativeFeedback  centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.props.navigation.navigate('LogInScreen')}}>
                      <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                    backgroundColor: routeName.routeName=='LogInScreen'?'#f2f2f2':'#fff'}}>
                          <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                              <FontAwesome name="sign-in" size={25} color={routeName.routeName=='LogInScreen'?themeColor:themeColor} />
                          </View>
                          <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                              <MonoText   style={{color:routeName.routeName=='LogInScreen'?themeColor:themeColor,
                                            fontWeight:'700', }} >Login</MonoText>
                          </View>
                      </View>
                  </TouchableNativeFeedback>}
                {!this.state.login&&Platform.OS === 'ios' &&
                  <TouchableOpacity     onPress={()=>{this.props.navigation.navigate('LogInScreen')}}>
                      <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                    backgroundColor: routeName.routeName=='LogInScreen'?'#f2f2f2':'#fff'}}>
                          <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                              <FontAwesome name="sign-in" size={25} color={routeName.routeName=='LogInScreen'?themeColor:themeColor} />
                          </View>
                          <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                              <MonoText   style={{color:routeName.routeName=='LogInScreen'?themeColor:themeColor,
                                            fontWeight:'700', }} >Login</MonoText>
                          </View>
                      </View>
                  </TouchableOpacity>}

                {this.state.login&&Platform.OS === 'android' &&
                  <TouchableNativeFeedback  centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.props.navigation.navigate('OrderDetailsScreen')}}>
                      <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                    backgroundColor: routeName.routeName=='OrderDetailsScreen'?'#f2f2f2':'#fff'}}>
                          <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                              <Feather name="box" size={23} /*color={routeName.routeName=='OrderDetailsScreen'?themeColor:themeColor} *//>
                          </View>
                          <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                              <MonoText   style={{/*color:routeName.routeName=='OrderDetailsScreen'?themeColor:themeColor,*/
                                            fontWeight:'500'}} >Orders</MonoText>
                          </View>
                      </View>
                  </TouchableNativeFeedback>}
                {this.state.login&&Platform.OS === 'ios' &&
                  <TouchableOpacity    onPress={()=>{this.props.navigation.navigate('OrderDetailsScreen')}}>
                      <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                    backgroundColor: routeName.routeName=='OrderDetailsScreen'?'#f2f2f2':'#fff'}}>
                          <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                              <Feather name="box" size={23} /*color={routeName.routeName=='OrderDetailsScreen'?themeColor:themeColor} *//>
                          </View>
                          <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                              <MonoText   style={{/*color:routeName.routeName=='OrderDetailsScreen'?themeColor:themeColor,*/
                                            fontWeight:'500'}} >Orders</MonoText>
                          </View>
                      </View>
                  </TouchableOpacity>}

                {this.state.login&&Platform.OS === 'android' &&
                <TouchableNativeFeedback  centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.props.navigation.navigate('AddressScreen',{},NavigationActions.navigate({ routeName: 'AddressScreen',params:{checkout:false} }))}}>
                    <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                  backgroundColor: routeName.routeName=='AddressScreen'?'#f2f2f2':'#fff'}}>
                        <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                            <FontAwesome name="address-card" size={22} color={routeName.routeName=='AddressScreen'?'#000000':'#000000'} />
                        </View>
                        <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                            <MonoText   style={{color:routeName.routeName=='AddressScreen'?'#000000':'#000000',
                                          fontWeight:'500'}} >Address</MonoText>
                        </View>
                    </View>
                </TouchableNativeFeedback>}
                {this.state.login&&Platform.OS === 'ios' &&
                <TouchableOpacity  centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.props.navigation.navigate('AddressScreen',{},NavigationActions.navigate({ routeName: 'AddressScreen',params:{checkout:false} }))}}>
                    <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                  backgroundColor: routeName.routeName=='AddressScreen'?'#f2f2f2':'#fff'}}>
                        <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                            <FontAwesome name="address-card" size={22} color={routeName.routeName=='AddressScreen'?'#000000':'#000000'} />
                        </View>
                        <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                            <MonoText   style={{color:routeName.routeName=='AddressScreen'?'#000000':'#000000',
                                          fontWeight:'500'}} >Address</MonoText>
                        </View>
                    </View>
                </TouchableOpacity>}

                {storeType=='MULTI-VENDOR'&&sellerZone&&this.state.login &&this.state.selectedStore!=null &&Platform.OS === 'android' &&
                  <TouchableNativeFeedback  centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.props.storeRole==null?
                    this.props.navigation.navigate('Instructions'):(!this.state.is_staff?this.props.navigation.navigate('Instructions'): this.props.navigation.navigate('SellerZone', {}, NavigationActions.navigate({ routeName: 'SellerZone' })))}}>
                      <View style={{flexDirection: 'row',paddingVertical:10,paddingBottom: 10,borderTopWidth:1,borderBottomWidth:1,borderColor:'#f2f2f2',
                                    backgroundColor: routeName.routeName=='SellerZone'?'#f2f2f2':routeName.routeName=='NewStore'?'#f2f2f2':'#fff'}}>
                          <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                              {/* <FontAwesome name="shopping-bag" size={23} color={routeName.routeName=='SellerZone'?themeColor:routeName.routeName=='NewStore'?themeColor:themeColor} /> */}
                                <Image source={require('../assets/images/house_1.png')} style={{height:22,width:22,}}  />
                                {/* tintColor:routeName.routeName=='SellerZone'?themeColor:routeName.routeName=='NewStore'?themeColor:themeColor */}
                          </View>
                          <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                              <MonoText   style={{color:routeName.routeName=='SellerZone'?themeColor:routeName.routeName=='NewStore'?'#000000':'#000000',
                                            fontWeight:'500'}} >Seller Zone</MonoText>
                          </View>
                      </View>
                  </TouchableNativeFeedback>}

                {storeType=='MULTI-VENDOR'&&Platform.OS === 'android' &&
                <TouchableNativeFeedback  centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.props.navigation.navigate('RequestPost',{},NavigationActions.navigate({ routeName: 'AddressScreen',params:{checkout:false} }))}}>
                    <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                  backgroundColor: routeName.routeName=='RequestPost'?'#f2f2f2':'#fff'}}>
                        <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                            <AntDesign name="form" size={22} color={routeName.routeName=='RequestPost'?'#000000':'#000000'} />
                        </View>
                        <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                            <MonoText   style={{color:routeName.routeName=='RequestPost'?'#000000':'#000000',
                                          fontWeight:'500'}} >Post Your Request Now</MonoText>
                        </View>
                    </View>
                </TouchableNativeFeedback>}

                {Platform.OS === 'android' &&
                  <TouchableNativeFeedback centered={true} background={TouchableNativeFeedback.Ripple('grey')}  onPress={()=>{this.props.navigation.navigate('FaqScreen')}}>
                        <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                      backgroundColor: routeName.routeName=='FaqScreen'?'#f2f2f2':'#fff'}}>
                            <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                                <FontAwesome color={routeName.routeName=='FaqScreen'?'#000000':'#000000'}
                                            name="question"
                                            size={23}/>
                            </View>
                            <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                                <MonoText   style={{color:routeName.routeName=='FaqScreen'?'#000000':'#000000',
                                              fontWeight:'500'}} >FAQ</MonoText>
                            </View>
                        </View>
                  </TouchableNativeFeedback>
                }
                {Platform.OS === 'ios' &&
                  <TouchableOpacity  onPress={()=>{this.props.navigation.navigate('FaqScreen')}}>
                        <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                      backgroundColor: routeName.routeName=='FaqScreen'?'#f2f2f2':'#fff'}}>
                            <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                                <FontAwesome color={routeName.routeName=='FaqScreen'?'#000000':'#000000'}
                                            name="question"
                                            size={23}/>
                            </View>
                            <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                                <MonoText   style={{color:routeName.routeName=='FaqScreen'?'#000000':'#000000',
                                              fontWeight:'500'}} >FAQ</MonoText>
                            </View>
                        </View>
                  </TouchableOpacity>
                }
                {Platform.OS === 'android' &&
                  <TouchableNativeFeedback centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.state.login?
                    this.props.navigation.navigate('Support'):this.props.navigation.navigate('LogInScreen')}}>
                        <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                      backgroundColor: routeName.routeName=='Support'?'#f2f2f2':'#fff'}}>
                            <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                                <FontAwesome color={routeName.routeName=='Support'?'#000000':'#000000'}
                                            name="support"
                                            size={23}/>
                            </View>
                            <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                                <MonoText   style={{color:routeName.routeName=='Support'?'#000000':'#000000',
                                              fontWeight:'500'}} >Help</MonoText>
                            </View>
                        </View>
                  </TouchableNativeFeedback>
                }
                {Platform.OS === 'ios' &&
                  <TouchableOpacity  onPress={()=>{this.state.login?
                    this.props.navigation.navigate('Support'):this.props.navigation.navigate('LogInScreen')}}>
                        <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                      backgroundColor: routeName.routeName=='Support'?'#f2f2f2':'#fff'}}>
                            <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                                <FontAwesome color={routeName.routeName=='Support'?'#000000':'#000000'}
                                            name="support"
                                            size={23}/>
                            </View>
                            <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                                <MonoText   style={{color:routeName.routeName=='Support'?'#000000':'#000000',
                                              fontWeight:'500'}} >Help</MonoText>
                            </View>
                        </View>
                  </TouchableOpacity>
                }
                {Platform.OS === 'android' &&

                  <TouchableNativeFeedback centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.props.navigation.navigate('Policies')}}>
                        <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                      backgroundColor:routeName.routeName=='Policies'?'#f2f2f2':'#fff'}}>
                            <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                                <FontAwesome color={themeColor}
                                            name="clipboard"
                                            size={23}/>
                            </View>
                            <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                                <MonoText   style={{color:themeColor,
                                              fontWeight:'500'}} >Policies</MonoText>
                            </View>
                        </View>
                  </TouchableNativeFeedback>
                }
                {Platform.OS === 'ios' &&

                  <TouchableOpacity    onPress={()=>{this.props.navigation.navigate('Policies')}}>
                        <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                      backgroundColor:routeName.routeName=='Policies'?'#f2f2f2':'#fff'}}>
                            <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                                <FontAwesome color={themeColor}
                                            name="clipboard"
                                            size={23}/>
                            </View>
                            <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                                <MonoText   style={{color:themeColor,
                                              fontWeight:'500'}} >Policies</MonoText>
                            </View>
                        </View>
                  </TouchableOpacity>
                }
                {Platform.OS === 'android' &&

                  <TouchableNativeFeedback centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.onShare()}}>
                        <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
                                      backgroundColor:'#fff'}}>
                            <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                                <FontAwesome color={themeColor}
                                            name="share-alt"
                                            size={23}/>
                            </View>
                            <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                                <MonoText   style={{color:themeColor,
                                              fontWeight:'500'}} >Share App</MonoText>
                            </View>
                        </View>
                  </TouchableNativeFeedback>
                }
                {Platform.OS === 'ios' &&

                  <TouchableOpacity   onPress={()=>{this.onShare()}}>
                        <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10, backgroundColor:'#fff'}}>
                            <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                                <FontAwesome color={themeColor}
                                            name="share-alt"
                                            size={23}/>
                            </View>
                            <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                                <MonoText   style={{color:themeColor,
                                              fontWeight:'500'}} >Share App</MonoText>
                            </View>
                        </View>
                  </TouchableOpacity>
                }
                {this.state.login&&Platform.OS === 'android'&&
                  <TouchableNativeFeedback  centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>this.logout()}>
                      <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10, backgroundColor:'#fff'}}>
                          <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                              <FontAwesome name="sign-out" size={25} color={themeColor} />
                          </View>
                          <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                              <MonoText   style={{color:themeColor,fontWeight:'500', }} >Logout</MonoText>
                          </View>
                      </View>
                  </TouchableNativeFeedback>
                }
                {this.state.login&&Platform.OS === 'ios'&&
                  <TouchableOpacity    onPress={()=>this.logout()}>
                      <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10, backgroundColor:'#fff'}}>
                          <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
                              <FontAwesome name="sign-out" size={25} color={themeColor} />
                          </View>
                          <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
                              <MonoText   style={{color:themeColor,fontWeight:'500', }} >Logout</MonoText>
                          </View>
                      </View>
                  </TouchableOpacity>
                }
              </View>


              {/*<View style={[styles.container,{justifyContent: 'flex-end',}]}>
                  <View style={{ flex: 1, alignItems: 'center',justifyContent: 'flex-end' }}>
                      <MonoText   style={{fontSize:15,color:themeColor, }}>v{Constants.nativeAppVersion}</MonoText>
                  </View>
            </View>*/}
          </SafeAreaView>
      {storeType=='MULTI-OUTLET' &&
            <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

              <TouchableOpacity style={{flex:1,paddingHorizontal:10,marginLeft:15}} onPress={() => this.gotoHome()}>
              <View style={styles.account}>

              <Image source={require('../assets/images/icon1.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
              <MonoText style={{color:this.state.store.themeColor, }}>Home</MonoText>
              </View>
              </TouchableOpacity>
              <TouchableOpacity style={{flex:1,paddingHorizontal:10}} onPress={() => this.gotorefer()}>
              <View style={styles.account}>

              <Image source={require('../assets/images/refere-footer.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
              <MonoText style={{color:this.state.store.themeColor, }}>Refer</MonoText>
              </View>
              </TouchableOpacity>
              <View style={{ flex:1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
              <TouchableOpacity style={{paddingHorizontal:10,backgroundColor:'#fff',}} onPress={this.checkout}>
                <View style={[styles.account,{height:'100%',width:'100%'}]}>

                  <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="shopping-cart" size={25} color={this.state.store.themeColor} /> </MonoText>
                  <View style={[styles.cartItemNo]}>
                  <View style={[counter.length==1?styles.cartItemPosition:styles.cartItemPosition,{borderColor:this.state.store.themeColor,
                  color:this.state.store.themeColor,}]}><MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:10),fontWeight:'700',}}>{counter}</MonoText></View>
                  </View>
                  <MonoText  style={{color:this.state.store.themeColor ,fontSize : 14, marginLeft:10}}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
                </View>
              </TouchableOpacity>
              </View>

              <TouchableOpacity style={{flex:1,paddingHorizontal:10,backgroundColor:'#fff',marginRight:15}} onPress={() => this.gotoCategories()}>
                <View style={[styles.account,{height:'100%'}]}>
                  <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="th-large" size={25} color={this.state.store.themeColor} /> </MonoText>
                  <MonoText style={{color:this.state.store.themeColor , fontSize : 14, }}>Categories</MonoText>
                </View>
              </TouchableOpacity>
            </View>
        }
        {storeType!='MULTI-OUTLET'&&
          <View style={[styles.footer, { flex:1, backgroundColor: '#fff',borderTopWidth:1, borderTopColor:  this.state.store.themeColor}]}>

          <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoHome()}>
            <View style={[styles.account,{height:'100%'}]}>
              <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="home" size={20} color={this.state.store.themeColor} /> </MonoText>
              <MonoText style={{color:this.state.store.themeColor , fontSize : 13, }}>Home</MonoText>
            </View>
          </TouchableOpacity>
            <View style={{ flex:1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
              <TouchableOpacity style={{backgroundColor:'#fff',}} onPress={() => this.gotorefer()}>
                <View style={styles.account}>

                <Image source={require('../assets/images/refere-footer.png')} style={{resizeMode:'contain',height:23,width:'100%'}} />
                <MonoText style={{color:this.state.store.themeColor, }}>Refer</MonoText>
                </View>
              </TouchableOpacity>
            <TouchableOpacity style={{backgroundColor:'#fff',}} onPress={this.checkout}>
              <View style={[styles.account,{height:'100%',width:'100%'}]}>

                <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="shopping-cart" size={20} color={this.state.store.themeColor} /> </MonoText>
                <View style={[styles.cartItemNo]}>
                <View style={[counter.length==1?styles.cartItemPosition:styles.cartItemPosition,{borderColor:this.state.store.themeColor,
                color:this.state.store.themeColor,}]}>
                <MonoText numberOfLines={1} style={{color:this.state.store.themeColor, alignSelf:'center',fontSize:counter.length==1?14:(counter.length==2?12:10),fontWeight:'700',}}>{counter}</MonoText>
                </View>
                </View>
                <MonoText style={{color:this.state.store.themeColor ,fontSize : 13,  }}>&#8377; {Math.round(this.props.totalAmount)} </MonoText>
              </View>
            </TouchableOpacity>
            </View>

            <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoDiscoverScreen()}>
              <View style={[styles.account,{height:'100%'}]}>
                <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="users" size={20} color={this.state.store.themeColor} /> </MonoText>
                <MonoText style={{color:this.state.store.themeColor , fontSize : 13, }}>Discover</MonoText>
              </View>
            </TouchableOpacity>
            {chatView&&
            <TouchableOpacity style={{flex:1,backgroundColor:'#fff',}} onPress={() => this.gotoChatScreen()}>
              <View style={[styles.account,{height:'100%'}]}>
                <MonoText style={{color:'#fff' ,  }}> <FontAwesome name="wechat" size={20} color={this.state.store.themeColor} /> </MonoText>
                <MonoText style={{color:this.state.store.themeColor , fontSize : 13, }}>Chat</MonoText>
              </View>
            </TouchableOpacity>
          }
          </View>
      }
      </View>

      );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar:{
    height:Constants.statusBarHeight,

  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: width * 0.15,
    borderWidth: 0,
  },
  account:{
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemNo:{
    position:'absolute',
    alignItems:'center',
    justifyContent:'center',
    top:3
  },
  cartItemPosition:{
    width:21,
    height:21,
    backgroundColor:'#fff',
    borderWidth:1,
    borderRadius:15,
    alignItems:'center',
    justifyContent:'center',
    fontSize:14,
    fontWeight:'700',
    position:'absolute',
    left:6,
    top:0
  },
  cartItemPositionn:{
    paddingHorizontal:5,
    height:25,
    backgroundColor:'#fff',
    borderWidth:1,
    borderRadius:10.5,
    textAlign:'center',
    fontSize:14,
    fontWeight:'700',
    position:'absolute',
    left:6,
    top:0
  },
  // cartItemPosition:{
  //   padding:5,paddingVertical:2,backgroundColor:'#fff',borderRadius: 15, alignItems:'center',
  //     justifyContent:'center',
  //     fontSize:10,
  //     fontWeight:'700',
  //     position:'absolute',
  //     left:6,
  //     top:0,
  //     borderWidth:1,
  // },
  cartItemNumber:{
    position: 'absolute',
    right:-2,
    top:3,
    fontSize:14,
    fontWeight:'700',
    backgroundColor: '#fff',
    borderWidth: 1,
    color:'#efa834',
    borderColor: '#efa834',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign:'center',
  }

});

const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    selectedStore:state.cartItems.selectedStore,
    selectedLandmark:state.cartItems.selectedLandmark,
    myStore:state.cartItems.myStore,
    storeRole:state.cartItems.storeRole,
    totalAmount: state.cartItems.totalAmount,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    emptyCartFunction:()=>dispatch(actions.emptyCart()),
    setCounterAmount:  (counter,totalAmount,saved) => dispatch(actions.setCounterAmount(counter,totalAmount,saved)),

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerContent);


// {storeType =='MULTI-OUTLET' && this.state.login && this.state.is_staff && Platform.OS === 'android' &&
//   <TouchableNativeFeedback  centered={true} background={TouchableNativeFeedback.Ripple('grey')}   onPress={()=>{this.props.navigation.navigate('SellerZone')}}>
//       <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
//                     backgroundColor: routeName.routeName=='SellerZone'?'#f2f2f2':routeName.routeName=='Instructions'?'#f2f2f2':'#fff'}}>
//           <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
//               {/* <FontAwesome name="shopping-bag" size={23} color={routeName.routeName=='SellerZone'?themeColor:routeName.routeName=='Instructions'?themeColor:themeColor} /> */}
//                 <Image source={require('../assets/images/house_1.png')} style={{height:22,width:22,}}  />
//                 {/* tintColor:routeName.routeName=='SellerZone'?themeColor:routeName.routeName=='Instructions'?themeColor:themeColor */}
//           </View>
//           <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
//               <MonoText   style={{color:routeName.routeName=='SellerZone'?this.props.activeTintColor:routeName.routeName=='Instructions'?this.props.activeTintColor:themeColor,
//                             fontWeight:'700'}} >Seller Zone</MonoText>
//           </View>
//       </View>
//   </TouchableNativeFeedback>}

// {this.state.login&&Platform.OS === 'ios' &&
// <TouchableOpacity   onPress={()=>{this.props.navigation.navigate('MyProductsScreen')}}>
//     <View style={{flexDirection: 'row',paddingVertical:15,paddingBottom: 10,
//                   backgroundColor: routeName.routeName=='MyProducts'?'#f2f2f2':'#fff'}}>
//         <View style={{flex:0.22,justifyContent: 'center',alignItems: 'center',}}>
//             <FontAwesome
//                  color={routeName.routeName=='MyProducts'?themeColor:themeColor}
//                  name="user" size={25} />
//         </View>
//         <View style={{flex:0.75,justifyContent: 'center',alignItems: 'flex-start',marginLeft:14}}>
//             <MonoText   style={{color:routeName.routeName=='MyProducts'?themeColor:themeColor,
//                           fontWeight:'700'}} >My Products</MonoText>
//         </View>
//     </View>
// </TouchableOpacity>
// }
