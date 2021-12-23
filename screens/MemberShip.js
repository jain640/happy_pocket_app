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
  TextInput, FlatList,ActivityIndicator,AsyncStorage,Animated
} from 'react-native';
import { FontAwesome,SimpleLineIcons } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import GridLayout from 'react-native-layout-grid';

import DiscoverSellerCard from '../components/DiscoverSellerCard.js';
import settings from '../constants/Settings.js';
const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url
const storeType = settings.storeType
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';
import ChatCard from '../components/ChatCard.js';
import ChatUserCard from '../components/ChatUserCard.js';

const xOffset = new Animated.Value(0);

const transitionAnimation = index => {
  return {
    transform: [
      { perspective: 800 },
      {
        scale: xOffset.interpolate({
          inputRange: [
            (index - 1) * width,
            index * width,
            (index + 1) * width
          ],
          outputRange: [0.75, 1, 0.75]
        })
      },
      {
        rotateX: xOffset.interpolate({
          inputRange: [
            (index - 1) * width,
            index * width,
            (index + 1) * width
          ],
          outputRange: ["45deg", "0deg", "45deg"]
        })
      },
      {
        rotateY: xOffset.interpolate({
          inputRange: [
            (index - 1) * width,
            index * width,
            (index + 1) * width
          ],
          outputRange: ["-45deg", "0deg", "45deg"]
        })
      }
    ]
  };
};

