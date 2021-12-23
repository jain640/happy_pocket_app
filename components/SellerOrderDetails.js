import React, {Component}from 'react';
import {View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  AsyncStorage,
  Image,ScrollView,FlatList,
  ImageBackground,ActivityIndicator,Alert}from 'react-native';
import { Ionicons ,FontAwesome,MaterialCommunityIcons,MaterialIcons, } from '@expo/vector-icons';
import settings from '../constants/Settings';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import * as WebBrowser  from 'expo-web-browser';
import  ModalBox from 'react-native-modalbox';
import { MonoText } from './StyledText';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
const { width,height } = Dimensions.get('window');
class SellerOrderDetails extends Component{
    constructor(props){
        super(props);
        var history = props.navigation.getParam('history')
        this.state={
            store:this.props.store,
            last_name:'',
            first_name:'',
            login:false,
            dp:'',
            OrderItem:[],
            Order:[],
            loader:false,
            history:history,
            openShipment:false,
            goodCode:null,
            pickupTime:new Date()
        }
    }

    static navigationOptions=({navigation})=>{
        const { params ={} }=navigation.state
        var title = '#'+params.pk
        var status = params.status
        return{
            title:params.pk!=undefined?title:'',
            headerLeft:(
              <View style={{justifyContent:'flex-start',paddingLeft:15,}}>
                  <TouchableOpacity onPress={()=>{navigation.goBack();}}>
                    <MaterialIcons name="arrow-back" size={30} color={params.themeColor}/>
                  </TouchableOpacity>
              </View>
            ),
            headerRight:(
              status!=undefined?
                <View style={{justifyContent:'flex-end',borderWidth:1,paddingVertical:4,marginRight:8,borderColor:params.themeColor,
                            paddingHorizontal:10,borderRadius:20,backgroundColor:params.themeColor}}>
                  <MonoText   style={{fontSize:16,color:'#ffffff',paddingBottom:2}}>{status}</MonoText>
              </View>:null

            ),
            headerStyle:{
                backgroundColor:'#fff'
            },
            headerTintColor: params.themeColor,
        }
    }

    componentDidMount=async()=>{
        this.setState({loader:true})
        var order=this.props.navigation.getParam('item',null)
        this.state.Order=[order]
        this.props.navigation.setParams({
          themeColor:this.state.store.themeColor,
          pk:order.pk,
          status:order.status,
        })
          var csrf = await AsyncStorage.getItem('csrf');
          const sessionid = await AsyncStorage.getItem('sessionid');
          fetch(SERVER_URL+'/api/POS/orderLite/'+order.pk+'/', {
            headers: {
              "Cookie" :"csrf="+csrf+";sessionid=" + sessionid+";",
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRFToken':csrf,
              'Referer': SERVER_URL
            },
           method: 'GET'
          }).then((response) =>{
              return response.json()
          }).then((responseJson) => {
            console.log(responseJson,'hggggggggggg');
              this.setState({loader:false})
              this.setState({ OrderItem: responseJson})
          }).catch((error) => {
              this.setState({loader:false})
              return
      });
    }

  askConfirm=(changestatus,status)=>{
    var askStatus = status
    Alert.alert(status,'Are you sure ?',
        [{text: 'Cancel', onPress: () => {
            return null
          }},
          {text: 'Confirm', onPress: () => {
             this.StatusChange(changestatus)
          }},
      ],
      { cancelable: false }
    )
  }


    StatusChange=async(changestatus)=>{
      var dataToSend = {
        status:changestatus,
      }
      var sessionid = await AsyncStorage.getItem('sessionid');
      var csrf = await AsyncStorage.getItem('csrf');
      this.setState({sessionid:sessionid,csrf:csrf,loader:true})
      fetch(SERVER_URL+'/api/POS/order/'+this.state.Order[0].pk+'/',{
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
        if(response.status === 200 ){
          this.setState({loader:false})
          this.props.navigation.navigate('SellerOrdersScreen',{changestatus:true})
          return response.json()
        }
        }).then((json) => {
          this.setState({loader:false})
        }).catch((error) => {
          this.setState({loader:false})
            Alert.alert('Something went wrong in Server side');
      });
    }

