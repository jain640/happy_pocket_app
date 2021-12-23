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
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,ActivityIndicator,NativeModules,LayoutAnimation,TouchableWithoutFeedback
} from 'react-native';
import  { FontAwesome,SimpleLineIcons ,MaterialIcons}  from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import OrderDetails from '../components/OrderDetails';
import * as WebBrowser  from 'expo-web-browser';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import { LinearGradient } from 'expo-linear-gradient';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import moment from 'moment';
import Loader from '../components/Loader';
import { Icon } from "react-native-elements";

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const storeType = settings.storeType
const invoiceQuickAdd = settings.invoiceQuickAdd
const themeColor = settings.themeColor

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

class OrderDetailPage extends React.Component{

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state

    return {
      title: 'Order Details',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Constants.statusBarHeight
      },
      headerTintColor: '#fff',


  };
}
// static navigationOptions = {
//   header:null,
// }

  constructor(props){
    super(props);
    var orderPk = props.navigation.getParam('order',null)
    this.state = {
      orders:[],
      store:this.props.store,
      selectedStore:props.selectedStore,
      cartItems : this.props.cart,
      orderPk:orderPk,
      order:null,
      status:['newOrder','accepted','packed'],
      loader:false
    }

  }



  setModalVisible(visible) {
    this.setState({isFeedBack: visible});
  }



  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor
    });
      this.getOrder()
      this.getUserSession()
  }

  getUserSession=async()=>{
    const userToken = await AsyncStorage.getItem('userpk');
    const sessionid = await AsyncStorage.getItem('sessionid');
    const csrf = await AsyncStorage.getItem('csrf');
    this.setState({userPk:userToken,sessionid:sessionid,csrf:csrf})
  }

  getOrder=()=>{
    if(this.state.orderPk!=null){
      fetch(SERVER_URL + '/api/POS/orderLite/'+this.state.orderPk+'/' )
      .then((response) =>{
        return response.json()
      } )
      .then((responseJson) => {
        this.setState({order:responseJson})
      })
      .catch((error) => {
        return
      });
    }
  }



  // pdfDownload = async (pk) => {
  //   await WebBrowser.openBrowserAsync('https://happypockets.in/api/ecommerce/downloadInvoice/?value='+ pk)
  // }

  checkout=()=>{
    this.props.navigation.navigate('CheckoutProducts')
  }


   reOrder= async()=>{
     var promises = [];
     // const userToken = await AsyncStorage.getItem('userpk');
     // const sessionid = await AsyncStorage.getItem('sessionid');
     // const csrf = await AsyncStorage.getItem('csrf');
     // this.setState({user:userToken,sessionid:sessionid,csrf:csrf})
     // if(userToken!== null ){
     //   this.setState({loader:true})
     //   fetch(SERVER_URL + '/api/POS/orderQty/?order='+this.state.order.pk +'&store='+this.state.store.pk+'&orderBy='+userToken , {
     //     headers: {
     //        "Cookie" :"sessionid=" + sessionid ,
     //     },
     //     method: 'GET'
     //     })
     //     .then((response) =>{
     //
     //       return response.json()
     //     })
     //     .then((responseJson) => {
            this.setState({loader:true})
           this.state.order.orderQty.forEach((item,idx)=>{
             var  count = item.qty;
             var varientCheck = item.productVariant;
             if(varientCheck != null){
               var image = item.productVariant.images.length>0?item.productVariant.images[0].attachment:null
               var product = item.product;
               var productVariant = item.productVariant.pk;
               var store = item.store ;
               var type = actionTypes.RE_ORDER;
               var dp = SERVER_URL+'/media/'+image;
               var customizable = item.productVariant.customizable;
               var mrp = item.productVariant.price;
               var sellingPrice = item.productVariant.sellingPrice;
               var discount = item.productVariant.price-item.productVariant.sellingPrice;
               var stock = item.productVariant.stock;
               var maxQtyOrder = item.productVariant.maxQtyOrder;
               var minQtyOrder = item.productVariant.minQtyOrder;
               var displayName = item.productVariant.displayName;
               var bulkChart = null;
               var user = this.state.userPk;
               var discountedPrice = item.productVariant.sellingPrice;
               var cart = null;
             }

             let toUpdate={product:product,productVariant:productVariant,store:store,count:count,type:type,customizable:customizable,sellingPrice:sellingPrice,mrp:mrp,stock:stock,discount:discount,maxQtyOrder:maxQtyOrder,minQtyOrder:minQtyOrder,dp:image,displayName:displayName,user:user,cart:null,bulkChart:null,discountedPrice:sellingPrice};
             var check = false
             var updateCount = count
             this.state.cartItems.forEach((i)=>{
               if(i.product==toUpdate.product&&i.productVariant==toUpdate.productVariant&&i.store==toUpdate.store){
                 check=true
                 updateCount = updateCount + i.count
                 toUpdate.cart = i.cart
                 toUpdate.count = updateCount
               }
             })
             if(!check){
               toUpdate.type = actionTypes.ADD_TO_CART
               promises.push(this.postCart(toUpdate))
             }else{
               toUpdate.type = actionTypes.INCREASE_CART
               toUpdate.count = updateCount
               promises.push(this.patchCart(toUpdate))
             }
           })

       //
       //   })
       //   .catch((error) => {
       //     this.setState({loader:false})
       //     return
       //   });
       // }
       await Promise.all(promises).then(() => {
           this.setState({loader:false})
           this.checkout();
       })
   }
   postCart = (obj)=>{

       var data = {
         product:obj.product,
         productVariant:obj.productVariant,
         store:obj.store,
         qty:obj.count,
        }
        console.log('post',data);

         fetch(SERVER_URL +'/api/POS/cart/' , {
           method: 'POST',
           headers:{
             "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'Referer': SERVER_URL,
             'X-CSRFToken': this.state.csrf
           },
           body: JSON.stringify(data)
         })
           .then((response) => {
             console.log('post status',response.status);
             if(response.status==201||response.status==200){

               return response.json()
             }else{
               return undefined
             }
           })
           .then((responseJson) => {
             if(responseJson!=undefined){
               obj.cart = responseJson.pk
               obj.count = obj.count
               this.updateCart(obj)
               resolve(response);
             }

           }).catch((e)=>{

           })


   }

   submit=()=>{
     var formdata = new FormData();
     formdata.append("remark",this.state.remark);
     formdata.append("rating",this.state.starRating);

     fetch(SERVER_URL + '/api/POS/order/'+this.state.selectedFeedBack.pk+'/', {
       method: 'PATCH',
       headers: {
         'Content-Type': 'multipart/form-data',
         'Accept': 'application/json',
         'Referer': SERVER_URL,
       },
       body:formdata
       })
       .then((response) =>{
         return response.json()
       })
       .then((responseJson) => {
         this.setState({starRating:0,remark:''})
         this.rating(0)
         this.setModalVisible(false)
       })
       .catch((error) => {
         return
       });
   }

   patchCart = async(obj)=>{
     console.log('patch');
     var data = {
       qty:obj.count,
      }
     fetch(SERVER_URL +'/api/POS/cart/'+obj.cart+'/' , {
      method: 'PATCH',
      headers:{
        "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken':this.state.csrf
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        console.log('patch status',response.status);
        if(response.status==201||response.status==200){
          resolve(response);
          return response.json()
        }else{
          return undefined
        }
      })
      .then((responseJson) => {
        if(responseJson!=undefined){
          obj.cart = responseJson.pk
          this.updateCart(obj)
        }
      }).catch((e)=>{

      })
   }




   updateCart = (args) =>{
     if(args.type == 'delete'){
       this.props.removeItemFunction(args)
       return
     }
     if (args.type == actionTypes.ADD_TO_CART){
         this.props.addTocartFunction(args);
     }
     if (args.type == actionTypes.INCREASE_CART){
         this.props.increaseCartFunction(args);

     }
     if (args.type == actionTypes.DECREASE_FROM_CART){
         this.props.decreaseFromCartFunction(args);

     }

   }

   changeStatus =(status)=>{
     this.setState({loader:true})
     console.log('cancel');
     var data= {
       status:status
     }
     fetch(SERVER_URL +'/api/POS/order/'+this.state.order.pk+'/' , {
      method: 'PATCH',
      headers:{
        "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken':this.state.csrf
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        console.log(response.status,'kkkkk');
        if(response.status==201||response.status==200){
          return response.json()
        }else{
          return undefined
        }
      })
      .then((responseJson) => {
        this.setState({loader:false})
        console.log(responseJson,'leeeeeeeeeee');
        if(responseJson!=undefined){
          this.setState({order:responseJson})
        }
      }).catch((error)=>{
        this.setState({loader:false})
      })
   }

   repeatOrder=()=>{
     Alert.alert('Add To Cart','Are you sure?',
         [{text: 'No', onPress: () => {
             return null
           }},
           {text: 'Confirm', onPress: () => {
             this.reOrder()
           }},
       ],
       { cancelable: false }
     )
   }
   cancelOrder=()=>{
     Alert.alert('Cancel Order','Do you want to cancel this Order?',
         [{text: 'No', onPress: () => {
             return null
           }},
           {text: 'Confirm', onPress: () => {
             this.changeStatus('cancelled')
           }},
       ],
       { cancelable: false }
     )
   }
   return=()=>{
     Alert.alert('Return Order','Do you want to Return this Order?',
         [{text: 'No', onPress: () => {
             return null
           }},
           {text: 'Confirm', onPress: () => {
             this.changeStatus('return')
           }},
       ],
       { cancelable: false }
     )
   }
   replacement=()=>{
     Alert.alert('Replace Order','Do you want to Replace this Order?',
         [{text: 'No', onPress: () => {
             return null
           }},
           {text: 'Confirm', onPress: () => {
             this.changeStatus('replacement')
           }},
       ],
       { cancelable: false }
     )
   }

   pdfDownload = async (pk) => {
     var url = SERVER_URL+'/api/POS/downloadInvoice/?order='+pk
     console.log(url,'jjjjjjjjjj');
     await WebBrowser.openBrowserAsync(url)
   }


    render() {
      const { navigation } = this.props;
      const themeColor = this.props.store.themeColor

       return(
         <View style={{flex:1,backgroundColor:'#f2f2f2'}}>

            <ScrollView contentContainerStyle={{paddingBottom:40}}>

            {this.state.order!=null&&
               <View>
                  <View style={[styles.shadow,{paddingVertical:10,borderBottomWidth:0,backgroundColor:'#fff'}]}>
                    <View style={[{flexDirection:'row',marginHorizontal:15,}]}>
                        <View style={{flex:0.5}}>
                        <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>Order ID #{this.state.order.pk}</MonoText>
                         </View>
                        <View style={{flex:0.5,alignItems:'flex-end'}}>
                        <View style={{flex:1,flexDirection:'row'}}>
                          <MonoText   style={{color:'#000',fontSize:14,fontWeight:'700'}}>{moment(moment.utc(this.state.order.created).toDate()).local().format('HH:mm')} </MonoText>
                          <MonoText   style={{color:'#000',fontSize:14,}}> {moment(moment.utc(this.state.order.created).toDate()).local().format('DD/MM/YYYY')} </MonoText>
                        </View>
                        </View>
                    </View>
                  </View>

                  <View style={[styles.shadow,{paddingVertical:10,marginTop:10,borderBottomWidth:0,backgroundColor:'#fff'}]}>
                    <View style={[{flexDirection:'row',marginHorizontal:15,}]}>
                        <View style={{flex:0.5}}>
                        <MonoText   style={{color:'#000',fontSize:16,fontWeight:'700'}}>Status </MonoText>
                         </View>
                        <View style={{flex:0.5,alignItems:'flex-end'}}><MonoText   style={{color:'grey',fontSize:16,color:'#000'}}>{this.state.order.status} </MonoText>
                        </View>
                    </View>
                  </View>

                  <View style={[styles.shadoww,{paddingVertical:10,marginTop:10,backgroundColor:'#fff'}]}>
                    <View style={{paddingBottom:10,paddingHorizontal:15,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                    <MonoText   style={{color:'grey',fontSize:14}}>Address Details</MonoText>
                     </View>
                    <View style={{flexDirection:'row',marginHorizontal:15,paddingVertical:15}}>
                        <View style={{flex:1}}>
                        <MonoText   style={{color:'#000',fontSize:16,}}>{this.state.order.street} {this.state.order.landMark} {this.state.order.city}</MonoText>
                         </View>
                    </View>
                  </View>

                  <View style={[styles.shadoww,{paddingVertical:10,marginTop:10,backgroundColor:'#fff'}]}>
                    {/*<View style={{paddingBottom:10,paddingHorizontal:15,borderBottomWidth:1,borderColor:'#f2f2f2'}}><MonoText   style={{color:'grey',fontSize:14}}>Product Details</MonoText> </View>*/}
                    <View style={{flexDirection:'row',paddingHorizontal:15,paddingBottom:10,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                      <View style={{flex:0.65}}>
                      <MonoText   style={{color:'grey',fontSize:14,}}>Product Name</MonoText>
                       </View>
                      <View style={{flex:0.15,alignItems:'center'}}>
                      <MonoText   style={{color:'grey',fontSize:14,}}>Qty</MonoText>
                       </View>
                      <View style={{flex:0.2,alignItems:'flex-end'}}>
                      <MonoText   style={{color:'grey',fontSize:14,}}>Price</MonoText>
                      </View>
                    </View>
                    <FlatList style={{}}
                        data={this.state.order.orderQty}
                        keyExtractor={(item,index) => {
                          return item.pk.toString();
                        }}
                        renderItem={({item, index, separators}) => (
                          <View style={{flexDirection:'row',marginHorizontal:15,paddingTop:5,paddingBottom:this.state.order.orderQty.length==index+1?10:0}}>
                            <View style={{flex:0.65}}>
                            <MonoText   style={{color:'#000',fontSize:14,}}>{item.productName} </MonoText>
                             </View>
                            <View style={{flex:0.15,alignItems:'center'}}>
                            <MonoText   style={{color:'#000',fontSize:14,}}>{item.qty}</MonoText>
                             </View>
                            <View style={{flex:0.2,alignItems:'flex-end'}}>
                            <MonoText   style={{color:'#000',fontSize:14,}}>&#8377; {item.sellingPrice}</MonoText>
                             </View>
                          </View>
                        )}
                        />
                  </View>


                  <View style={[styles.shadoww,{paddingVertical:10,marginTop:10,backgroundColor:'#fff'}]}>
                    <View style={{paddingBottom:10,paddingHorizontal:15,borderBottomWidth:1,borderColor:'#f2f2f2'}}>
                    <MonoText   style={{color:'grey',fontSize:14}}>Price Details</MonoText>
                     </View>
                    <View style={{flexDirection:'row',marginHorizontal:15,paddingVertical:10}}>
                        <View style={{flex:0.6}}>
                        <MonoText   style={{color:'#000',fontSize:16,}}>Delivery Charges</MonoText>
                         </View>
                        <View style={{flex:0.4,alignItems:'flex-end'}}>
                        <MonoText   style={{color:'#000',fontSize:16,}}>&#8377; {this.state.order.shippingPrice}</MonoText>
                         </View>
                    </View>
                    <View style={{flexDirection:'row',marginHorizontal:15,paddingVertical:10}}>
                        <View style={{flex:0.6}}>
                        <MonoText   style={{color:'#000',fontSize:16,}}>Total Amount</MonoText>
                         </View>
                        <View style={{flex:0.4,alignItems:'flex-end'}}>
                        <MonoText   style={{color:'#000',fontSize:16,}}>&#8377; {this.state.order.totalAmount}</MonoText>
                         </View>
                    </View>
                    <View style={{flexDirection:'row',marginHorizontal:15,paddingVertical:10}}>
                        <View style={{flex:0.6}}>
                        <MonoText   style={{color:'#000',fontSize:16,}}>Mode Of Payment</MonoText>
                         </View>
                        <View style={{flex:0.4,alignItems:'flex-end'}}>
                        <MonoText   style={{color:'#000',fontSize:16,}}>{this.state.order.paymentMode}</MonoText>
                        </View>
                    </View>
                  </View>

                  {this.state.order.status!='newOrder'&&
                  <View style={[styles.shadoww,{paddingVertical:10,marginTop:10,backgroundColor:'#fff'}]}>
                    <View style={{flexDirection:'row',marginHorizontal:15,}}>
                        <View style={{flex:0.6}}>
                        <MonoText   style={{color:'#000',fontSize:16,}}>Download invoice</MonoText>
                         </View>
                        <View style={{flex:0.4,alignItems:'flex-end'}}>
                        <TouchableOpacity style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center',}} onPress={()=>{this.pdfDownload(this.state.order.pk)}}>
                        <FontAwesome name="download" size={22} color="blue"  />
                          <MonoText   style={{fontSize:13,color:'blue',marginLeft:4}}>Download</MonoText>
                        </TouchableOpacity>
                         </View>
                    </View>
                  </View>
                }


               </View>
             }
          </ScrollView>

          {storeType=='MULTI-VENDOR'&&
          <View style={[{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#f2f2f2',height:40,flexDirection:'row'}]}>
          {this.state.order!=null&&this.state.order.paymentMode!='gift'&&this.state.status.includes(this.state.order.status)&&
            <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#fff',backgroundColor:'#fff'}} onPress={()=>{this.cancelOrder()}} >
              <MonoText   style={{fontSize:18,fontWeight:'400',color:'#000',fontWeight:'700'}}>Cancel Order</MonoText>
            </TouchableOpacity>
          }
          {this.state.order!=null&&this.state.order.paymentMode!='gift'&&this.state.order.status=='delivered'&&
            <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#fff',backgroundColor:'#fff'}} onPress={()=>{this.return()}} >
              <MonoText   style={{fontSize:18,fontWeight:'400',color:'#000',fontWeight:'700'}}>Return</MonoText>
            </TouchableOpacity>
          }
          {this.state.order!=null&&this.state.order.paymentMode!='gift'&&this.state.order.status=='delivered'&&
            <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#fff',backgroundColor:themeColor}} onPress={()=>{this.replacement()}} >
              <MonoText   style={{fontSize:18,fontWeight:'400',color:'#000',fontWeight:'700'}}>Replacement</MonoText>
            </TouchableOpacity>
          }

            {/*<TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center',borderWidth:0,borderColor:'#f2f2f2',backgroundColor:themeColor}} onPress={()=>{this.repeatOrder()}} >
              <MonoText   style={{fontSize:18,fontWeight:'400',color:'#fff',fontWeight:'700'}}>Re Order</MonoText>
            </TouchableOpacity>*/}
          </View>
        }

          {this.state.loader&&
            <View >
            <Loader
            modalVisible = {this.state.loader}
            animationType="fade"
            />
            </View>
          }

       </View>
       )
    }
}




const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    selectedStore:state.cartItems.selectedStore,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reOrderFunction:  (args) => dispatch(actions.reOrderAction(args)),
    addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
    decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
    increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
    setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
    removeItemFunction:  (args) => dispatch(actions.removeItem(args)),
    emptyCartFunction:()=>dispatch(actions.emptyCart()),


  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetailPage);





  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',


    },
    contentImage:{
      flexWrap: 'nowrap',
      flexDirection:'row',
      alignItems: 'flex-start',
      marginTop:Constants.statusBarHeight,
      justifyContent: 'flex-start',
    },
    item: {
      marginTop:10,
      borderRadius:10
    },
    shadow: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
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

TouchableOpacityStyle: {
   position: 'absolute',
   width: 50,
   height: 50,
   alignItems: 'center',
   justifyContent: 'center',
   right: 30,
   bottom: 30,
   backgroundColor: themeColor,
   zIndex: 1,
   borderRadius:25,

 },
 modalcontainer:{
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
  modalView: {
     backgroundColor: '#fff',
     marginHorizontal: width*0.05 ,
     borderRadius:5,
    },
    signupTextCont:{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          marginTop: 20,
   },
 FloatingButtonStyle: {
   resizeMode: 'contain',
   width: 50,
   height: 50,


 }


  });
  // <View style={{height:Constants.statusBarHeight,backgroundColor:themeColor}}  />
  // <View style={{height:55,flexDirection:'row'}}>
  //    <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}} style={{height:55,width:55,alignItems:'center',justifyContent:'center'}}>
  //       <MaterialIcons name={'arrow-back'} color={'#000'} size={25} />
  //    </TouchableOpacity>
  // </View>

  // <View style={[{flex:1,margin:15,borderBottomWidth:0,marginBottom:0,backgroundColor:'#fff'}]}>
  //   <View style={{flex:1,}}>
  //   <MonoText   style={{color:'grey',fontSize:15,}}>Deliver To</MonoText>
  //   <MonoText   style={{color:'#000',fontSize:16,}}>{this.state.order.street} {this.state.order.landMark} {this.state.order.city}  </MonoText>
  //   </View >
  // </View >
  // <View style={[{flex:1,margin:15,borderWidth:1,borderColor:"#fff",borderRadius:10,borderBottomWidth:0,marginBottom:20,marginTop:2}]}>
  //
  //   <View style={[{marginTop:20,}]}>
  //     <View style={{flex:1,flexDirection:'row',borderBottomWidth:1,paddingVertical:10,paddingHorizontal:10,borderBottomColor:'#e7e7e7'}}>
  //       <MonoText   style={{color:'grey',fontSize:13,flex:0.6}}>Item</MonoText>
  //       <MonoText   style={{color:'grey',fontSize:13,flex:0.2,textAlign:'center'}}>Qty</MonoText>
  //       <MonoText   style={{color:'grey',fontSize:13,flex:0.2}}>Price</MonoText>
  //     </View>
  //     <FlatList style={{}}
  //     data={this.state.order.orderQty}
  //     keyExtractor={(item,index) => {
  //       return item.pk.toString();
  //     }}
  //     renderItem={({item, index, separators}) => (
  //       <View style={{flex:1,flexDirection:'row',paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#e7e7e7',paddingHorizontal:10,}}>
  //       <MonoText   style={{color:'#000',fontSize:13,flex:0.6}}>{item.productName} </MonoText>
  //       <MonoText   style={{color:'#000',fontSize:13,flex:0.2,textAlign:'center'}}>{item.qty}</MonoText>
  //       <MonoText   style={{color:'#000',fontSize:13,flex:0.2,alignSelf:'flex-end'}}>&#8377; {item.sellingPrice}</MonoText>
  //       </View>
  //     )}
  //     />
  //     <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',marginRight:25}}>
  //       <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Delivery Charges:</MonoText>
  //       <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
  //         <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>&#8377; {this.state.order.shippingPrice}</MonoText>
  //       </View>
  //     </View>
  //     <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',marginRight:25}}>
  //       <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>You Saved:</MonoText>
  //       <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
  //         <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>&#8377; {this.state.order.saved}</MonoText>
  //       </View>
  //     </View>
  //     <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',marginRight:25}}>
  //       <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Total Amount:</MonoText>
  //       <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
  //         <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>&#8377; {this.state.order.totalAmount}</MonoText>
  //       </View>
  //     </View>
  //     <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',marginRight:25}}>
  //       <MonoText   style={{color:'grey',fontSize:15,marginHorizontal:width*0.01,marginTop:10,}}>Mode Of Payment:</MonoText>
  //       <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',}}>
  //         <MonoText   style={{color:'#000',fontSize:16,marginHorizontal:width*0.01,marginTop:10,}}>{this.state.order.paymentMode}</MonoText>
  //       </View>
  //     </View>
  //   </View>
  //
  // </View>
