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

export default class LiveProduct extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redeem:[],
      scrollY: new Animated.Value(0),
      myStore:props.myStore,
      products:[],
      searchProducts:[],
      offset:0,
      isLoading:false,
      showProducts:props.products,
      productsArr:[],
      loadMore:true,
      keyboardOffset:0,
      masterStore:props.masterStore,
      pageIndex:0,
      themeColor:props.masterStore.themeColor,
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
    this.getProducts()
  }

  componentWillReceiveProps({products,changeLive}){
    console.log(changeLive,'kkkkkkkkkk');
    if(products.length>0){
      this.setState({products:products,loadMore:false})
    }else{
      this.setState({products:this.state.productsArr,loadMore:true})
    }
    // if(changeLive!=null){
    //   var list = this.state.products
    //   var pkList = this.state.products.map((i)=>{return i.pk})
    //   if(pkList.includes(changeLive.parent)){
    //     var index = pkList.indexOf(changeLive.parent)
    //     var item = list[index]
    //     item.variant.forEach((i)=>{
    //       if(changeLive.pk == i.pk){
    //         i.enabled = changeLive.live
    //       }
    //     })
    //
    //     this.setState({products:list})
    //   }
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

        if(this.state.masterStore.pk!=undefined&&this.state.masterStore.pk!=this.state.myStore.pk){
         await fetch(SERVER_URL +'/api/POS/outletProductVariantAvailability/?storeid='+this.state.myStore.pk+'&page='+this.state.pageIndex)
         .then((response) =>{ return response.json()})
         .then((responseJson) => {
             var arr =  this.state.products
             for (var i = 0; i < responseJson.data.length; i++) {
               arr.push(responseJson.data[i])
             }
             this.setState({ products:arr,productsArr:arr, isLoading: false ,pageIndex:this.state.pageIndex+1})
             this.setState({listBackup: arr})
             })
             .catch((error) => {
               return
             });
           }else{
             await fetch(SERVER_URL + '/api/POS/productlitesv/?offset='+this.state.offset+'&limit=24&storeid='+this.state.myStore.pk)
             .then((response) => { return response.json()})
             .then((responseJson) => {
               var arr =  this.state.products
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
         }else{
           await fetch(SERVER_URL + '/api/POS/productlitesv/?offset='+this.state.offset+'&limit=24&storeid='+this.state.myStore.pk)
           .then((response) => response.json())
           .then((responseJson) => {
             var arr =  this.state.products
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

   changeStatus=async(item,index,parentIdx)=>{
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
         list[parentIdx].variant[index].enabled = json.enabled
         this.setState({products:list})
         this.props.notLive({pk:item.pk,live:json.enabled})
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
     this.getProducts()
   }

   view=(item)=>{
     this.props.navigation.navigate('ProductView',{item:item,reload:(item)=>this.reLoad(item),reloadRes:()=>this.reloadRes()})
   }


render(){
  var {themeColor} = this.state
  return(
    <View style={{flex:1,}}>
      <Animated.ScrollView ref={ref => { this.scrollView = ref; }} style={{flex:1,paddingVertical: 15,paddingTop:5 }}
      onScroll={this.handleScroll} scrollEventThrottle={16}>
        <View style={{marginBottom:20,paddingBottom:this.state.keyboardOffset}} >
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
              if(item.variant.length>0&&item.variant[0].images.length>0){
                var imageShow = true
              }else{
                var imageShow = false
              }
              return(
                <View  style={{paddingVertical:5,width:'100%',}}>
                  <Card containerStyle={[styles.shadow, {borderWidth: 0, borderColor: '#fff',width:'100%',margin:0,padding: 0,margin:0,paddingTop:10,}]}>
                    <TouchableOpacity onPress={()=>{this.view(item)}} activeOpacity={1}>
                      <View style={{flex:1,flexDirection:'row',paddingHorizontal:15}}>
                        {imageShow&&
                          <View style={{flex:0.2,justifyContent:'flex-start',alignItems:'flex-start'}}>
                          <Image source={{uri:SERVER_URL+item.variant[0].images[0].attachment}} style={{width:60,height:60,width:'100%'}} />
                          </View>
                        }
                        {!imageShow&&
                          <View style={{flex:0.2,justifyContent:'flex-start',alignItems:'flex-start'}}>
                          <View style={{width:60,height:60,backgroundColor:'#f2f2f2'}} />
                          </View>
                        }
                        <View style={{flex:0.6,justifyContent:'flex-start',alignItems:'flex-start'}}>
                          <MonoText   style={{paddingHorizontal:5,paddingBottom:2,fontWeight:'700',fontSize:16}}>{item.name}</MonoText>
                          <MonoText   style={{paddingHorizontal:5,paddingVertical:2,}}>{item.category==null?'':'Category : '+item.category.name}</MonoText>
                          <MonoText   style={{paddingHorizontal:5,paddingVertical:2,}}>{item.description}</MonoText>
                        </View>
                        <TouchableOpacity style={{flex:0.2,justifyContent:'flex-end',alignItems:'center',backgroundColor:themeColor,marginRight:5,borderRadius:5,height:30}} onPress={()=>this.props.navigation.push('ProductViewSeller',{product:item.pk,userScreen:this.props.userScreen})}>
                          <MonoText   style={{paddingHorizontal:5,paddingVertical:4,fontWeight:'700',fontSize:16,color:'#fff'}}>View</MonoText>
                        </TouchableOpacity>
                      </View>

                      {/*<View style={{flex:1,flexDirection:'row'}}>
                        <View style={{flex:0.8,justifyContent:'flex-start',alignItems:'flex-start'}}>
                          <MonoText   style={{paddingHorizontal:15,paddingBottom:2,fontWeight:'700',fontSize:16}}>{item.name}</MonoText>
                        </View>
                        <TouchableOpacity style={{flex:0.2,justifyContent:'flex-end',alignItems:'center',backgroundColor:themeColor,marginRight:5,borderRadius:5}} onPress={()=>this.props.navigation.push('ProductViewSeller',{product:item.pk,userScreen:this.props.userScreen})}>
                          <MonoText   style={{paddingHorizontal:5,paddingVertical:4,fontWeight:'700',fontSize:16,color:'#fff'}}>View</MonoText>
                        </TouchableOpacity>
                      </View>*/}
                      {/*<MonoText   style={{paddingHorizontal:15,paddingVertical:2,}}>{item.category==null?'':'Category : '+item.category.name}</MonoText>
                      {item.description!=null&&
                      <MonoText   style={{paddingHorizontal:15,paddingVertical:2,}}>{item.description}</MonoText>
                    }*/}
                      {item.variant.length>0&&
                      <View style={{marginTop:15}}>
                      <FlatList
                          data={item.variant}
                          extraData={this.state}
                          inverted={false}
                          scrollToEnd={true}
                          horizontal={false}
                          ListHeaderComponent={this.renderHeader}
                          nestedScrollEnabled={true}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({item, index})=>(
                              <View style={{paddingVertical:8,flex:1,backgroundColor:(index+1)%2==0?'#f2f2f2':'#fff',flexDirection: 'row',borderRightWidth: 1,borderLeftWidth: 1,borderColor: '#f2f2f2'}}>
                                <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center',}}>
                                  <Switch
                                   onValueChange={()=>{this.changeStatus(item,index,parentIdx)}}
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
                                <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
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
                          )}
                          />
                          </View>
                        }
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
            <View style={{alignItems:'center',marginTop:10}}>
              <TouchableOpacity onPress={()=>{this.getProducts()}}  style={{padding:7,borderWidth:1,backgroundColor:themeColor,borderColor:themeColor,}} >
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