    pdfDownload = async (pk) => {
      var url = SERVER_URL+'/api/POS/downloadInvoice/?order='+pk
      console.log(url,'jjjjjjjjjj');
      await WebBrowser.openBrowserAsync(url)
    }
    packageSlipDownload = async (pk) => {
      var url = SERVER_URL+'/api/POS/downloadManifest/?order='+pk
      console.log(url,'jjjjjjjjjj');
      await WebBrowser.openBrowserAsync(url)
    }

    renderShipment=()=>{

        return(
            <ModalBox useNativeDriver={true}
                style={{height:height*0.75,borderTopLeftRadius:15,borderTopRightRadius:15,}}
                position={'bottom'}
                ref={'attachModal'}
                swipeToClose={this.state.openShipment} swipeArea={50}
                isOpen={this.state.openShipment}
                onClosed={()=>{this.setState({openShipment:false})}}>
                <ScrollView style={{}} contentContainerStyle={{}}>

                </ScrollView>
            </ModalBox>
        )

}

    shipmentOpen=()=>{
      this.props.navigation.navigate('CreateShipment',{order:this.state.OrderItem.pk})
      // this.setState({openShipment:true})
    }

    render(){
        const changecase="/\b[a-z]|['_][a-z]|\B[A-Z]/g"
      // /[^A-Z]/g  replace(/[^A-Z]|[^a-z]/g,'').toUpperCase()
        const fname =this.state.first_name.toUpperCase();
        var orderitem=this.props.navigation.getParam('item',null)

    if(!this.state.loader&&this.state.OrderItem!=null){
    return(
        <View style={[styles.container,{backgroundColor:'#fff'}]}>


            <View style={{marginHorizontal:3,borderWidth:0,paddingTop:10,marginTop:2,
                          borderRadius:5,backgroundColor:'#fff',paddingHorizontal:8,
                          borderColor:'#f1f1f1'}}>
                <MonoText   style={{fontSize:18,color:'#7a7a7a',fontWeight:'bold'}}>Delivery Address: </MonoText>
                <View style={{paddingHorizontal:10,paddingVertical:4}} >
                    <MonoText   style={{fontSize:16,}}>{this.state.OrderItem.landMark}</MonoText>
                    <MonoText   style={{fontSize:16,}}>{this.state.OrderItem.street}</MonoText>
                    <MonoText   style={{fontSize:16,}}>{this.state.OrderItem.city} {orderitem.state}</MonoText>
                    <MonoText   style={{fontSize:16,}}>{this.state.OrderItem.country} {orderitem.pincode}</MonoText>
                </View>
            </View>
            <View style={{marginHorizontal:3,marginTop:2,flexDirection:'row',
                          borderWidth:0,borderRadius:5,backgroundColor:'#fff',paddingVertical:3,
                          paddingHorizontal:8,borderColor:'#f1f1f1',justifyContent:'space-between'}}>
                <MonoText   style={{fontSize:18,color:'#7a7a7a',fontWeight:'bold'}}>Customer Name: </MonoText>
                <MonoText   style={{fontSize:16,}}>{this.state.OrderItem.name}</MonoText>
            </View>
            <View style={{marginHorizontal:3,marginTop:2,flexDirection:'row',
                          borderWidth:0,borderRadius:5,backgroundColor:'#fff',paddingVertical:3,
                          paddingHorizontal:8,borderColor:'#f1f1f1',justifyContent:'space-between'}}>
                <MonoText   style={{fontSize:18,color:'#7a7a7a',fontWeight:'bold'}}>Customer MobileNo: </MonoText>
                <MonoText   style={{fontSize:16,}}>{this.state.OrderItem.mobileNo}</MonoText>
            </View>
            <View style={{marginHorizontal:3,marginTop:2,flexDirection:'row',
                          borderWidth:0,borderRadius:5,backgroundColor:'#fff',paddingVertical:3,
                          paddingHorizontal:8,borderColor:'#f1f1f1',justifyContent:'space-between'}}>
                <MonoText   style={{fontSize:18,color:'#7a7a7a',fontWeight:'bold',alignSelf:'flex-start'}}>Shipping Price: </MonoText>
                <MonoText   style={{fontSize:16,textAlign:'right',alignSelf:'flex-end'}}>&#8377; {this.state.OrderItem.shippingPrice}</MonoText>
            </View>
            <View style={{marginHorizontal:3,marginTop:2,flexDirection:'row',
                          borderWidth:0,borderRadius:5,backgroundColor:'#fff',paddingVertical:3,
                          paddingHorizontal:8,borderColor:'#f1f1f1',justifyContent:'space-between'}}>
                <MonoText   style={{fontSize:18,color:'#7a7a7a',fontWeight:'bold',alignSelf:'flex-start'}}>Total Amount: </MonoText>
                <MonoText   style={{fontSize:16,textAlign:'right',alignSelf:'flex-end'}}>&#8377; {this.state.OrderItem.totalAmount}</MonoText>
            </View>
            <View style={{marginHorizontal:3,marginTop:2,flexDirection:'row',
                          borderWidth:0,borderRadius:5,backgroundColor:'#fff',paddingVertical:3,
                          paddingHorizontal:8,borderColor:'#f1f1f1',justifyContent:'space-between'}}>
                <MonoText   style={{fontSize:18,color:'#7a7a7a',fontWeight:'bold',alignSelf:'flex-start'}}>Seller Amount: </MonoText>
                <MonoText   style={{fontSize:16,textAlign:'right',alignSelf:'flex-end'}}>&#8377; {this.state.OrderItem.sellerAmount}</MonoText>
            </View>
            <View style={{marginHorizontal:3,marginTop:2,
                          borderWidth:0,borderRadius:5,backgroundColor:'#fff',paddingVertical:3,
                          paddingHorizontal:8,borderColor:'#f1f1f1',}}>
                <MonoText   style={{fontSize:18,color:'#7a7a7a',}}>Items: </MonoText>
            </View>
            <View stle={{flex:1,marginTop:0.2,
                          borderWidth:0,borderRadius:5,backgroundColor:'#f0f0f0',paddingVertical:3,
                          paddingHorizontal:8,borderColor:'#f1f1f1',}}>
                <ScrollView style={{height:width*1,marginHorizontal:3,marginTop:0,
                              borderWidth:0,borderRadius:5,backgroundColor:'#fff',paddingVertical:3,
                              paddingHorizontal:8,borderColor:'#f1f1f1',}}>
                    <FlatList
                      data={this.state.OrderItem.orderQty}
                      showsVerticalScrollIndicator={false}
                      horizontal={false}
                      keyExtractor={(item,index) => {return index.toString();}}
                      nestedScrollEnabled={true}
                      renderItem={({item, index}) => (
                        <View style={{paddingHorizontal:10,paddingVertical:4,flexDirection:'row',marginVertical:4}} >
                            <FontAwesome name={'circle'} size={10} color={'#7a7a7a'}style={{paddingTop:4}}/>
                            <View style={{paddingHorizontal:10,borderWidth:0,flex:1}} >
                                <View style={{}}>
                                    <MonoText   style={{fontSize:14,alignSelf:'flex-start',flex:1}}>{item.productName}</MonoText>
                                </View>
                                <View style={{justifyContent:'space-between',flexDirection:'row',marginTop:5}}>
                                    <MonoText   style={{fontSize:14,alignSelf:'flex-start',flex:0.7}}>Price: &#8377; {item.sellingPrice}</MonoText>
                                    <MonoText   style={{fontSize:14,alignSelf:'flex-end',flex:0.3}}>TaxRate:   {item.hsnPer!=null?item.hsnPer:0}%</MonoText>
                                </View>
                                <View style={{justifyContent:'space-between',flexDirection:'row',marginTop:5}}>
                                    <MonoText   style={{fontSize:14,}}>Quantity:  {item.qty}</MonoText>
                                    <MonoText   style={{fontSize:14,}}>GST Type:  {item.gstType}</MonoText>
                               </View>
                               <View style={{marginTop:5}}>
                                <MonoText   style={{fontSize:14,}}>Sub Total: &#8377; {item.price} </MonoText>
                              </View>

                            </View>
                        </View>
                       )}
                      />

                      {orderitem.status!='newOrder' &&
                      <View style={{flex:1,}}>
                        <View style={{flex:1,flexDirection:'row',paddingVertical:10,marginTop:10,borderBottomWidth:1,borderTopWidth:1,borderColor:'#f2f2f2'}}>
                          <View style={{flex:1,justifyContent:'center'}}>
                              <MonoText   style={{fontSize:14,}}>Download Invoice</MonoText>
                          </View>
                          <View style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}>
                            <TouchableOpacity style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center',}} onPress={()=>{this.pdfDownload(orderitem.pk)}}>
                            <FontAwesome name="download" size={22} color="blue"  />
                              <MonoText   style={{fontSize:13,color:'blue',marginLeft:4}}>Download</MonoText>
                            </TouchableOpacity>
                          </View>
                        </View>
                        {orderitem.status=='packed'&&
                        <View style={{flex:1,flexDirection:'row',paddingVertical:10,borderBottomWidth:1,borderTopWidth:0,borderColor:'#f2f2f2'}}>
                          <View style={{flex:1,justifyContent:'center'}}>
                            <MonoText   style={{fontSize:14,}}>Package Slip</MonoText>
                          </View>
                          <View style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}>
                            <TouchableOpacity style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center',}} onPress={()=>{this.packageSlipDownload(orderitem.pk)}}>
                              <FontAwesome name="download" size={22} color="blue"  />
                              <MonoText   style={{fontSize:13,color:'blue',marginLeft:4}}>Download</MonoText>
                            </TouchableOpacity>
                          </View>
                        </View>
                        }
                        {orderitem.status=='packed'&&
                        <View style={{flex:1,flexDirection:'row',paddingVertical:10,borderBottomWidth:1,borderTopWidth:0,borderColor:'#f2f2f2'}}>
                          <View style={{flex:1,justifyContent:'center'}}>
                            <MonoText   style={{fontSize:14,}}>Create Shipment</MonoText>
                          </View>
                          <View style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}>
                            <TouchableOpacity style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center',backgroundColor:this.state.store.themeColor,paddingHorizontal:20,paddingVertical:5,borderRadius:15}} onPress={()=>{this.shipmentOpen()}}>
                              <MonoText   style={{fontSize:16,color:'#fff',marginLeft:4}}>Create</MonoText>
                            </TouchableOpacity>
                          </View>
                        </View>
                      }
                      </View>
                    }


