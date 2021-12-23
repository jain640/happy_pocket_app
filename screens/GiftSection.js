import * as React from 'react';
import { Animated,StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList, Alert, Button, AsyncStorage , ToastAndroid,Platform,ScrollView,ActivityIndicator,TextInput,PanResponder,TouchableWithoutFeedback,Easing} from 'react-native';
import { FontAwesome,MaterialIcons } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import Toast, {DURATION} from 'react-native-easy-toast';
const { width } = Dimensions.get('window');
const height = Dimensions.get('window');
import settings from '../constants/Settings.js';
import CoinFaq from '../components/CoinFaq.js';
import GiftComponent from '../components/GiftComponent.js';
import RedeemComponent from '../components/RedeemComponent.js';
import TargetComponent from '../components/TargetComponent.js';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import { Dropdown } from 'react-native-material-dropdown-v2';
import Modal from "react-native-modal";
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MonoText } from '../components/StyledText';


const tabs = [
  {
    name:'Target',
  },
  {
    name:'Gifts',
  },
  {
    name:'Redeem',
  },
  // {
  //   name:'FAQ',
  // },
]

class GiftSection extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return{
      header:null
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      scrollY: new Animated.Value(0),
      dimensions: undefined,
      selectedTab:0,
      scrollX : new Animated.Value(0),
      coins:0,
      store:props.store,
      user:null,
      showGift:false,
      fadeOut:false,
      primaryAddress:null,
      addressScreen:false
    }
    willFocus = props.navigation.addListener(
     'didFocus',
       payload => {
         this.getUserAsync()
         }
    );
  }