class MemberShip extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Membership Plan',

      headerLeft: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
         <TouchableOpacity onPress={()=>{navigation.openDrawer({'color':params});}}><SimpleLineIcons name={'menu'} size={23} color={'#fff'}/></TouchableOpacity>
        </View>
     ),
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerTintColor: '#fff',
    }
  };


  constructor(props){
    super(props);
    this.state = {
      membershipList : [],
      store:props.store,
      myStore:props.myStore,
      selectedLandmark:props.selectedLandmark,
      selectedStore:props.selectedStore,
      moderator:false,
      scrollX : new Animated.Value(0),
    }

    willFocus = props.navigation.addListener(
     'didFocus',
       payload => {
          this.getMembership()
         }
    );

  }
  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    });
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})

  }

  getMembership=async()=>{
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');



    if(storeType=='MULTI-OUTLET'){
      var url = SERVER_URL + '/api/POS/mplan/?landmarkid='+this.state.selectedLandmark.pk
    }else if(storeType=='MULTI-VENDOR'){
      var url = SERVER_URL + '/api/POS/mplan/'
    }

    if(csrf!=null){
    fetch(url,{
      headers: {
      "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': SERVER_URL + '/api/POS/mplan/',
      'X-CSRFToken': csrf
    }
    })
      .then((response) => response.json())
      .then((responseJson) => {
        // var arr = []
        // responseJson.forEach((i)=>{
        //   i.landMarkAddress.forEach((j)=>{
        //     if(j.pk==this.state.selectedLandmark.pk){
        //       arr.push(i)
        //     }
        //   })
        // })
        this.setState({ membershipList: responseJson })
        console.log(responseJson,'jjjjjj');
      })
      .catch((error) => {
        return
      });
    }
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

  search = () => {
    this.props.navigation.navigate('SearchBar', {
      color: this.props.navigation.getParam('color','#000')
    })
  }

  handlePageChange=(e)=>{
    var offset = e.nativeEvent.contentOffset;
    if(offset) {
      var page = Math.round(offset.x / width) ;
      this.setState({selectdCard:page})
    }
  }

  gotoPage = ()=>{
    this.props.navigation.navigate('Pages',{url:'terms-of-use'})
  }

  buyPlan=async(id)=>{
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    var data = {
      id:id,
      store:this.state.store.pk
    }

    if(csrf!=null){
    fetch(SERVER_URL + '/api/POS/getMembershipDetails/?id='+id,{
      method:'POST',
      headers: {
      "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': SERVER_URL + '/api/POS/getMembershipDetails/?id='+id,
      'X-CSRFToken': csrf
      },
      body:JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson!=undefined){
          console.log(responseJson);
          var url = SERVER_URL + '/makeOnlinePayment/?orderid=' +responseJson.pk
          this.props.navigation.navigate('BuyPlanSuccess',{url:url,odnumber:responseJson.pk})
        }
        return
      })
      .catch((error) => {
        return
      });
    }
  }


  render() {

    var themeColor = this.props.store.themeColor

    let position = Animated.divide(xOffset, width);
    var rangeOfInput = []
    var rangeOfOutput= []
    if(this.state.membershipList!=undefined){
      this.state.membershipList.forEach((item,idx)=>{
        rangeOfInput.push(idx*width)
        rangeOfOutput.push(idx*12)
      })
    }
    if(rangeOfInput.length<2){
      var rangeOfInput = [0,1*width]
      var rangeOfOutput= [0,0]
    }
    let left = xOffset.interpolate({
      inputRange:rangeOfInput,
      outputRange: rangeOfOutput,
      extrapolate: 'clamp',
      useNativeDriver:true
    });



     return (
       <View style={[styles.container]}>
       <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
       <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <Animated.ScrollView
              horizontal={true}
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              ref={(node) => {this.scrollCard = node}}
              onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x:xOffset  } } }] )}
              scrollEventThrottle={16}
              onMomentumScrollEnd={this.handlePageChange}
           >
             <FlatList
             data={this.state.membershipList}
             horizontal={true}
             keyExtractor={(item, index) => {
               return index.toString();
             }}
             renderItem={({item, index}) => (
               <Animated.View  style={[{width: width,alignItems:'center',justifyContent:'center',},transitionAnimation(index)]}>
               <Card containerStyle={[styles.shadow,{ width: width*0.9,margin:0,padding:5,height:height*0.5,marginHorizontal:15,}]}>
                   <View style={{position: 'absolute',top:-(width*0.15),left:width*0.3,width:width*0.3,height:width*0.3,borderRadius:width*0.15,backgroundColor:'#f2f2f2'}}>

                   </View>
                  <View style={{height:'100%',width:'100%'}}>
                    <View style={{position: 'absolute',top:0,left:0,right:0,bottom:0,}}>
                        <Image source={require('../assets/images/homepage_membership.png')} style={{ width: '100%', height:'100%',borderRadius: 15,opacity:0.8,zIndex: 1}} />
                    </View>
                    <View style={{flex:0.4,alignItems:'center',justifyContent:'flex-end',zIndex: 999}}>
                      <MonoText   style={{color:'#000',fontSize:18,}}>{item.title}</MonoText>
                      <MonoText   style={{marginTop:10,color:'#000',fontSize:22,fontWeight:'700'}}>&#8377;{item.planFee}</MonoText>
                    </View>
                    <View style={{flex:0.6,alignItems:'center',justifyContent:'center',zIndex: 999}}>
                      <MonoText   style={{color:'grey',fontSize:16,}}>{item.validity} Days</MonoText>
                      <MonoText   style={{color:'grey',fontSize:16,marginTop:10}}>{item.deliveryCharge} Delivery Charge</MonoText>
                      <MonoText   style={{color:'grey',fontSize:16,marginTop:10}}>{item.noofDeliveryinamonth} Deliveries</MonoText>
                      <TouchableOpacity onPress={()=>{this.buyPlan(item.pk)}} style={{marginTop:20,paddingHorizontal:15,paddingVertical:10,borderWidth:1,backgroundColor:themeColor,borderColor:themeColor,alignItems:'center',justifyContent:'center'}}>
                        <MonoText   style={{color:'#fff',fontSize:16,}} >Buy Plan</MonoText>
                      </TouchableOpacity>
                    </View>
                  </View>
               </Card>
              </Animated.View>
             )}
             />
          </Animated.ScrollView>

          <View style={{justifyContent: 'center', alignItems: 'center',marginBottom:height*0.05}}>
            <TouchableOpacity onPress={()=>{this.gotoPage()}}>
              <MonoText   style={{color:'#000',fontSize:14,}}>Terms and Conditions</MonoText>
            </TouchableOpacity>
          </View>

          <View style={{  justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row' }}>
            {this.state.membershipList.map((_, i) => {
              let opacity = position.interpolate({
                 inputRange: [i - 1, i, i + 1],
                 outputRange: [0.3, 1, 0.3],
                 extrapolate: 'clamp'
               });
              return (
                <Animated.View
                  key={i}
                  style={{ height: 6, width: 6, backgroundColor: '#595959', margin: 3, borderRadius: 5,opacity:0.3 }}
                />
              );
            })}
            {this.state.membershipList.length>0&&
              <Animated.View style={{position:'absolute',left:0,top:0, height: 6, width: 6, backgroundColor: themeColor, margin: 3, borderRadius: 5 ,  transform: [{translateX:left}]}}
              />

            }
          </View>
         </View>
        </View>
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
    },

  });


  const mapStateToProps =(state) => {
      return {
      counter: state.cartItems.counter,
      cart : state.cartItems.cartItem,
      store:state.cartItems.store,
      myStore:state.cartItems.myStore,
      selectedLandmark:state.cartItems.selectedLandmark,
      selectedStore:state.cartItems.selectedStore
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

  export default connect(mapStateToProps, mapDispatchToProps)(MemberShip);