              </ScrollView>
            </View>
            {this.state.history!='history'&&orderitem.status=='newOrder' &&
            <View style={{justifyContent:'space-between',flexDirection:'row',backgroundColor:'#fff',
                          position:'absolute',bottom:0,borderTopWidth:1,borderColor:'#fff'}}>

                <TouchableOpacity onPress={()=>{this.askConfirm('cancelled','Reject')}} style={{borderLeftWidth:0.5,width:width*0.5,borderColor:'#e81b1b',backgroundColor:'#e81b1b'}}>
                    <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>Reject</MonoText>
                </TouchableOpacity>
                <TouchableOpacity style={{borderRightWidth:0.5,width:width*0.5,borderColor:'#059e03',backgroundColor:'#059e03'}}
                                  onPress={()=>{this.askConfirm('accepted','Accept')}}>
                    <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>Accept</MonoText>
                </TouchableOpacity>
            </View>}
            {this.state.history!='history'&&orderitem.status!='newOrder' &&
            <View style={{backgroundColor:'#059e03',justifyContent:'center',
                          position:'absolute',bottom:0,borderTopWidth:1,borderColor:'#fff'}}>
                  {orderitem.status=='accepted'&&
                  <View style={{justifyContent:'space-between',flexDirection:'row',backgroundColor:'#fff',}}>
                          <TouchableOpacity style={{borderWidth:0.5,width:width*0.5,  borderColor:'#f00',backgroundColor:'#f00'}} onPress={()=>{this.askConfirm('cancelled','Cancel')}}>
                            <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>Cancel</MonoText>
                          </TouchableOpacity>
                          <TouchableOpacity style={{borderWidth:0.5,width:width*0.5,borderColor:'#059e03',backgroundColor:'#059e03'}} onPress={()=>{this.askConfirm('packed','Pack')}} >
                            <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>Pack</MonoText>
                          </TouchableOpacity>
                  </View>
                    }
                  {orderitem.status=='packed'&&
                  <View style={{justifyContent:'space-between',flexDirection:'row',backgroundColor:'#fff',}}>
                    <TouchableOpacity onPress={()=>{this.askConfirm('cancelled','Reject')}} style={{borderLeftWidth:0.5,width:width*0.5,borderColor:'#e81b1b',backgroundColor:'#e81b1b'}}>
                        <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>Reject</MonoText>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderWidth:0.5,alignSelf:'center',width:width*0.5,
                                              borderColor:'#059e03',backgroundColor:'#059e03'}}
                                      onPress={()=>{this.askConfirm('shipped','Ship')}}>
                    <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>To Ship</MonoText>
                    </TouchableOpacity>
                  </View>
                }

            </View>}

      </View>
    )
  }else{
    return(
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <ActivityIndicator size={'large'} color={themeColor} />
    </View>
  )
  }
  }
}
const styles=StyleSheet.create({
  container:{
    flex:1,
  },
  shadoww: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
})
const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store
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