componentWillReceiveProps(nextProps){
      var address = null
      if(nextProps.selectedAddress.pk!=undefined){
        address = nextProps.selectedAddress
        this.setState({primaryAddress:address,addressScreen:true})
      }

  }

  getUserAsync = async () => {
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
       this.setState({user:responseJson})
    })
    .catch((error) => {
      return
    });
  }



  componentDidMount(){

    var page = this.props.navigation.getParam('page',null)
    if(page!=null){
      if(page=='redeem'){
        if(this.scroll!=undefined){
          this.setState({selectedTab:2})
        }
      }
    }
  }

  handlePageChange=(e)=>{
    var offset = e.nativeEvent.contentOffset;
    if(offset) {
      var page = Math.round(offset.x / width) ;
      this.setState({selectedTab:page})
    }
    this.setState({scrollY:new Animated.Value(0)})
  }

  showGift=()=>{
    this.setState({showGift:true})
    setTimeout(()=> {
      this.setState({fadeOut:true})
    }, 3500);
  }

  onLayout = event => {
    if (this.state.dimensions) return
    let {width, height} = event.nativeEvent.layout
    this.setState({dimensions: {width, height}})
  }

    render(){

      var themeColor = this.state.store.themeColor

      let left = this.state.scrollX.interpolate({
         inputRange: [0,1*width, 2*width   ],
         outputRange: [0, width*0.33,width*0.66],
         extrapolate: 'clamp'
       });

      let changingHeight = this.state.scrollY.interpolate({
             inputRange: [0,100],
             outputRange: [165,100],
             extrapolate: "clamp",
             useNativeDriver:true
         });
      let changingHeightt = this.state.scrollY.interpolate({
             inputRange: [0,1],
             outputRange: [0,-100],
             extrapolate: "clamp",
             useNativeDriver:true
         });
      let coinsHeight = this.state.scrollY.interpolate({
             inputRange: [0,1],
             outputRange: [65,0],
             extrapolate: "clamp",
             useNativeDriver:true
         });
      let coinsOpacity = this.state.scrollY.interpolate({
             inputRange: [0,1],
             outputRange: [1,0],
             useNativeDriver:true
         });
         let headMov = this.state.scrollY.interpolate({
            inputRange: [0, 100, 101],
            outputRange: [0, -100, -100]
        });

         let headMovv = this.state.scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -55],
            extrapolate: "clamp",
            useNativeDriver:true
        });
         let tabbarMove = this.state.scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -65],
            extrapolate: "clamp",
            useNativeDriver:true
        });
         let tabbarOpacity = this.state.scrollY.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
            extrapolate: "clamp",
            useNativeDriver:true
        });
         let tabbarHeight = this.state.scrollY.interpolate({
            inputRange: [0, 65],
            outputRange: [50, 30],
            extrapolate: "clamp",
            useNativeDriver:true
        });
         let tabbarHeightText = this.state.scrollY.interpolate({
            inputRange: [0, 45],
            outputRange: [20, 0],
            extrapolate: "clamp",
            useNativeDriver:true
        });
         let headMovvOpacity = this.state.scrollY.interpolate({
            inputRange: [0, 1,100],
            outputRange: [1, 0,1],
            extrapolate: "clamp",
            useNativeDriver:true
        });
         let headMoveRight = this.state.scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, width/4],
            extrapolate: "clamp",
            useNativeDriver:true
        });

        const headerOpacityy = this.state.scrollY.interpolate({
           inputRange: [0,  165],
           outputRange: [0,  1],
           extrapolate: 'clamp',
           easing: Easing.linear,
           useNativeDriver: true
      });

      if(this.state.user == null){
        var coin = 0
        var user = null
      }else{
        var coin = this.state.user.profile.walletValue
        var user = this.state.user
      }
      var {addressScreen} = this.state

      return(
        <View style={{flex:1,backgroundColor:'#f3f3f3'}}>
        <View style={{height: Constants.statusBarHeight,backgroundColor: "#f3f3f3"}} />

          <View style={{flex:1}}>

          <Animated.View style={[styles.shadow,{position: 'absolute',top: 0,left: 0,width:'100%',height:changingHeight,zIndex: 9, overflow: 'hidden'}]} >
            <View style={{flexDirection: 'row',height:55,alignItems: 'center',justifyContent: 'center',marginHorizontal: 15,}}>
              <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{flex:0.15,justifyContent: 'center',alignItems: 'flex-start'}}>
                <MaterialIcons name='arrow-back' size={25} color={themeColor} />
              </TouchableOpacity>
              <View style={{flex:0.5,justifyContent: 'center',alignItems: 'flex-end',}}>
                <MonoText   style={{fontSize:18,fontWeight:'700',color:themeColor}}>{settings.coinTitle}</MonoText> 
              </View>
              <Animated.View style={{flex:0.35,justifyContent: 'center',alignItems: 'flex-start',opacity: headerOpacityy}}>
                <MonoText   style={{fontSize:18,fontWeight:'700',color:themeColor,alignSelf: 'center'}}>{coin}</MonoText> 
              </Animated.View>
            </View>

            <Animated.View style={{flexDirection: 'row',height:65,alignItems: 'center',justifyContent: 'center',overflow: 'hidden',opacity:tabbarOpacity,transform: [{ translateY: headMovv },{translateX:headMoveRight}]}}>
              <Animated.View style={[{ height:tabbarHeight,marginBottom: 5,marginTop:5,}]}>
              <View style={[styles.shadow,{paddingHorizontal:10,alignItems: 'center',justifyContent: 'center',borderRadius:5,borderWidth: 1,borderColor: '#f2f2f2',paddingVertical:5,}]}>
                <MonoText   style={{fontSize:18,fontWeight:'700',color:themeColor,alignSelf: 'center'}}>{coin}</MonoText> 
                <Animated.Text style={{fontSize:14,color:themeColor,alignSelf: 'center',height:tabbarHeightText,opacity:tabbarOpacity}}>HP Coins</Animated.Text>
              </View >
              </Animated.View >
            </Animated.View>
            <Animated.View style={{flexDirection: 'row',transform: [{translateY: tabbarMove}]}}>
            {tabs.map((item, i) => {
                return (
                  <TouchableOpacity key={i} onPress={()=>{this.setState({selectedTab:i});this.scroll.scrollTo({ x: (i)*width });this.setState({scrollY:new Animated.Value(0)})}} style={{flex:1,borderBottomWidth: 0,borderColor:this.state.selectedTab==i? themeColor:'#f2f2f2',alignItems: 'center',justifyContent: 'center',height:45}} >
                   <MonoText   style={{fontSize:16,fontWeight:'700',color:this.state.selectedTab==i?themeColor:themeColor,opacity:this.state.selectedTab==i?1:0.8}}>{item.name}</MonoText> 
                  </TouchableOpacity>
                );
              })}
              <Animated.View
              style={{ height: 2, width: '33.33%', backgroundColor: themeColor,position: 'absolute',bottom: 0,left:0,
              transform: [{translateX:left}]}}
              />
            </Animated.View>

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
                  {i==0&&user!=null&&
                    <TargetComponent scollUpdate={(position,direction)=>{if(position<0){this.setState({scrollY:new Animated.Value(0)});LayoutAnimation.easeInEaseOut();}else{this.setState({scrollY:position});}}} topHeight={changingHeight} coinCount={(coin)=>this.setState({coin:coin})} store={this.state.store} user={user} gift={()=>{this.showGift()}} navigation={this.props.navigation} getUser={()=>{this.getUserAsync()}}/>
                  }
                  {i==1&&user!=null&&
                    <GiftComponent store={store} updateAddressScreen={(bool)=>{this.setState({addressScreen:false})}} addressScreen={addressScreen} selectedAddress={this.state.primaryAddress} scollUpdate={(position)=>this.setState({scrollY:position})} navigation={this.props.navigation}  topHeight={changingHeight} store={this.state.store} user={user} walletUpdate={()=>{this.getUserAsync();this.redeem.getRedeem()}}/>
                  }
                  {i==2&&
                    <RedeemComponent themeColor={this.props.themeColor} ref={child => {this.redeem = child}} {...this.props} scollUpdate={(position)=>this.setState({scrollY:position})} topHeight={changingHeight} store={this.state.store} />
                  }
                  {i==3&&
                    <CoinFaq store={this.state.store}/>
                  }

                  </View>
                );
              })}
              {this.state.showGift&&
                  <ConfettiCannon count={200} origin={{x: -10, y: 185}}  fadeOut={this.state.fadeOut}/>
              }

          </ScrollView>
        </View>
      </View>
      )
    }
}





const styles = StyleSheet.create({

  shadow: {
    shadowColor: '#000',
    shadowOffset: {
    	width: 0,
    	height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    backgroundColor : '#f2f2f2',
    elevation: 5,
},
})

const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    selectedAddress : state.cartItems.selectedAddress,
    selectedLandmark:state.cartItems.selectedLandmark,
    selectedStore:state.cartItems.selectedStore,
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

export default connect(mapStateToProps, mapDispatchToProps)(GiftSection)
