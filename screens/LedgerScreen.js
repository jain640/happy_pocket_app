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
  {title:'This Month',
  data:[{paymentId:'25 ',status:'Processing',amount:5000,created:new Date()},{paymentId:'45 ',status:'Settled',amount:4000,created:new Date()}]},
  {title:'Last Month',data:[{paymentId:'67 ',status:'Processing',amount:1000,created:new Date()}]},
  {title:'Febuary',data:[{paymentId:'65 ',status:'Settled',amount:2000,created:new Date()},{paymentId:'25 ',status:'Processing',amount:5000,created:new Date()},{paymentId:'25 ',status:'Processing',amount:5000,created:new Date()}]},
]


// const tabs = [
//   {
//     name:'Overview',
//   },
//   {
//     name:'Payout',
//   },
//
// ]

class LedgerScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Payout',
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
      scrollX : new Animated.Value(0),
      scrollY: new Animated.Value(0),
      selectedTab:0,
      page:0,
      showMore:true
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
    this.getPayouts()
  }

  getPayouts=async()=>{
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    console.log('came');
    await fetch(SERVER_URL+'/api/POS/storeWisePayoutList/?storeid='+this.state.myStore.pk+'&page='+this.state.page,{
      method:"GET",
      headers: {
        "Cookie" :"csrftoken="+csrf+"; sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL+'/api/POS/forum/',
        'X-CSRFToken': csrf
      },
    })
    .then((response)=>{
      console.log(response.status,'ggfhfhghg');
      return response.json()
    }).then((json)=>{
      if(json==undefined){
        return
      }
      var data = []
      json.payouts.forEach((i)=>{
        data.push(i)
      })
      this.setState({data:json.payouts,page:this.state.page+1})
   }).catch((err)=>{
     return
   })
  }


  // handlePageChange=(e)=>{
  //   var offset = e.nativeEvent.contentOffset;
  //   if(offset) {
  //     var page = Math.round(offset.x / width) ;
  //     this.setState({selectedTab:page})
  //   }
  //   this.setState({scrollY:new Animated.Value(0)})
  // }
  //
  //
  // onLayout = event => {
  //   if (this.state.dimensions) return
  //   let {width, height} = event.nativeEvent.layout
  //   this.setState({dimensions: {width, height}})
  // }


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

  _renderSearchResultsFooter = () => {
           return (
             <View>
             {this.state.data.length>0&&
              <View style={{alignItems:'center',justifyContent:'center'}}>
               <TouchableOpacity onPress={this.getPayouts}  style={{padding:7,borderWidth:1,backgroundColor:this.props.store.themeColor,borderColor:this.props.store.themeColor,borderRadius:10,marginTop:20,marginBottom:20}} >
                 <MonoText style={{color:'#fff', fontSize:15}}>Load More</MonoText>
               </TouchableOpacity>
             </View>
           }
           </View>
           )
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

                  <View style={{flex:1,}}>

                           <FlatList
                               data={this.state.data}
                               keyExtractor={(item,index) => {
                                 return index.toString();
                               }}
                               extraData={this.state}
                               showsVerticalScrollIndicator={false}
                               nestedScrollEnabled={true}
                               ListFooterComponent={this._renderSearchResultsFooter}
                               renderItem={({item, index}) =>{
                                  return (
                                      <View style={{flex:1,backgroundColor:'#f2f2f2',borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                                       <TouchableWithoutFeedback onPress={()=>{this.props.navigation.navigate('PayoutDetails',{item:item})}}>
                                         <Card containerStyle={[styles.shadow, {borderWidth: 1, borderColor: '#fff', width:width,margin:0,padding:0,backgroundColor:'#fff'}]}>
                                            <View style={{height:'100%',}}>
                                              <View style={{flex:1,}}>
                                                 <View style={{flexDirection:'row',margin:15}}>
                                                     <View style={{flex:0.5}}>
                                                       <MonoText   style={{color:'#000',fontSize:16,}}>Id : # {item.pk}</MonoText>
                                                     </View>
                                                     <View style={{flex:0.5,alignItems:'flex-end'}}>
                                                       <View style={{backgroundColor:'#f2f2f2',paddingVertical:5,paddingHorizontal:10,borderRadius:15}}>
                                                          <MonoText   style={{color:'#000',fontSize:16,}}>{item.status}</MonoText>
                                                       </View>
                                                     </View>
                                                   </View>
                                                 <View style={{flexDirection:'row',margin:15,marginTop:0}}>
                                                   <View style={{flex:0.5}}>
                                                     <MonoText   style={{color:'#000',fontSize:16,}} numberOfLines={1}>Name : {item.store.name}</MonoText>
                                                   </View>
                                                   <View style={{flex:0.5,alignItems:'flex-end'}}>
                                                       <MonoText   style={{color:'#000',fontSize:16,}}>Total Sales : &#8377; {item.totalSales}</MonoText>
                                                   </View>
                                                 </View>
                                                 <View style={{flexDirection:'row',margin:15,marginTop:0}}>
                                                   <View style={{flex:0.5}}>
                                                     <MonoText   style={{color:'#000',fontSize:16,}}>Commission : &#8377; {item.commission}</MonoText>
                                                   </View>
                                                   <View style={{flex:0.5,alignItems:'flex-end'}}>
                                                       <MonoText   style={{color:'#000',fontSize:16,}}>UTR No : {item.utrNo}</MonoText>
                                                   </View>
                                                 </View>
                                                 <View style={{flexDirection:'row',margin:15,marginTop:0}}>
                                                   <View style={{flex:0.5}}>
                                                     <MonoText   style={{color:'#000',fontSize:16,}}>Payment Mode : {item.paymentMode}</MonoText>
                                                   </View>
                                                   <View style={{flex:0.5,alignItems:'flex-end'}}>
                                                       <MonoText   style={{color:'#000',fontSize:16,}}>{item.dateofpayment}</MonoText>
                                                   </View>
                                                 </View>
                                              </View>
                                            </View>
                                         </Card>
                                         </TouchableWithoutFeedback>
                                    </View>
                               )}}
                             />

                </View>
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

  export default connect(mapStateToProps, mapDispatchToProps)(LedgerScreen);


  // <Animated.View style={{flexDirection: 'row',}}>
  // {tabs.map((item, i) => {
  //     return (
  //       <TouchableOpacity key={i} onPress={()=>{this.setState({selectedTab:i});this.scroll.scrollTo({ x: (i)*width });this.setState({scrollY:new Animated.Value(0)})}} style={{flex:1,borderBottomWidth: 1,borderColor:'#f2f2f2',alignItems: 'center',justifyContent: 'center',height:45}} >
  //        <MonoText   style={{fontSize:16,fontWeight:'700',color:this.state.selectedTab==i?'#000':'grey'}}>{item.name}</MonoText>
  //       </TouchableOpacity>
  //     );
  //   })}
  //   <Animated.View
  //   style={{ height: 2, width: '50%', backgroundColor: themeColor,position: 'absolute',bottom: 0,left:0,
  //   transform: [{translateX:left}]}}
  //   />
  // </Animated.View>