export default connect(mapStateToProps, mapDispatchToProps)(SellerOrderDetails)

// {orderitem.status=='shipped'&&
//   <TouchableOpacity style={{borderWidth:0.5,alignSelf:'center',width:width,
//                             borderColor:'#059e03',backgroundColor:'#059e03'}}
//                     onPress={()=>{this.askConfirm('delivered','Deliver')}}>
//   <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>To Deliver</MonoText>
//   </TouchableOpacity>}
// {orderitem.status=='delivered'&&
// <View style={{justifyContent:'space-between',flexDirection:'row',backgroundColor:'#fff',}}>
//         <TouchableOpacity style={{borderWidth:0.5,width:width*0.5,  borderColor:'#f00',backgroundColor:'#f00'}} onPress={()=>{this.askConfirm('replacement','To Replacement')}}>
//           <MonoText   style={{textAlign:'center',fontSize:17,paddingVertical:6,color:'#fff'}}>To Replacement</MonoText>
//         </TouchableOpacity>
//         <TouchableOpacity style={{borderWidth:0.5,width:width*0.5,borderColor:'#059e03',backgroundColor:'#059e03'}} onPress={()=>{this.askConfirm('reconciled','To Reconciled')}}>
//           <MonoText   style={{textAlign:'center',fontSize:17,paddingVertical:6,color:'#fff'}}>To Reconciled</MonoText>
//         </TouchableOpacity>
// </View>}
// {orderitem.status=='return'&&
//   <TouchableOpacity style={{borderWidth:0.5,alignSelf:'center',width:width,
//                             borderColor:'#059e03',backgroundColor:'#059e03'}}
//                     onPress={()=>{this.askConfirm('replacement','Replacement')}}>
//   <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>Replacement</MonoText>
//   </TouchableOpacity>}
// {orderitem.status=='replacement'&&
//   <TouchableOpacity style={{borderWidth:0.5,alignSelf:'center',width:width,
//                             borderColor:'#059e03',backgroundColor:'#059e03'}}
//                     onPress={()=>{this.askConfirm('return','Return')}}>
//   <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>Cancel</MonoText>
//   </TouchableOpacity>}
