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
import SelectProduct from '../components/SelectProduct.js';
import settings from '../constants/Settings.js';
const { width,height } = Dimensions.get('window');
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment'




class CouponProductSelection extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Select Product',
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
    var edit  = props.navigation.getParam('edit',false)
    this.state = {
      store:props.store,
      myStore:props.myStore,
      products:[],
      storeProducts:[],
      loading:false,
      loadMore:true,
      searchResults:false,
      limit:24,
      offset:0,
      cartItems:props.cart,
      searchValue:'',
      edit:edit
    }
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
    this.getProduct(this.state.offset)
  }

  getProduct=(offset)=>{
    this.setState({loading:true})
    fetch(SERVER_URL + '/api/POS/productlitesv/?offset='+offset+'&limit=24&storeid='+this.state.myStore.pk)
    .then((response) => {return response.json()})
    .then((responseJson) => {
      var products = this.state.products
      responseJson.results.forEach((i)=>{
        products.push(i)
      })
      var loadMore = true
      if(responseJson.count==products.length){
        var loadMore = false
      }
      this.setState({ products: products,storeProducts:products,offset:offset,loadMore:loadMore,searchResults:false})
      this.setState({loading:false})
    })
    .catch((error) => {
      return
    });
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
      fetch(SERVER_URL+'/api/POS/productlitesv/?storeid='+this.state.myStore.pk+'&name__icontains='+text).then((response) => {
       console.log(response.status,'jjjjj');
       return response.json()
     })
       .then((responseJson) => {
          if(responseJson.length==0){
            this.setState({loadMore:false})
          }
           this.setState({ products: responseJson,searchResults:true})
           this.setState({loading:false})
       })
       .catch((error) => {
         this.setState({loading:false})
         return
     });
   }else{
     this.setState({products:this.state.storeProducts})
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
            <TextInput style={{width:'100%',fontSize:16  }} ref={input => { this.textInput = input }} placeholder={'Search by  Name'}
            onChangeText={(text) =>{if(text.length==0){this.setState({searchValue:text,products:this.state.storeProducts});return};this.setState({searchValue:text})}} onSubmitEditing={()=>{this.search(this.state.searchValue)}} value={this.state.searchValue}/>
          </View>
        </View>

        <ScrollView style={{}}>

          <View style={{marginHorizontal:0}} >
            <FlatList
              style={{ marginLeft: -(width * 0.04), marginBottom: 0, paddingTop: 0   }}
              data={this.state.products}
              keyExtractor={(item,idx) => {
                return idx.toString();
              }}
              renderItem={({item, index, separators}) => (
                <SelectProduct edit={this.state.edit} product={item} index={index} selectedStore={this.state.myStore} cartItems={this.state.cartItems} onChange={ (args)=> this.updateCart(args)} navigation={this.props.navigation} userScreen={this.state.userScreen} store={this.state.store} modalVisible={(bool)=>{this.setModalVisible(bool)}} />
              )}
              extraData={this.state}
              ListFooterComponent={this._renderSearchResultsFooter}
            />
            <View style={{alignItems:'center',justifyContent:'center',paddingVertical:20}}>
              { !this.state.loading&&this.state.loadMore&&!this.state.searchResults&&
                <TouchableOpacity onPress={()=>this.loadMore()}  style={{padding:7,borderWidth:1,backgroundColor:themeColor,borderColor:themeColor,}} >
                  <MonoText   style={{color:'#fff',fontSize:15}}>Load More</MonoText>
                </TouchableOpacity>
              }
              { !this.state.loading&&!this.state.loadMore&&
                <View   style={{}} >
                  <MonoText   style={{color:'#000',fontSize:15}}>No More Products</MonoText>
                </View>
              }
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

  export default connect(mapStateToProps, mapDispatchToProps)(CouponProductSelection);
