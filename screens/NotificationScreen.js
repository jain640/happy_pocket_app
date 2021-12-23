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
  TextInput, FlatList,ActivityIndicator,AsyncStorage,Animated,Picker,Keyboard,TouchableWithoutFeedback
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import GridLayout from 'react-native-layout-grid';

import DiscoverSellerCard from '../components/DiscoverSellerCard.js';
import settings from '../constants/Settings.js';
const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';
import ChatCard from '../components/ChatCard.js';
import ChatUserCard from '../components/ChatUserCard.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import Loader from '../components/Loader';
import moment from 'moment'


const data = [
  {notification:'Note the subtle difference between e.g. British Airways "reasonably believing" there is no travel documentation and the Regulations requirement that there be "reasonable grounds [such as] inadequate travel documentation". With the latter the court will be looking to see whether or not the travel documentations you presented were in fact adequate, as opposed to what BA reasonably believed was the case',
  status:'Order Update',amount:5000,created:new Date()},
  {notification:'The passenger is responsible for having proper documentation. ',status:'Order Update',amount:1000,created:new Date()},
  {notification:'The passenger is responsible for having proper documentation. ',status:'Promotion',amount:2000,created:new Date()},
  {notification:'The passenger is responsible for having proper documentation. ',status:'Order Update',amount:5000,created:new Date()},
  {notification:'The passenger is responsible for having proper documentation. ',status:'Order Update',amount:5000,created:new Date()},
]


const tabs = [
  {
    name:'Notifications',
  },
  {
    name:'Announcements',
  },

]

class NotificationScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Notifications',
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



    this.state = {
      store:props.store,
      myStore:props.myStore,
      keyboardOffset:0,
      keyboardOpen:false,
      loadingVisible:false,
      data:[],
      announcements:[],
      scrollX : new Animated.Value(0),
      scrollY: new Animated.Value(0),
      selectedTab:0,
      offsetNotifications:0,
      offsetAnnouncement:0,
      loadMoreNotify:true,
      loadMoreAnnouncement:true,
    }
    Keyboard.addListener('keyboardDidHide',this.keyboardDidHide)
    Keyboard.addListener( 'keyboardDidShow', this.keyboardDidShow)
  }

  keyboardDidShow=(event)=> {
        this.setState({
            keyboardOffset: event.endCoordinates.height+27,
            keyboardOpen:true,
        })
    }

    keyboardDidHide=()=> {
        this.setState({
            keyboardOffset: 27,
            keyboardOpen:false,
        })
  }

  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    });
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})
     this.getNotification(0)
     this.getAnnouncements(0)
  }

  getNotification=async(offset)=>{
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    await fetch(SERVER_URL+'/api/PIM/notification/?alerts=true&offset='+offset+'&limit=10',{
      method:'GET',
      headers:{
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      }
    })
    .then((response)=>{
      console.log(response.status,'ggfhfhghg');
      return response.json()
    }).then((json)=>{
      console.log(json,'result');
      if(json==undefined){
        return
      }
      var data = this.state.data
      var loadMoreNotify = true
      json.results.forEach((i)=>{
        data.push(i)
      })
      if(json.count==data.length){
        var loadMoreNotify = false
      }
      this.setState({data:data,offsetNotifications:offset+10,loadMoreNotify:loadMoreNotify})
   })
  }
  getAnnouncements=async(offset)=>{
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    await fetch(SERVER_URL+'/api/PIM/notification/?announcement=true&offset='+offset+'&limit=10',{
      method:'GET',
      headers:{
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      }
    })
    .then((response)=>{
      console.log(response.status,'ggfhfhghg');
      return response.json()
    }).then((json)=>{
      console.log(json,'result');
      if(json==undefined){
        return
      }
      var announcements = this.state.announcements
      var loadMoreAnnouncement = true
      json.results.forEach((i)=>{
        announcements.push(i)
      })
      if(json.count==announcements.length){
        var loadMoreAnnouncement = false
      }
      this.setState({announcements:announcements,offsetAnnouncement:offset+10,loadMoreAnnouncement:loadMoreAnnouncement})
   })
  }

  gotoPage=()=>{

  }

  handlePageChange=(e)=>{
    var offset = e.nativeEvent.contentOffset;
    if(offset) {
      var page = Math.round(offset.x / width) ;
      this.setState({selectedTab:page})
    }
    this.setState({scrollY:new Animated.Value(0)})
  }


  onLayout = event => {
    if (this.state.dimensions) return
    let {width, height} = event.nativeEvent.layout
    this.setState({dimensions: {width, height}})
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



  render() {

    var {themeColor} = this.props.store
    let left = this.state.scrollX.interpolate({
       inputRange: [0,1*width, ],
       outputRange: [0, width*0.5,],
       extrapolate: 'clamp'
     });
    return(
      <View style={{flex:1,backgroundColor:'#fff'}}>
        <Animated.View style={{flexDirection: 'row',}}>
        {tabs.map((item, i) => {
            return (
              <TouchableOpacity key={i} onPress={()=>{this.setState({selectedTab:i});this.scroll.scrollTo({ x: (i)*width });this.setState({scrollY:new Animated.Value(0)})}} style={{flex:1,borderBottomWidth: 1,borderColor:'#f2f2f2',alignItems: 'center',justifyContent: 'center',height:45}} >
               <MonoText   style={{fontSize:16,fontWeight:'700',color:this.state.selectedTab==i?'#000':'grey'}}>{item.name}</MonoText>
              </TouchableOpacity>
            );
          })}
          <Animated.View
          style={{ height: 2, width: '50%', backgroundColor: themeColor,position: 'absolute',bottom: 0,left:0,
          transform: [{translateX:left}]}}
          />
        </Animated.View>
        <ScrollView
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: this.state.scrollX } } }]  )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={this.handlePageChange}
          ref={(node) => {this.scroll = node}}
          style={{flex:1}}
          onContentSizeChange={() =>this.scroll.scrollTo({ x: (this.state.selectedTab)*width })}
          >

          {tabs.map((item, i) => {
              return (
                <View key={i} style={{flex:1,backgroundColor: '#fff',width:width*1,}} >
                {i==0&&this.state.selectedTab==0&&
                   <View style={{flex:1,}}>
                    <ScrollView>
                    <FlatList
                        data={this.state.data}
                        keyExtractor={(item,index) => {
                          return index.toString();
                        }}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        renderItem={({item, index}) =>{
                           return (
                               <View style={{flex:1,backgroundColor:'#f2f2f2',borderBottomWidth:5,borderColor:'#f2f2f2'}}>
                                <TouchableWithoutFeedback onPress={()=>{}}>
                                  <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', width:width,margin:0,padding:0,backgroundColor:'#fff'}]}>
                                     <View style={{height:'100%',}}>
                                       <View style={{flex:1,}}>
                                       <View style={{flexDirection:'row',marginHorizontal:15,marginVertical:10}}>
                                           <View style={{flex:1,alignItems:'flex-start',}}>
                                              <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>{item.shortInfo}</MonoText>
                                           </View>
                                           <View style={{flex:1,alignItems:'flex-end'}}>
                                           <MonoText   style={{color:'#000',fontSize:14,}}>{moment(item.created).format('MMM DD YYYY')}</MonoText>
                                             {/*<View style={{backgroundColor:'#f2f2f2',paddingVertical:5,paddingHorizontal:10,borderRadius:15}}>
                                                <MonoText   style={{color:'#000',fontSize:14,}}>{item.status}</MonoText>
                                             </View>*/}
                                           </View>
                                         </View>
                                          <View style={{flexDirection:'row',marginHorizontal:15,marginBottom:10}}>
                                            <View style={{flex:1}}>
                                              <MonoText   style={{color:'#000',fontSize:16,}}>{item.message}</MonoText>
                                            </View>
                                          </View>


                                       </View>
                                     </View>
                                  </Card>
                                  </TouchableWithoutFeedback>
                             </View>
                        )}}
                      />
                      <View style={{alignItems:'center',justifyContent:'center',paddingVertical:20}}>
                        { this.state.loadMoreNotify&&
                          <TouchableOpacity onPress={()=>this.getNotification(this.state.offsetNotifications)}  style={{padding:7,borderWidth:1,backgroundColor:themeColor,borderColor:themeColor,}} >
                            <MonoText   style={{color:'#fff',fontSize:15}}>Load More</MonoText>
                          </TouchableOpacity>
                        }
                          {! this.state.loadMoreNotify&&
                            <View   style={{}} >
                              <MonoText   style={{color:'#000',fontSize:15}}>No More Notifications</MonoText>
                            </View>
                          }
                      </View>

                    </ScrollView>

                   </View>
                }
                {i==1&&this.state.selectedTab==1&&
                  <View style={{flex:1,}}>
                   <ScrollView>
                   <FlatList
                       data={this.state.announcements}
                       keyExtractor={(item,index) => {
                         return index.toString();
                       }}
                       extraData={this.state}
                       showsVerticalScrollIndicator={false}
                       nestedScrollEnabled={true}
                       renderItem={({item, index}) =>{
                          return (
                              <View style={{flex:1,backgroundColor:'#f2f2f2',borderBottomWidth:5,borderColor:'#f2f2f2'}}>
                               <TouchableWithoutFeedback onPress={()=>{}}>
                                 <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', width:width,margin:0,padding:0,backgroundColor:'#fff'}]}>
                                    <View style={{height:'100%',}}>
                                      <View style={{flex:1,}}>
                                      <View style={{flexDirection:'row',marginHorizontal:15,marginVertical:10}}>
                                          <View style={{flex:1,alignItems:'flex-start'}}>
                                              <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>{item.shortInfo}</MonoText>
                                          </View>
                                          <View style={{flex:1,alignItems:'flex-end'}}>
                                              <MonoText   style={{color:'#000',fontSize:14,}}>{moment(item.created).format('DD MMM')}</MonoText>
                                            {/*<View style={{backgroundColor:'#f2f2f2',paddingVertical:5,paddingHorizontal:10,borderRadius:15}}>
                                               <MonoText   style={{color:'#000',fontSize:14,}}>{item.status}</MonoText>
                                            </View>*/}
                                          </View>
                                        </View>
                                         <View style={{flexDirection:'row',marginHorizontal:15,marginBottom:10}}>
                                           <View style={{flex:1}}>
                                             <MonoText   style={{color:'#000',fontSize:16,}}>{item.message}</MonoText>
                                           </View>
                                        </View>
                                      </View>
                                    </View>
                                 </Card>
                                 </TouchableWithoutFeedback>
                            </View>
                       )}}
                     />
                     <View style={{alignItems:'center',justifyContent:'center',paddingVertical:20}}>
                     { this.state.loadMoreAnnouncement&&
                         <TouchableOpacity onPress={()=>this.getAnnouncements(this.state.offsetAnnouncement)}  style={{padding:7,borderWidth:1,backgroundColor:themeColor,borderColor:themeColor,}} >
                           <MonoText   style={{color:'#fff',fontSize:15}}>Load More</MonoText>
                         </TouchableOpacity>
                       }
                       {!this.state.loadMoreAnnouncement&&
                         <View   style={{}} >
                           <MonoText   style={{color:'#000',fontSize:15}}>No More Announcements</MonoText>
                         </View>
                       }
                     </View>

                   </ScrollView>

                  </View>
                }

                </View>
              );
            })}

        </ScrollView>
      </View>
    )
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
      elevation: 0,
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
      setMyStoreFunction:(myStore,storeRole)=>dispatch(actions.setMyStore(myStore,storeRole)),
      emptyCartFunction:()=>dispatch(actions.emptyCart()),


    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(NotificationScreen);
