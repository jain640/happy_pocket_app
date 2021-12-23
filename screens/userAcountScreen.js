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
import  { FontAwesome,SimpleLineIcons }  from '@expo/vector-icons';
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
import NetInfo from '@react-native-community/netinfo';
import { Icon } from "react-native-elements";
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
const storeType = settings.storeType
const priceTitle = settings.priceTitle
const invoiceQuickAdd = settings.invoiceQuickAdd
const themeColor = settings.themeColor

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

class UserAcountScreen extends React.Component{

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state

    return {
      title: 'Orders',
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
      },
      headerLeft: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
       <TouchableOpacity onPress={()=>{navigation.openDrawer({'color':params});}}><SimpleLineIcons name={'menu'} size={23} color={'#fff'}/></TouchableOpacity>
        </View>
     ),
      headerTintColor: '#fff',


  };
}


  clickHandler=()=>{
    this.props.navigation.navigate('ChatScreen',{
      color:themeColor
    })
  }
  onClick=()=>{
     Alert.alert("Add new order");
  }



  constructor(props){
    super(props);
    this.state = {
      orders:[],
      open : false,
      offset:0,
      modalVisible: false,
      cancellationReview:'',
      loader:true,
      store:this.props.store,
      loadMore:true,
      cartItems : this.props.cart,
      user:null,
      isFeedBack:false,
      starIcon : ['ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline'],
      rateColor : ['#000','#000','#000','#000','#000'],
      starRating : 0 ,
      remark:'',
      selectedFeedBack:null,
      csrf:null,
      sessionid:null,
      count:0,
      HeadTable: ['Product', 'MRP', 'HP Price', 'Qty'],
    }
    willFocus = props.navigation.addListener(
      'willFocus',
      payload => {
        NetInfo.fetch().then(state => {
          if(state.isConnected){
            this.checkLogin()
          }
      })

      }
    );

  }
  showNoInternet=()=>{
    if(this.refs.toast!=undefined){
      this.refs.toast.show('No Internet Connection')
    }
  }

  rating = (count) => {
   let arr = ['#000','#000','#000','#000','#000'];
   let staricon = ['ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline','ios-star-outline'];
   arr.forEach((val,index)=>{
     if(index>count-1)return;
     arr[index] = this.state.store.themeColor
   })
   staricon.forEach((val,index)=>{
     if(index>count-1)return;
     staricon[index] = 'ios-star'
   })
   this.setState({starIcon:staricon, rateColor:arr, starRating:count});
}

  setModalVisible(visible) {
    this.setState({isFeedBack: visible});
  }
  checkLogin = async () => {
    const userId = await AsyncStorage.getItem('userpk');
    this.setState({ orders: this.state.orders,loadMore:true,offset:this.state.offset})
    this.userAsync(0)
  }
  userAsync = async (offset) => {
    try {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrf = await AsyncStorage.getItem('csrf');
      this.setState({user:userToken,csrf:csrf,sessionid:sessionid})
      if(userToken!== null ){
        fetch(SERVER_URL + '/api/POS/orderLite/?limit=10&offset=' + offset +'&orderBy='+userToken , {
          headers: {
             "Cookie" :"sessionid=" + sessionid ,
          },
          method: 'GET'
          })
          .then((response) =>{
            if(response.status == 200 || response.status == '200'){
              return response.json()
            }else{
              return undefined
            }
          } )
          .then((responseJson) => {
            this.setState({loader:false})
            if(responseJson == undefined){
              return
            }
            if(this.state.count!=responseJson.count){
              this.setState({count:responseJson.count})
              for (var i = 0; i < responseJson.results.length; i++) {
                responseJson.results[i].open = false
                responseJson.results[i].data = []
              }
              console.log(responseJson.results,'jkkkkkk');
              this.setState({ orders: responseJson.results,offset:0})
            }
            if(responseJson.results.length%10!=0){
              this.setState({loadMore:false,})
            }

          })
          .catch((error) => {
            return
          });
      }
    } catch (error) {
      return
    }
  };

  handleConnectivityChange=(state)=>{
      if(state.isConnected){
        this.setState({connectionStatus:true})
        this.checkLogin()
      }else{
        this.setState({connectionStatus : false})
        this.showNoInternet()
      }
  }

  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor
    });
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})
    // this.userAsync()
  }

  loadMore =async ()=>{

    try {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
       var offset = this.state.offset + 10

      if(userToken!== null ){
        fetch(SERVER_URL + '/api/POS/orderLite/?limit=10&offset=' + offset +'&orderBy='+userToken , {
          headers: {
             "Cookie" :"sessionid=" + sessionid ,
          },
          method: 'GET'
          })
          .then((response) =>{
            return response.json()
          } )
          .then((responseJson) => {
            const arr = this.state.orders
            this.setState({ offset :offset})
            var setArr = []
            responseJson.results.forEach((item)=>{
              item.open = false
              item.data = []
              arr.push(item)
            })

            this.setState({ orders: arr})
            if(arr.length%10!=0){
              this.setState({loadMore:false})
            }
          })
          .catch((error) => {
            return
          });
      }
    } catch (error) {
      return
    }

  }

  pdfDownload = async (pk) => {
    var url = SERVER_URL+'/api/POS/downloadInvoice/?order='+pk
    console.log(url,'jjjjjjjjjj');
    await WebBrowser.openBrowserAsync(url)
  }

  openAddress=()=>{
    this.props.navigation.navigate('AddressScreen')
  }
  checkout=()=>{
    this.props.navigation.navigate('checkoutScreen')
  }

  back=()=>{
    this.setModalVisible(!this.state.isFeedBack);
  }

  toggle=(idx,item)=>{
     console.log(invoiceQuickAdd,'kdffffffffffff');
      if(invoiceQuickAdd){
        LayoutAnimation.easeInEaseOut();
        this.state.orders[idx].open = true;
        this.setState({ orders: this.state.orders  })
      }else{
        this.props.navigation.navigate('OrderDetailPage',{order:item.pk})
      }
  }



   reOrder=async (item,index)=>{
     var promises = [];
     const userToken = await AsyncStorage.getItem('userpk');
     const sessionid = await AsyncStorage.getItem('sessionid');
     const csrf = await AsyncStorage.getItem('csrf');
     this.setState({user:userToken,sessionid:sessionid,csrf:csrf})
     if(userToken!== null ){
       fetch(SERVER_URL + '/api/POS/orderQty/?order='+this.state.orders[index].pk +'&store='+this.state.store.pk+'&orderBy='+userToken , {
         headers: {
            "Cookie" :"sessionid=" + sessionid ,
         },
         method: 'GET'
         })
         .then((response) =>{

           return response.json()
         })
         .then((responseJson) => {

           responseJson.forEach((item,idx)=>{
             var  count = item.qty;
             var varientCheck = item.productVariant;
             var image = item.productVariant.images.length>0?item.productVariant.images[0].attachment:null
             if(varientCheck != null){
               var product = item.product;
               var productVariant = item.productVariant.pk;
               var store = item.store ;
               var type = actionTypes.RE_ORDER;
               var dp = 'https://made-for-india.com/media/'+image;
               var customizable = item.productVariant.customizable;
               var mrp = item.productVariant.price;
               var sellingPrice = item.productVariant.sellingPrice;
               var discount = item.productVariant.price-item.productVariant.sellingPrice;
               var stock = item.productVariant.stock;
               var maxQtyOrder = item.productVariant.maxQtyOrder;
               var minQtyOrder = item.productVariant.minQtyOrder;
               var displayName = item.productVariant.displayName;
               var bulkChart = null;
               var user = userToken;
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
               }
             })
             if(!check){
               toUpdate.type = actionTypes.ADD_TO_CART
               promises.push(this.postCart(toUpdate,sessionid,csrf))
             }else{
               toUpdate.type = actionTypes.INCREASE_CART
               toUpdate.count = updateCount
               promises.push(this.patchCart(toUpdate,sessionid,csrf))
             }
           })


         })
         .catch((error) => {
           return
         });
       }
       Promise.all(promises).then(() => {
           this.checkout();
       })
   }
   postCart = (obj,sessionid,csrf)=>{

       var data = {
         product:obj.product,
         productVariant:obj.productVariant,
         store:obj.store,
         qty:obj.count,
        }

         fetch(SERVER_URL +'/api/POS/cart/' , {
           method: 'POST',
           headers:{
             "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'Referer': SERVER_URL,
             'X-CSRFToken': csrf
           },
           body: JSON.stringify(data)
         })
           .then((response) => {
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
             }

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

   patchCart = async(obj,sessionid,csrf)=>{

     var data = {
       qty:obj.count,
      }
     fetch(SERVER_URL +'/api/POS/cart/'+obj.cart+'/' , {
      method: 'PATCH',
      headers:{
        "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken':csrf
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        if(response.status==201||response.status==200){
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

   changeStatus = (order,status)=>{
     console.log('cancel',order);
     var data= {
       status:status
     }
     fetch(SERVER_URL +'/api/POS/order/'+order+'/' , {
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
        if(response.status==201||response.status==200){
          return response.json()
        }else{
          return undefined
        }
      })
      .then((responseJson) => {
        if(responseJson!=undefined){
          this.setState({ orders: [],loadMore:true,offset:0})
          this.userAsync()
        }
      })
   }

   repeatOrder=(order)=>{
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
   cancelOrder=(order)=>{
     Alert.alert('Cancel Order','Do you want to cancel this Order?',
         [{text: 'No', onPress: () => {
             return null
           }},
           {text: 'Confirm', onPress: () => {
             this.changeStatus(order,'cancelled')
           }},
       ],
       { cancelable: false }
     )
   }
   return=(order)=>{
     Alert.alert('Return Order','Do you want to Return this Order?',
         [{text: 'No', onPress: () => {
             return null
           }},
           {text: 'Confirm', onPress: () => {
             this.changeStatus(order,'return')
           }},
       ],
       { cancelable: false }
     )
   }
   replacement=(order)=>{
     Alert.alert('Replace Order','Do you want to Replace this Order?',
         [{text: 'No', onPress: () => {
             return null
           }},
           {text: 'Confirm', onPress: () => {
             this.changeStatus(order,'replacement')
           }},
       ],
       { cancelable: false }
     )
   }



    render() {
      const { navigation } = this.props;
      const themeColor = this.props.store.themeColor
      if(this.state.loader == true){
        return (
          <View style={{flex:1,justifyContent:'center',alignItems: 'center'}}>
          <ActivityIndicator size="large" color={themeColor} />
          </View>
        )
      }else{
      return (

        <LinearGradient
           colors={[ themeColor,themeColor, themeColor, themeColor]} style={[styles.container]}>
        <View style={{backgroundColor: "#ffffff"}}>
        <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
        <Modal isVisible={this.state.modalVisible} animationIn="fadeIn" animationOut="fadeOut" hasBackdrop={true} >
          <View style={styles.modalView}>

            <TextInput
                    style={{height: 150, borderWidth: 0, marginTop: 0,paddingHorizontal:20,fontSize:18,}}
                    underlineColorAndroid='#fff'
                    multiline={true}
                    numberOfLines={5}
                    placeholder="Write your reason for Cancellation here"
                    onChangeText={(text) => this.setState({cancellationReview:text})}
              />
          <View style={{flexDirection: 'row',flexDirection: 'row',alignItems: 'center',justifyContent: 'center',padding:0,margin:0,marginTop: 20,}}>
            <TouchableOpacity style={{flex: 1,backgroundColor:"#fff",borderWidth:1,borderColor:'#c2c2c2'}}  onPress={() => {
              this.setModalVisible(!this.state.modalVisible);}}>
               <View  style={{alignSelf:'center',}}>
                 <MonoText   style={{color:"#000",fontSize:17,paddingVertical:8}}>Back</MonoText>
               </View>
            </TouchableOpacity>
             <TouchableOpacity  style={{flex: 1,backgroundColor:"#1f5b82",borderWidth:1,borderColor:'#1f5b82'}}  onPress={() => {this.submit()}}>
               <View style={{alignSelf:'center',}}>
                 <MonoText   style={{color:"#fff",fontSize:17,paddingVertical:8}}>Submit</MonoText>
               </View>
             </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal isVisible={this.state.isFeedBack} animationIn="fadeIn" animationOut="fadeOut" hasBackdrop={true} useNativeDriver={true}>
          <View style={styles.modalView}>
            <View style={styles.signupTextCont}>
                    <TouchableOpacity  onPress={() => this.rating(1)}>
                       <Icon type="ionicon" name={this.state.starIcon[0]} color={this.state.rateColor[0]} size={32} style={{textAlignVertical: 'center'}}/>
                     </TouchableOpacity  >
                    <TouchableOpacity  onPress={() => this.rating(2)}>
                       <Icon type="ionicon" name={this.state.starIcon[1]} color={this.state.rateColor[1]} size={32} style={{textAlignVertical: 'center'}}/>
                     </TouchableOpacity  >
                    <TouchableOpacity  onPress={() => this.rating(3)}>
                       <Icon type="ionicon" name={this.state.starIcon[2]} color={this.state.rateColor[2]} size={32} style={{textAlignVertical: 'center'}}/>
                     </TouchableOpacity  >
                    <TouchableOpacity  onPress={() => this.rating(4)}>
                       <Icon type="ionicon" name={this.state.starIcon[3]} color={this.state.rateColor[3]} size={32} style={{textAlignVertical: 'center'}}/>
                     </TouchableOpacity  >
                    <TouchableOpacity  onPress={() => this.rating(5)}>
                       <Icon type="ionicon" name={this.state.starIcon[4]} color={this.state.rateColor[4]} size={32} style={{textAlignVertical: 'center'}}/>
                     </TouchableOpacity  >
            </View>
            <TextInput
                   style={{height: 100, borderWidth: 0, marginTop:15,paddingHorizontal:20,fontSize:15, textAlignVertical:'top'}}
                   underlineColorAndroid='#fff'
                   multiline={true}
                   numberOfLines={5}
                   placeholder="Write your Remark here"
                   onChangeText={(text) => this.setState({remark:text})}
              />
          <View style={{flexDirection: 'row',flexDirection: 'row',alignItems: 'center',justifyContent: 'center',padding:0,margin:0,marginTop: 20,}}>
            <TouchableOpacity style={{flex: 1,backgroundColor:"#fff",borderWidth:1,borderColor:'#c2c2c2'}}  onPress={() => {
              this.setModalVisible(!this.state.isFeedBack);}}>
               <View  style={{alignSelf:'center',}}>
                 <MonoText   style={{color:"#000",fontSize:17,paddingVertical:8}}>Back</MonoText>
               </View>
            </TouchableOpacity>
             <TouchableOpacity  style={{flex: 1,backgroundColor:themeColor,borderWidth:1,borderColor:themeColor}}  onPress={() => {this.submit()}}>
               <View style={{alignSelf:'center',}}>
                 <MonoText   style={{color:"#fff",fontSize:17,paddingVertical:8}}>Submit</MonoText>
               </View>
             </TouchableOpacity>
            </View>
          </View>
        </Modal>
        </View>




          <ScrollView style={{backgroundColor:'#fff',}}>
          <FlatList style={{backgroundColor:'#fff',width:width,flexWrap:'nowrap',marginBottom:0,paddingBottom:30}} contentContainerStyle={{paddingBottom:10}}
            data={this.state.orders}
            keyExtractor={(item,index) => {
              return item.pk.toString();
            }}
            renderItem={({item, index, separators}) =>{
              var status = item.status
              var order = item.pk
              var arr = ['newOrder','accepted','packed']
              var paymentMode = item.paymentMode
              if(item.orderQty.length==0){
                return null
              }else{

              return (
              <View style={[styles.item,{backgroundColor:'#ffffff'}]}>
              <TouchableWithoutFeedback onPress={() =>{this.toggle(index,item)}} >
              <View>
              <Card  containerStyle={[styles.shadow, {  borderWidth: 1,borderColor: '#fff',borderRadius: 7, marginTop: 5,marginBottom: 3  }]}>
              <View>
                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',marginTop:5}}>
                  <View style={{flex:1, flexWrap:'wrap', flexDirection:'row', justifyContent:'space-between',}}>
                    <MonoText   style={{fontWeight:'700',color:'#000'}}>#{item.pk}</MonoText>
                    {paymentMode!='gift'&&
                      <MonoText style={{color:'#000'}}>&#8377; {item.totalAmount}</MonoText>
                    }
                    {paymentMode=='gift'&&
                      <MonoText  style={{color:'#000'}} >Status: {item.status=='newOrder'?'new':(item.status=='workInProgress'?'InProgress':item.status)}</MonoText>
                    }
                    <View style={{flex:0.51, flexWrap:'wrap', flexDirection:'row', justifyContent:'space-between',}}>
                      <MonoText style={{fontWeight:'700',color:'#000'}}> {moment(moment.utc(item.created).toDate()).local().format('HH:mm')}</MonoText>
                      <MonoText style={{color:'#000'}}> | {moment(moment.utc(item.created).toDate()).local().format('DD/MM/YYYY')}</MonoText>
                    </View>
                  </View>

                </View>
                <View style={{flex:1,flexDirection:'row',marginTop:20, flexWrap:'wrap', justifyContent:'space-between',}}>
                  <View style={{justifyContent:'flex-end',alignItems:'flex-start'}}>
                    <MonoText style={{color:'#000'}}>{item.paymentMode}</MonoText>
                  </View>
                  <MonoText  style={{color:'#000'}} >{item.status=='newOrder'?'new':(item.status=='workInProgress'?'InProgress':item.status)}</MonoText>
                  {storeType=='MULTI-OUTLET'&&
                    <View style={{flex:0.51,justifyContent:'flex-end',alignItems:'flex-end'}}>
                      <MonoText style={{color:'#000'}}> {item.timeSlot}</MonoText>
                    </View>
                  }
                </View>
                <View style={{flex:1,flexDirection:'row',alignItems:'center',}}>

                  {item.status=='delivered'&&
                    <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',marginTop:15}}>
                    <TouchableOpacity style={{paddingVertical:5,paddingHorizontal:5,backgroundColor:themeColor,borderRadius:5}} onPress={()=>{this.setState({selectedFeedBack:item});this.setModalVisible(true)}}>
                    <MonoText   style={{color:'#fff',fontSize:14,color:'#000'}}>FeedBack</MonoText>
                     </TouchableOpacity>
                    </View>

                  }
                </View>

                {item.open?(
                  <View style={{}}>
                    <Table borderStyle={{borderWidth: 1, borderColor: '#ffa1d2'}}>
                      <Row data={this.state.HeadTable} style={styles.HeadStyle} textStyle={styles.TableText}/>
                      
                      {/*<Rows data={item.orderQty} textStyle={styles.TableText}/>*/}
                    </Table>
                    <FlatList style={{marginTop: 15,}}
                      data={item.orderQty}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <View style={{borderTopWidth:1,borderColor:'grey',paddingVertical:15}}>
                          <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                            <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                              <MonoText   style={{fontSize:13,color:'#000'}}>Name : {item.productName}</MonoText>
                            </View>
                            <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                              <MonoText   style={{fontSize:13,color:'#000'}}>Qty : {item.qty}</MonoText>
                            </View>
                          </View>
                          <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',marginTop:10}}>
                            {paymentMode!='gift'&&<View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                              <MonoText   style={{fontSize:13,color:'#000'}}>{priceTitle} : &#8377; {item.sellingPrice}</MonoText>
                            </View>}
                            {paymentMode=='gift'&&<View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                              <MonoText   style={{fontSize:13,color:'#000'}}>Coins : {item.sellingPrice}</MonoText>
                            </View>}
                            {paymentMode!='gift'&&<View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                              <MonoText   style={{fontSize:13,color:'#000'}}>Total Amount: &#8377; {item.price}</MonoText>
                            </View>}
                          </View>


                        </View>
                      )}
                    />
                    <View style={{flex:1,flexDirection:'row'}}>

                      {storeType=='MULTI-OUTLET'&&item.status!='newOrder' &&
                        <TouchableOpacity style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center',marginTop:15}} onPress={()=>{this.pdfDownload(item.pk)}}>
                        <FontAwesome name="download" size={22} color="blue"  />
                          <MonoText   style={{fontSize:13,color:'blue',marginLeft:4}}>Download</MonoText>
                        </TouchableOpacity>
                      }
                    </View>
                  </View>
                ):<View></View>}
                {/*item.paymentMode!='gift'&&arr.includes(status)&&item.open&&
                <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end',marginTop:15}}>
                  <TouchableOpacity onPress={()=>{this.cancelOrder(order)}} style={{paddingVertical:3,paddingHorizontal:10,borderRadius:5,borderWidth:1,borderColor:'#cb171e'}}>
                  <MonoText   style={{fontSize:14,color:'#cb171e'}}>CANCEL ORDER</MonoText>
                  </TouchableOpacity>
                </View>
                */}
                {item.paymentMode!='gift'&&status=='delivered'&&item.open&&
                <View style={{flex:1,flexDirection:'row'}}>
                  {/*<View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start',marginTop:15}}>
                    <TouchableOpacity onPress={()=>{this.return(order)}} style={{paddingVertical:3,paddingHorizontal:10,borderRadius:5,borderWidth:1,borderColor:'#cb171e'}}>
                    <MonoText   style={{fontSize:14,color:'#cb171e'}}>RETURN</MonoText>
                    </TouchableOpacity>
                  </View>*/}
                  <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end',marginTop:15}}>
                    <TouchableOpacity onPress={()=>{this.replacement(order)}} style={{paddingVertical:3,paddingHorizontal:10,borderRadius:5,borderWidth:1,borderColor:'blue'}}>
                    <MonoText   style={{fontSize:14,color:'blue'}}>REPLACE</MonoText>
                    </TouchableOpacity>
                  </View>
                </View>
                }
                </View>
              </Card>
              </View>
              </TouchableWithoutFeedback>
            </View>


          )}}}
          />
          {this.state.loadMore&&
          <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'flex-start',backgroundColor:'#fff', width : width,}}>
            {this.state.orders.length>0&&<TouchableOpacity onPress={this.loadMore}  style={{padding:7,borderWidth:1,borderColor:themeColor,backgroundColor:themeColor,marginBottom:20,color:'#fffff'}} >
              <MonoText   style={{color:'#fff'}}>Load More</MonoText>
            </TouchableOpacity>}
            {this.state.orders.length==0&&
              <MonoText>No Items</MonoText>
             }
          </View>
        }


          </ScrollView>
         </LinearGradient>


        );
      }
    }
}




const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store
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

export default connect(mapStateToProps, mapDispatchToProps)(UserAcountScreen);





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
 },
 HeadStyle: { 
  height: 50,
  alignContent: "center",
  backgroundColor: '#ffe0f0'
},
TableText: { 
  margin: 10
}


  });

  // <TouchableOpacity style={{flex:1,flexDirection:'row',justifyContent:'flex-start',}} onPress={()=>{this.repeatOrder(item,index)}}><FontAwesome name="shopping-cart" size={22} color="blue"  />
  //   <MonoText   style={{fontSize:13,color:'blue',marginLeft:4}}>Repeat Order</MonoText>
  // </TouchableOpacity>
