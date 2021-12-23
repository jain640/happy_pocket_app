import React,{Component} from 'react';
import {Animated,View,Text,Dimensions,TextInput,TouchableOpacity,StyleSheet,FlatList,AsyncStorage,ScrollView} from 'react-native';
import Constants from 'expo-constants';
import {FontAwesome,Ionicons,MaterialIcons}from '@expo/vector-icons';
import Modal from "react-native-modal";
import { Dropdown } from 'react-native-material-dropdown-v2';
const { width } = Dimensions.get('window');
import { withNavigationFocus,DrawerActions } from 'react-navigation';
import { createDrawerNavigator,DrawerItems } from 'react-navigation-drawer';
import settings from '../constants/Settings.js';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { Card ,SearchBar , Icon} from 'react-native-elements';
import { MonoText } from '../components/StyledText';
import { Switch } from 'react-native-paper';
import LiveProduct from '../components/LiveProduct.js';
import NotLiveProduct from '../components/NotLiveProduct.js';


const tabs = [
  {
    name:'All',
  },
  {
    name:'Not Live',
  },

]

const storeType = settings.storeType
const SERVER_URL = settings.url;


class ProductList extends React.Component{

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;

        return {
          drawerLabel: 'MyProducts',
          title: (params.text1==true?'':'Products'),
          headerLeft: (
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
                 {params.text1==true ?
                 <TouchableOpacity onPress={()=>{params.isSearchState(params.text1);params.searchContact("");}}>
                        <MaterialIcons name="arrow-back" size={30} color={params.text1==true?params.themeColor:'#fff'} style={{paddingRight:8}}/>
                 </TouchableOpacity>:<TouchableOpacity onPress={()=>{navigation.navigate('SellerZone');}}>
                        <MaterialIcons name="arrow-back" size={30} color={params.text1==true?params.themeColor:'#fff'}/>
                 </TouchableOpacity>}
                 {params.text1==true &&
                 <SearchBar
                            containerStyle={{padding:0,width:width*0.8,marginBottom:3,marginTop:0,borderWidth:0,backgroundColor:'transparent',height:30,borderTopWidth:0}}
                            inputContainerStyle={{padding:0,height:30,width:width*0.8,marginTop:0,marginBottom:2,backgroundColor:'#f9f9f9'}}
                            inputStyle={{color:params.themeColor}}
                            placeholder="Search here"
                            placeholderTextColor={params.themeColor}
                            onChangeText={text => {params.searchContact(text);}}

                            value={params.text}
                            onEndThreshold={0}
                            textColor={params.themeColor}
                            searchIcon={<FontAwesome
                              reverse
                              name='search'
                              color={params.themeColor}
                              size ={16}
                            />
                            }
                            cancelIcon={<FontAwesome
                              reverse
                              name='close'
                              color={params.themeColor}
                              onPress={() => {params.isSearchState(params.text1);}}
                            />}

                    />}
            </View>
         ),
         headerRight:(<View>
           {params.text1==false&&<TouchableOpacity onPress={()=>{params.isSearchState(params.text1);}}><FontAwesome
                reverse
                name='search'
                color='#fff'
                size ={20}
                style={{paddingRight:10}}
              /></TouchableOpacity>}
            </View>
         ),
          headerStyle: {
            backgroundColor:params.text1==true?"#f9f9f9":params.themeColor,
            marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
          },
          headerTintColor: '#ffffff',
        }
    };

    constructor(props){
        super(props);
        this.state = {
          userStore:null,
          myStore:this.props.myStore,
          products:[],
          store:this.props.store,
          enabled:false,
          offset:0,
          isLoading:true,
          listBackup:[],
          text:'',
          PVariant:[],
          text1:false,
          isView:true,
          scrollX : new Animated.Value(0),
          scrollY: new Animated.Value(0),
          selectedTab:0,
          products:[],
          allProducts:[],
          changeLive:null,
          pageIndex:0,
          masterStorePK:this.props.masterStorePK,
          selectedStore:this.props.selectedStore,
          themeColor:this.props.masterStore.themeColor,
          notLive:[],
          updateNotLive:null
        }
    }



    componentDidMount=async()=>{
        this.props.navigation.setParams({
          themeColor: this.state.themeColor,
          text: this.state.text,
          text1:this.state.text1,
          searchContact:((text)=>this.searchContact(text)),
          isSearchState:((text1)=>this.isSearchState(text1)),
        });
    }

    isSearchState=(text1)=>{
          this.props.navigation.setParams({
            text1:!this.state.text1,
          });
          this.setState({text1:!text1})
      }

  getProducts=async(query)=>{
    if(this.state.selectedTab==0){
     if(storeType=='MULTI-OUTLET'){
       this.setState({pageIndex:0})
        if(this.props.myStore.pk!=undefined&&this.props.myStore.pk!=this.state.store.pk){
         await fetch(SERVER_URL +'/api/POS/outletProductVariantAvailability/?storeid='+this.props.myStore.pk+'&page='+this.state.pageIndex)
         .then((response) =>{ return response.json()})
         .then((responseJson) => {
            this.setState({products: responseJson.data})
             })
             .catch((error) => {
               return
             });
           }else{
             await fetch(SERVER_URL + '/api/POS/productlitesv/?name__icontains='+query+'&storeid='+this.state.store.pk)
             .then((response) => { return response.json()})
             .then((responseJson) => {
               this.setState({products: responseJson.results})
             })
             .catch((error) => {
               return
             });
           }
         }else{
           await fetch(SERVER_URL + '/api/POS/productlitesv/?offset=0&limit=10&name__icontains='+query+'&storeid='+this.props.myStore.pk)
           .then((response) => response.json())
           .then((responseJson) => {
             this.setState({products: responseJson.results})
           })
           .catch((error) => {
             return
           });
         }
       }else{
           await fetch(SERVER_URL + '/api/POS/productVariantgetsv/?notLive=true&storeid='+this.state.myStore.pk+'&limit='+24+'&offset='+0)
           .then((response) => response.json())
           .then((responseJson) => {
             var arr =  []
             for (var i = 0; i < responseJson.results.length; i++) {
               arr.push(responseJson.results[i])
             }
             this.setState({ notLive:arr,})
           })
           .catch((error) => {
             return
           });
       }


      }



    searchContact = (query)=>{
        this.setState({text:query})
        this.props.navigation.setParams({
          text:()=>this.setState({text:query}),
        });
        if(query.length == 0){
          this.setState({products: []})
          return
        }
        this.getProducts(query);
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


  render(){
    var {themeColor} = this.state
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
               <MonoText   style={{fontSize:16,fontWeight:'700',color:this.state.selectedTab==i?themeColor:'#000'}}>{item.name}</MonoText>
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
                  <LiveProduct changeLive={this.state.changeLive} scollUpdate={(position,direction)=>{if(position<0){this.setState({scrollY:new Animated.Value(0)});LayoutAnimation.easeInEaseOut();}else{this.setState({scrollY:position});}}} notLive={(pk)=>this.setState({updateNotLive:pk})} myStore={this.props.myStore} navigation={this.props.navigation} products={this.state.products} masterStore={this.state.store}/>
                }
                {i==1&&this.state.selectedTab==1&&
                  <NotLiveProduct scollUpdate={(position)=>this.setState({scrollY:position})} update={(val)=>this.setState({updateNotLive:val})} myStore={this.props.myStore}  navigation={this.props.navigation} changeLive={(val)=>this.setState({changeLive:val})} products={this.state.notLive} masterStore={this.state.store} notLive={this.state.updateNotLive}/>
                }

                </View>
              );
            })}

        </ScrollView>
      </View>
    )
  }
}
const styles=StyleSheet.create({
  modalView: {
      backgroundColor: '#fff',
      marginHorizontal: width*0.05 ,
      borderRadius:5,
   },
})

const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    masterStore:state.cartItems.masterStore,
    selectedStore:state.cartItems.selectedStore,
    myStore:state.cartItems.myStore
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

export default connect(mapStateToProps, mapDispatchToProps)(ProductList);
