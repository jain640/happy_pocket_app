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
import ProductFullCardV2 from '../components/ProductFullCardV2.js';
import Modal from "react-native-modal";

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const chatView = settings.chat

class SellerDetails extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: 'Seller Details',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Constants.statusBarHeight
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
    var sellerPk = props.navigation.state.params.sellerPk
    this.state = {
      store:props.store,
      myStore:props.myStore,
      sellerPk:sellerPk,
      sellerDetails:null,
      searchValue:'',
      categoryList:[],
      selectedCategoryIdx:0,
      limit:10,
      offset:0,
      responseJson:[],
      cartItems:props.cart,
      onEndReachedCalledDuringMomentum:true,
      loading:false,
      loadMore:true,
      products:[],
      totalCount:0,
      storeProducts:[],
      searchResults:false,
      variantShow:false,
      selectedProduct:null,
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

     this.getSellerDetails()
     this.getCategoryList()

  }

  getSellerDetails=async()=>{
    var csrf = await AsyncStorage.getItem('csrf');
    var userToken = await AsyncStorage.getItem('userpk');
    var sessionid = await AsyncStorage.getItem('sessionid');

    await fetch(SERVER_URL+'/api/POS/store/'+this.state.sellerPk+'/',{
      method: 'GET',
      headers: {
        "Cookie" :"csrf="+csrf+";sessionid=" + sessionid+";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken':csrf,
        'Referer': SERVER_URL
      },
    }).then((response) => response.json())
      .then((responseJson) => {

          this.setState({ sellerDetails: responseJson})
      })
      .catch((error) => {
        return
    });

  }

  getCategoryList=()=>{
    console.log(this.state.sellerPk);
    fetch(SERVER_URL + '/api/POS/categoryListApp/?store='+this.state.sellerPk)
      .then((response) => response.json())
      .then((responseJson) => {
        var obj = {name:' ALL ',pk:null}
        responseJson.unshift(obj)
        this.setState({ categoryList: responseJson })
        this.getSellerProducts(responseJson[0].pk,0)
      })
      .catch((error) => {
        return
      });
  }

  getSellerProducts=(categoryPk,offset)=>{
    this.setState({loading:true})
    if(categoryPk==null){
      var url = SERVER_URL+'/api/POS/productlitesv/?storeid='+this.state.sellerPk+'&limit='+this.state.limit+'&offset='+offset
    }else{
      var url = SERVER_URL+'/api/POS/productlitesv/?storeid='+this.state.sellerPk+'&recurcategory='+categoryPk+'&limit='+this.state.limit+'&offset='+offset
    }
    console.log(url);
     fetch(url).then((response) => {
      console.log(response.status,'adfffffffffffffff');
      return response.json()
    })
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
        this.setState({loading:false,searchResults:false})
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

  goToChat=async()=>{

    var userName = await AsyncStorage.getItem('user_name');
    var login = await AsyncStorage.getItem('userpk');
    if(JSON.parse(login)){
      this.props.navigation.navigate('TalkToSeller',{chatWith:this.state.owner,store:this.state.sellerDetails,storePk:this.state.sellerDetails.pk,userName:JSON.parse(userName)})
    }else{
      this.props.navigation.navigate('LogInScreen')

    }
  }

  search=(text)=>{
    this.setState({searchValue:text})
    if(text.length>0){
      this.setState({ products: [],loading:true})
      fetch(SERVER_URL+'/api/POS/productlitesv/?storeid='+this.state.sellerPk+'&search__contains='+text).then((response) => {
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
   }
  }

  setCategory=(pk,idx)=>{
    this.setState({selectedCategoryIdx:idx,offset:0,products:[]})
    this.getSellerProducts(pk,0)
  }


   _renderSearchResultsFooter = () => {
            return (
                (this.state.loading ) ?
                    <View style={{ marginBottom: 30, marginTop: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={this.state.store.themeColor} />
                    </View> : null
            )
        }

    loadMore=()=>{
      this.getSellerProducts(this.state.categoryList[this.state.selectedCategoryIdx].pk,this.state.offset+10)
    }

    variantSelection =()=>{

     selectVariant =(name,index,id)=>{
        this.setState({selectedProduct:null,variantShow:false})
          this.refs[id].dropDownChanged(name,index)
      }

      return(
        <Modal isVisible={this.state.variantShow} propagateSwipe={true}  animationIn="fadeIn" useNativeDriver={true} animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true} propagateSwipe={true} onRequestClose={()=>this.setState({variantShow:false,selectedProduct:null})} onBackdropPress={()=>{this.setState({variantShow:false,selectedProduct:null})}} >
          <View style={[styles.modalView,{maxHeight:width,overflow:'hidden'}]}>
          <ScrollView >
             {this.state.selectedProduct!=null&&
               <View style={{flex:1,paddingVertical:10,paddingHorizontal:15,zIndex:99,alignItems:'center',}}>
                <MonoText style={{color:'grey',fontSize:16,marginTop:10}}>Available quantities for</MonoText>
                <MonoText style={{color:'#000',fontSize:18,fontWeight:'700',marginBottom:20,marginTop:5}}>{this.state.selectedProduct.name}</MonoText>
                  <FlatList style={{}}
                        data={this.state.selectedProduct.variants}
                        keyExtractor={(item,index) => {
                          return index.toString();
                        }}
                        horizontal={false}
                        onEndThreshold={0}
                        extraData={this.state}
                        renderItem={({item, index}) => {
                          return(
                            <TouchableOpacity key={index} onPress={()=>selectVariant(item,index,this.state.selectedProduct.indexFind)} style={{flex:1,paddingVertical:5,width:'100%'}}>
                              <View style={{backgroundColor:this.state.selectedProduct.selectedIndex==index?this.state.store.themeColor:'#fff',borderRadius:5,borderWidth:this.state.selectedProduct.selectedIndex==index?0:1,borderColor:'#d2d2d2',paddingVertical:5,paddingHorizontal:10,alignItems:'center',justifyContent:'center',width:width-80}}>
                              <MonoText style={{color:this.state.selectedProduct.selectedIndex==index?'#fff':'grey',fontSize:16,fontWeight:'700'}}>{item.name} <MonoText style={{textDecorationLine: 'line-through',marginHorizontal:15, textDecorationStyle: 'solid'}}>&#8377;{item.mrp} </MonoText> &#8377;{item.sellingPrice}</MonoText>
                              </View>
                            </TouchableOpacity>
                          )}}
                  />
             </View>
           }
           </ScrollView>
          </View>
        </Modal>
      )
    }

    openVariantSelection=(variants,type)=>{
      console.log(variants,'jjjjjjjj');
      this.setState({selectionType:type,selectedProduct:variants,variantShow:true})
    }

  render() {

    var themeColor = this.props.store.themeColor


     return (
       <View style={[styles.container]}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <ScrollView style={{flex:1,}}>
        {this.state.sellerDetails!=null&&
        <View style={{marginBottom:10,}}>
           <View style={{flexDirection:'row',paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2',paddingHorizontal:15}}>
             <View style={{flex:0.2,alignItems:'flex-start',justifyContent:'center'}}>
                  <View style={{height:54,width:54,borderRadius:27,backgroundColor:themeColor,alignItems:'center',justifyContent:'center'}}>
                  {this.state.sellerDetails.logo==null&&
                   <MonoText   style={{ fontSize:22,color:'#fff'}}>{this.state.sellerDetails.name.length>0?this.state.sellerDetails.name.charAt(0).toUpperCase():''}</MonoText>
                  }
                  {this.state.sellerDetails.logo!=null&&
                   <Image source={{uri:this.state.sellerDetails.logo}} style={{width:'100%',height:'100%', borderRadius:27,backgroundColor:'#f2f2f2',borderWidth:2,borderColor: "#f2f2f2",resizeMode:'cover',overflow: 'hidden'}}/>
                  }
                 </View>
             </View>
             <View style={{flex:0.55,alignItems:'flex-start',justifyContent:'center'}}>
                 <MonoText   style={{ fontSize:18,color:'#000'}} numberOfLines={2}>{this.state.sellerDetails.name} </MonoText>
                 {/*<View style={{flexDirection:'row',justifyContent:'center'}}>
                   <View style={{marginTop:3}}>
                     <FontAwesome  name="map-marker" size={15} color={themeColor} />
                   </View>
                   <MonoText   style={{ fontSize:16,color:'#000',marginLeft:5}}>{this.state.sellerDetails.address}</MonoText>
                 </View>*/}
             </View>
             <View style={{flex:0.25,alignItems:'flex-end',justifyContent:'center'}}>
                 {chatView&&<TouchableOpacity onPress={()=>{this.goToChat()}} style={{borderWidth:1,borderColor:'#f2f2f2',borderRadius:5,backgroundColor:'#fff',paddingVertical:3,paddingHorizontal:15}}>
                   <MonoText   style={{ fontSize:16,color:themeColor}}>Chat</MonoText>
                 </TouchableOpacity>}
             </View>
           </View>

        <View style={{paddingHorizontal:15,paddingVertical:15,}}>
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
              <View style={{flexDirection:'row',}}>
                <View style={{flex:0.4,alignItems:'flex-start',justifyContent:'center'}}>
                  <MonoText   style={{ color:'grey',fontSize:16}}>Buisness</MonoText>
                </View>
                <View style={{flex:0.6,justifyContent:'center'}}>
                  <MonoText   style={{ color:'#000',fontSize:16}}>{this.state.sellerDetails.vendor_typ}</MonoText>
                </View>
              </View>
              <View style={{flexDirection:'row',marginVertical:10,}}>
                <View style={{flex:0.4,alignItems:'flex-start',justifyContent:'center'}}>
                  <MonoText   style={{ color:'grey',fontSize:16}}>Location</MonoText>
                </View>
                <View style={{flex:0.6,justifyContent:'center'}}>
                  <MonoText   style={{ color:'#000',fontSize:16}}>{this.state.sellerDetails.city}</MonoText>
                </View>
              </View>
              <View style={{flexDirection:'row',}}>
                <View style={{flex:0.4,alignItems:'flex-start',justifyContent:'center'}}>
                  <MonoText   style={{ color:'grey',fontSize:16}}>Industry</MonoText>
                </View>
                <View style={{flex:0.6,justifyContent:'center'}}>
                  <MonoText   style={{ color:'#000',fontSize:16}}>{this.state.sellerDetails.industryType==null?' - ':this.state.sellerDetails.industryType}</MonoText>
                </View>
              </View>
              <View style={{flexDirection:'row',marginTop:10}}>
                <View style={{flex:0.4,alignItems:'flex-start',justifyContent:'center'}}>
                  <MonoText   style={{ color:'grey',fontSize:16}}>GST</MonoText>
                </View>
                <View style={{flex:0.6,justifyContent:'center'}}>
                  <MonoText   style={{ color:'#000',fontSize:16}}>{this.state.sellerDetails.gstin.length>0?'Available':'Not Avalaible'}</MonoText>
                </View>
              </View>
            </View>
        </View>

        <View style={{flexDirection:'row', borderWidth: 1,borderColor:'#f2f2f2',height: 45, }}>
          <View style={{flex:0.15,justifyContent:'center',alignItems:'center'}}>
            <FontAwesome name={'search'} color={'#000'} size={20} />
          </View>
          <View style={{flex:0.85,justifyContent:'center'}}>
            <TextInput style={{width:'100%',fontSize:16  }} ref={input => { this.textInput = input }} placeholder={'Search from all products'}
            onChangeText={(text) =>{this.setState({searchValue:text})}} onSubmitEditing={()=>{this.search(this.state.searchValue)}} value={this.state.searchValue}/>
          </View>
        </View>

        <View style={{paddingVertical:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
            <View style={{paddingRight:15}}>
              <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginTop: 0, paddingLeft: 15,marginBottom:0,paddingBottom:0}}
              data={this.state.categoryList}
              keyExtractor={(item,index) => {
                return index.toString();
              }}
              extraData={this.state}
              horizontal={true}
              nestedScrollEnabled={true}
              renderItem={({item, index}) => (
                <View style={{justifyContent: 'center',marginLeft:10}}>
                  <TouchableOpacity onPress={()=>{this.setCategory(item.pk,index)}} style={{paddingVertical:10,paddingHorizontal:10,backgroundColor:this.state.searchResults?'#f2f2f2':(this.state.selectedCategoryIdx==index?themeColor:'#f2f2f2'),borderRadius:5}}>
                    <MonoText   style={{ color:this.state.searchResults?themeColor:(this.state.selectedCategoryIdx==index?'#fff':themeColor)}}>{entities.decode(item.name)}</MonoText>
                  </TouchableOpacity>
                </View>
              )}
              />
            </View>
          </ScrollView>
        </View>


          <View style={{}} >
            <FlatList
              style={{ marginLeft: -(width * 0.04), marginBottom: 0, paddingTop: 0   }}
              data={this.state.products}
              keyExtractor={(item,idx) => {
                return idx.toString();
              }}
              renderItem={({item, index, separators}) => (
                <ProductFullCardV2  ref={(ref) => this.refs[index] = ref} product={item} key={index} openVariantSelection={(state)=>{this.openVariantSelection(state,'product')}} product={item} index={index} selectedStore={this.state.sellerDetails} cartItems={this.state.cartItems} onChange={ (args)=> this.updateCart(args)} navigation={this.props.navigation} userScreen={this.state.userScreen} store={this.state.store} modalVisible={(bool)=>{this.setModalVisible(bool)}} />
              )}
              extraData={this.state}
              ListFooterComponent={this._renderSearchResultsFooter}
            />
            <View style={{alignItems:'center',justifyContent:'center',paddingVertical:20}}>
              { !this.state.loading&&this.state.loadMore&&!this.state.searchResults&&this.state.products.length>0&&
                <TouchableOpacity onPress={()=>this.loadMore()}  style={{padding:7,borderWidth:1,backgroundColor:themeColor,borderColor:themeColor,}} >
                  <MonoText   style={{ color:'#fff',fontSize:15}}>Load More</MonoText>
                </TouchableOpacity>
              }
              { !this.state.loading&&!this.state.loadMore&&
                <View   style={{}} >
                  <MonoText   style={{ color:'#000',fontSize:15}}>No Products</MonoText>
                </View>
              }
            </View>
          </View>

      </View>

    }

        </ScrollView>
        {this.variantSelection()}
       </View>
     );
   }
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    modalView: {
       backgroundColor: '#fff',
       // marginHorizontal: width-30 ,
       borderRadius:5,
       margin: 0,
       position:'absolute',
       top:width*0.5,
       left:0,
       right:0
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
      user : state.cartItems.user,
      store:state.cartItems.store,
      myStore:state.cartItems.myStore,
      storeType:state.cartItems.storeType,
      selectedStore:state.cartItems.selectedStore,
    }
  }

  const mapDispatchToProps = (dispatch) => {
    return {
      addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
      decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
      increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
      setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
      removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
      emptyCartFunction:()=>dispatch(actions.emptyCart()),
      setMyStoreFunction:(myStore,storeRole)=>dispatch(actions.setMyStore(myStore,storeRole)),
      removeMyStoreFunction:()=>dispatch(actions.removeMyStore()),
    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(SellerDetails);
