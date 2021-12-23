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
  TextInput, FlatList,ActivityIndicator,AsyncStorage,Animated,ImageBackground,TouchableWithoutFeedback
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
import moment from 'moment'




class CouponScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Coupons',
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
      coupons:[],
      loading:false,
      loadMore:true,
      searchResults:false
    }
    willFocus = props.navigation.addListener(
      'willFocus',
      payload => {
        NetInfo.fetch().then(state => {
          if(state.isConnected){
            this.getCoupons()
          }
      })

      }
    );
  }

  componentWillReceiveProps(nextProps){
  }

  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    });
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})
    this.getCoupons()
  }

  getCoupons=()=>{
    fetch(SERVER_URL+'/api/POS/promocodevs/?storeid='+this.state.myStore.pk).then((response)=>{
        return response.json()
    }).then((responseJson)=>{
       this.setState({coupons:responseJson,couponsData:responseJson})
    }).catch((error) => {
      return
    })
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

  search=(text)=>{
    this.setState({searchValue:text})
    if(text.length>0){
      this.setState({ coupons: [],loading:true})
      fetch(SERVER_URL+'/api/POS/promocodevs/?storeid='+this.state.myStore.pk+'&name__icontains='+text).then((response) => {

       return response.json()
     })
       .then((responseJson) => {
          if(responseJson.length==0){
            this.setState({loadMore:false})
          }
          console.log(responseJson,'jjjjj');
           this.setState({ coupons: responseJson,searchResults:true})
           this.setState({loading:false})
       })
       .catch((error) => {
         this.setState({loading:false})
         return
     });
   }else{
     this.setState({coupons:this.state.couponsData})
   }
  }

  _renderSearchResultsFooter = () => {
           return (
               (this.state.loading ) ?
                   <View style={{ marginBottom: 30, marginTop: 20, alignItems: 'center' }}>
                       <ActivityIndicator size="large" color={this.state.store.themeColor} />
                   </View> : null
           )
       }


  render() {

    var themeColor = this.props.store.themeColor


     return (
       <View style={[styles.container]}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>

        <View style={{flexDirection:'row', borderWidth: 1,borderColor:'#f2f2f2',height: 45, }}>
          <View style={{flex:0.15,justifyContent:'center',alignItems:'center'}}>
            <FontAwesome name={'search'} color={'#000'} size={20} />
          </View>
          <View style={{flex:0.85,justifyContent:'center'}}>
            <TextInput style={{width:'100%',fontSize:16  }} ref={input => { this.textInput = input }} placeholder={'Search by Coupon Name'}
            onChangeText={(text) =>{this.setState({searchValue:text})}} onSubmitEditing={()=>{this.search(this.state.searchValue)}} value={this.state.searchValue}/>
          </View>
        </View>

        <ScrollView style={{}}>

          <View style={{marginHorizontal:10}} >
            <FlatList
              style={{ marginBottom: 0, paddingTop: 0   }}
              data={this.state.coupons}
              keyExtractor={(item,idx) => {
                return idx.toString();
              }}
              renderItem={({item, index, separators}) => (
                 <TouchableWithoutFeedback onPress={()=>this.props.navigation.navigate('CouponDetails',{item:item})} >
                   <View style={{paddingVertical:15,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                   {item.product!=null&&
                     <View style={{flexDirection:'row',}}>
                       <View style={{flex:0.3,justifyContent:'center'}}>
                          <View style={{height:width * 0.25,width:width * 0.25}}>
                          {item.product.variant.length>0&&item.product.variant[0].images.length>0&&
                            <Image source={{uri:SERVER_URL+item.product.variant[0].images[0].attachment}} style={{height:'100%',width:'100%',resizeMode:'contain'}}/>
                          }
                          </View>
                       </View>
                       <View style={{flex:0.7,justifyContent:'center'}}>
                          <MonoText   style={{color:'#000',fontSize:15,}}>Coupon Code : <MonoText   style={{fontWeight:'700'}}>{item.name}</MonoText> </MonoText>
                          <MonoText   style={{color:'#000',fontSize:15,}}>Product Name : <MonoText   style={{fontWeight:'700'}}>{item.product.name}</MonoText> </MonoText>
                          <MonoText   style={{color:'#000',fontSize:15,}}>Valid Till : <MonoText   style={{fontWeight:'700'}}>{moment.utc(item.endDate).format('DD-MM-YYYY')}</MonoText> </MonoText>
                          {!item.discountInPercentage&&<MonoText   style={{color:themeColor,fontSize:15,}}>&#8377;{item.discount} Off</MonoText> }
                          {item.discountInPercentage&&<MonoText   style={{color:themeColor,fontSize:15,}}>{item.discount}% Off</MonoText> }
                       </View>
                    </View>
                  }
                  </View>
                 </TouchableWithoutFeedback>
              )}
              extraData={this.state}
              ListFooterComponent={this._renderSearchResultsFooter}
            />
            <View style={{alignItems:'center',justifyContent:'center',paddingVertical:20}}>
              {/* !this.state.loading&&this.state.loadMore&&!this.state.searchResults&&
                <TouchableOpacity onPress={()=>this.loadMore()}  style={{padding:7,borderWidth:1,backgroundColor:themeColor,borderColor:themeColor,}} >
                  <MonoText   style={{color:'#fff',fontSize:15}}>Load More</MonoText>
                </TouchableOpacity>
              */}
              { !this.state.loading&&!this.state.loadMore&&
                <View   style={{}} >
                  <MonoText   style={{color:'#000',fontSize:15}}>No Coupons</MonoText>
                </View>
              }
            </View>
          </View>

        </ScrollView>

        <View style={{position:'absolute',right:20,bottom:20}}>
            <TouchableOpacity onPress={()=>this.props.navigation.navigate('CouponProductSelection')} style={{paddingVertical:5,paddingHorizontal:15,borderRadius:15,backgroundColor:themeColor}}>
              <MonoText   style={{color:'#fff',fontSize:16}}>Create</MonoText>
            </TouchableOpacity>
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

  export default connect(mapStateToProps, mapDispatchToProps)(CouponScreen);

  // <View style={{flexDirection:'row'}}>
  //   <View style={{flex:0.6,justifyContent:'center'}}>
  //      <MonoText   style={{color:'#000',fontSize:15,}}>Coupon Code <MonoText   style={{fontWeight:'700'}}>{item.name}</MonoText> </MonoText>
  //   </View>
  //   <View style={{flex:0.4,alignItems:'flex-end',justifyContent:'center'}}>
  //      {!item.discountInPercentage&&<MonoText   style={{color:themeColor,fontSize:15,}}>&#8377;{item.discount} Off</MonoText> }
  //      {item.discountInPercentage&&<MonoText   style={{color:themeColor,fontSize:15,}}>{item.discount}% Off</MonoText> }
  //   </View>
  // </View>
