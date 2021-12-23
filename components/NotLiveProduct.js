import * as React from 'react';
import {Animated, StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList ,Platform,ScrollView,NativeModules,LayoutAnimation,AsyncStorage,ActivityIndicator,Keyboard} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown-v2';
import settings from '../constants/Settings.js';
import { Switch } from 'react-native-paper';
import { MonoText } from './StyledText';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const storeType = settings.storeType

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

export default class NotLiveProduct extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redeem:[],
      scrollY: new Animated.Value(0),
      myStore:props.myStore,
      products:[],
      offset:0,
      isLoading:false,
      showProducts:props.products,
      productsArr:[],
      loadMore:true,
      keyboardOffset:0,
      masterStore:props.masterStore,
      themeColor:props.masterStore.themeColor,
      update:false
    }
    Keyboard.addListener(
    'keyboardDidHide',
    this.keyboardDidHide
   )
   Keyboard.addListener(
      'keyboardDidShow', this.keyboardDidShow
   )
  }
  componentDidMount(){
     // this.getProducts()
     this.getVariant(0)
  }

  componentWillReceiveProps({products,notLive}){
    if(products.length>0){
      this.setState({products:products,loadMore:false})
    }else{
      this.setState({products:this.state.productsArr,loadMore:true})
    }
    console.log(notLive,'notLive');
    // this.getVariant(0)
    // if(notLive!=null){
    //   this.setState({products:[],})
      // var pkList = this.state.products.map((i)=>{return i.pk})
      // if(pkList.includes(notLive.pk)){
      //   if(notLive.live){
      //
      //   }
      // }
    // }
  }

  keyboardDidShow=(event)=> {
        this.setState({
            keyboardOffset: event.endCoordinates.height+27,
        })
    }

    keyboardDidHide=()=> {
        this.setState({
            keyboardOffset: 27,
        })
  }


  getProducts=async()=>{
     if(storeType=='MULTI-OUTLET'){
       this.setState({pageIndex:0})
        if(this.state.myStore.pk!=undefined&&this.state.myStore.pk!=this.state.masterStore.pk){
         await fetch(SERVER_URL +'/api/POS/outletProductsDetailed/?storeid='+this.state.myStore.pk+'&page='+this.state.pageIndex)
         .then((response) =>{return response.json()})
         .then((responseJson) => {
             var arr =  []
             for (var i = 0; i < responseJson.data.length; i++) {
               arr.push(responseJson.data[i])
             }
             this.setState({ products:arr, isLoading: false ,offset:this.state.offset+10})
             this.setState({listBackup: arr})
             })
             .catch((error) => {
               return
             });
           }else{
             await fetch(SERVER_URL + '/api/POS/productlitesv/?offset=0&limit=24&storeid='+this.state.myStore.pk)
             .then((response) => { return response.json()})
             .then((responseJson) => {
               var arr =  []
               for (var i = 0; i < responseJson.results.length; i++) {
                 arr.push(responseJson.results[i])
               }
               this.setState({ products:arr, isLoading: false ,offset:this.state.offset+10})
               this.setState({listBackup: arr})
             })
             .catch((error) => {
               return
             });
           }
         }else{
           await fetch(SERVER_URL + '/api/POS/productVariantgetsv/?offset='+this.state.offset+'&limit='+24+'notLive=true&storeid='+this.state.myStore.pk)
           .then((response) => response.json())
           .then((responseJson) => {
             var arr =  []
             for (var i = 0; i < responseJson.results.length; i++) {
               arr.push(responseJson.results[i])
             }
             this.setState({ products:arr,productsArr:arr, isLoading: false ,offset:this.state.offset+24})
             this.setState({listBackup: arr})
           })
           .catch((error) => {
             return
           });
         }

      }

  getVariant=(offset)=>{
     console.log(this.state.offset,'offset');
      fetch(SERVER_URL + '/api/POS/productVariantgetsv/?notLive=true&storeid='+this.state.myStore.pk+'&limit='+24+'&offset='+offset)
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson,'response');
      var arr =  this.state.products
      for (var i = 0; i < responseJson.results.length; i++) {
        arr.push(responseJson.results[i])
      }
      this.setState({ products:arr,productsArr:arr, isLoading: false ,offset:offset+24})
      this.setState({listBackup: arr})
      this.props.update(null)
    })
    .catch((error) => {
      return
    });
  }

  handleScroll=(event)=>{
    Animated.event(
        [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
    )(event)
    this.props.scollUpdate(this.state.scrollY)
  }

  renderHeader = () => {
    return (
      <View style={{paddingVertical: 8,flex:1,backgroundColor:'#f2f2f2',flexDirection: 'row'}}>
        <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
          <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>Status</MonoText>
        </View>
        <View style={{flex:0.3,alignItems: 'center',justifyContent: 'center'}}>
          <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>SellingPrice</MonoText>
        </View>
        <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
          <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>MOQ</MonoText>
        </View>
        <View style={{flex:0.3,alignItems: 'center',justifyContent: 'center'}}>
          <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>Details</MonoText>
        </View>
      </View>
    )
   };

   changeStatus=async(item,index,)=>{
     var list = this.state.products
     var dataToSend = {
       enabled:!item.enabled,
     }
     var sessionid = await AsyncStorage.getItem('sessionid');
     var csrf = await AsyncStorage.getItem('csrf');
     this.setState({sessionid:sessionid,csrf:csrf})
     fetch(SERVER_URL+'/api/POS/productVariantsv/'+item.pk+'/',{
       method: 'PATCH',
       headers: {
          "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
          'Accept': 'application/json, text/plain,',
          'Content-Type': 'application/json;charset=utf-8',
          'X-CSRFToken':csrf,
          'Referer': SERVER_URL
        },
       body:JSON.stringify(dataToSend)
       }).then((response) =>{
       if(response.status === 200||response.status == '200' ){
         return response.json()
       }
       }).then((json) => {
         list[index].enabled = json.enabled
         this.setState({products:list})
         this.props.changeLive({pk:item.pk,live:json.enabled,parent:json.parent})
       }).catch((error) => {
           Alert.alert('Something went wrong in Server side');
     });
   }

   reLoad=(item)=>{
     var products= this.state.products
     var index = null
     products.forEach((i,idx)=>{
       if(i.pk==item.pk){
         index = idx
       }
     })
     if(index!=null){
       products[index] = item
     }
     this.setState({products:products})

   }
   reloadRes=()=>{
     this.setState({offset:0,products:[]})
     // this.getProducts()
     this.getVariant(0)
   }

   view=(item)=>{
     return
     this.props.navigation.navigate('ProductVariantDetails',{item:item,reload:(item)=>this.reLoad(item),reloadRes:()=>this.reloadRes()})
   }


render(){
  var {themeColor} = this.state
  return(
    <View style={{flex:1,}}>
      <Animated.ScrollView ref={ref => { this.scrollView = ref; }} style={{flex:1,paddingVertical: 15, }}
      onScroll={this.handleScroll} scrollEventThrottle={16}>
        <View style={{marginHorizontal:6,marginBottom:20,paddingBottom:this.state.keyboardOffset}} >
        <FlatList
            data={this.state.products}
            extraData={this.state}
            inverted={false}
            scrollToEnd={true}
            horizontal={false}
            nestedScrollEnabled={true}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index})=>{
              var parentIdx = index
              if(item.images.length>0){
                var imageShow = true
              }else{
                var imageShow = false
              }
              return(
                <View  style={{paddingHorizontal:15,paddingVertical:15,width:'100%',}}>
                  <Card containerStyle={[styles.shadow, {borderWidth: 0, borderColor: '#fff',width:'100%',margin:0,padding: 0,margin:0,paddingTop:10,borderRadius:5}]}>
                    <TouchableOpacity onPress={()=>{this.view(item)}} activeOpacity={1}>
                      {/*<View style={{flex:1,flexDirection:'row'}}>
                        <View style={{flex:0.7,justifyContent:'flex-start',alignItems:'flex-start'}}>
                          <MonoText   style={{paddingHorizontal:15,paddingBottom:2,fontWeight:'700',fontSize:16}}>{item.displayName}</MonoText>
                        </View>
                        {<TouchableOpacity style={{flex:0.3,justifyContent:'flex-end',alignItems:'center'}} onPress={()=>this.props.navigation.navigate('ProductDetails',{product:item.parent,userScreen:this.props.userScreen})}>
                          <MonoText   style={{paddingHorizontal:15,paddingBottom:2,fontWeight:'700',fontSize:16}}>View</MonoText>
                        </TouchableOpacity>}
                      </View>*/}
                      <View style={{flex:1,flexDirection:'row',paddingHorizontal:15}}>
                        {imageShow&&
                          <View style={{flex:0.2,justifyContent:'flex-start',alignItems:'flex-start'}}>
                          <Image source={{uri:item.images[0].attachment}} style={{width:60,height:60}} />
                          </View>
                        }
                        {!imageShow&&
                          <View style={{flex:0.2,justifyContent:'flex-start',alignItems:'flex-start'}}>
                          <View style={{width:60,height:60,backgroundColor:'#f2f2f2'}} />
                          </View>
                        }
                        <View style={{flex:0.8,justifyContent:'center',alignItems:'flex-start'}}>
                          <MonoText   style={{paddingHorizontal:15,paddingBottom:2,fontWeight:'700',fontSize:16}}>{item.displayName}</MonoText>
                        </View>
                      </View>

                      <MonoText   style={{paddingHorizontal:15,paddingVertical:2,}}>{item.category==null?'':'Category : '+item.category.name}</MonoText>
                        {this.renderHeader()}
                        <View style={{paddingVertical:8,flex:1,backgroundColor:(index+1)%2==0?'#f2f2f2':'#fff',flexDirection: 'row',borderRightWidth: 1,borderLeftWidth: 1,borderColor: '#f2f2f2'}}>
                            <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center',}}>
                              <Switch
                               onValueChange={()=>{this.changeStatus(item,index,)}}
                               value={item.enabled}
                               color={themeColor}
                               />
                            </View>
                            <View style={{flex:0.3,flexDirection:"row",alignItems: 'center',justifyContent:'center'}}>
                              <MonoText
                                style={{color:'#dd0e0e',textAlign:'left',textDecorationLine:'line-through',
                                        textDecorationStyle:'solid',}}>
                                  &#8377;{item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</MonoText>
                              <MonoText   style={{marginLeft:5}}>&#8377;{item.sellingPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</MonoText>
                            </View>
                            <View style={{flex:0.3,alignItems: 'center',justifyContent: 'center'}}>
                              <MonoText   style={{flex:0.13,paddingHorizontal:0,}}>{item.minQtyOrder}</MonoText>
                            </View>
                            <View style={{flex:0.3,justifyContent: 'center',alignSelf: 'center',}}>
                            {(item.unitType!='Color'&&item.unitType!='Size and Color'&&item.unitType!='Quantity and Color')&&
                            <View style={{flex:1,flexDirection:'row',justifyContent:'space-between',paddingRight:10}}>
                                <MonoText   style={{}}>{item.unitType} </MonoText>
                                <MonoText   style={{marginLeft:5,}}>{item.value}</MonoText>
                            </View>
                          }

                            {item.unitType=='Color'&&
                              <View style={{justifyContent:'center',borderWidth:0,marginTop:6,borderRadius:50,height:width*0.03,width:width*0.03,backgroundColor:item.value}}>
                              </View>
                            }

                            {(item.unitType=='Size and Color'||item.unitType=='Quantity and Color')&&
                              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingRight:10}}>
                                  <MonoText   style={{}}>
                                    {item.unitType.split(" ")[0]} </MonoText>
                                  <MonoText   style={{}}>{item.value} </MonoText>
                                  <View style={{borderWidth:0,borderRadius:50,marginTop:4,alignSelf:'center',
                                                height:width*0.03,width:width*0.03,backgroundColor:item.value2}}>
                                  </View>
                             </View>
                            }
                            </View>
                          </View>

                    </TouchableOpacity>
                  </Card>
                </View>
              )}}
          />
          {this.state.isLoading&&
            <View  style={{marginTop:20}}>
              <ActivityIndicator size="large" color={this.state.themeColor}  />
            </View>
          }
          {!this.state.isLoading&&this.state.loadMore&&
            <View style={{alignItems:'center'}}>
              <TouchableOpacity onPress={()=>{this.getVariant(this.state.offset)}}  style={{padding:7,borderWidth:1,backgroundColor:themeColor,borderColor:themeColor,}} >
                <MonoText   style={{color:'#fff',fontSize:15}}>Load More</MonoText>
              </TouchableOpacity>
            </View>
          }
        </View>

        </Animated.ScrollView>
      </View>
  )
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
  }
})
