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
  TextInput,FlatList,AsyncStorage,TouchableHighlight, Alert,ActivityIndicator
} from 'react-native';
import  { FontAwesome }  from '@expo/vector-icons';
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
import * as actionTypes from '../actions/actionTypes'

const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url

class OrderCompleted extends React.Component{

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state

    return {
      tabBarLabel: 'Completed',
      headerStyle: {
        marginTop:Constants.statusBarHeight
      },



  };
}


  clickHandler=()=>{
    this.props.navigation.navigate('ChatScreen',{
      color:'#efa834'
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
    }

  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  userAsync = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      if(userToken!== null ){
        fetch(SERVER_URL + '/api/ecommerce/order/?&id__contains=&limit=10&offset=0&user='+ userToken , {
          headers: {
             "Cookie" :"sessionid=" + sessionid ,
          },
          method: 'GET'
          })
          .then((response) =>{
            return response.json()
          } )
          .then((responseJson) => {
            for (var i = 0; i < responseJson.results.length; i++) {
              responseJson.results[i].open = false
            }
            this.setState({ orders: responseJson.results,loader:false})
          })
          .catch((error) => {
            return
          });
      }
    } catch (error) {
      return
    }
  };

  componentDidMount() {
    this.userAsync()
  }

  loadMore =async ()=>{

    try {
      const userToken = await AsyncStorage.getItem('userpk');
      const sessionid = await AsyncStorage.getItem('sessionid');
      this.setState({ offset : this.state.offset + 10})
      if(userToken!== null ){
        fetch(SERVER_URL + '/api/ecommerce/order/?&id__contains=&limit=10&offset=' + this.state.offset + '&user='+ userToken , {
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
            for (var i = 0; i < responseJson.results.length; i++) {
              responseJson.results[i].open = false
              arr.push(responseJson.results[i])
            }
            this.setState({ orders: arr})
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
    await WebBrowser.openBrowserAsync('https://happypockets.in/api/ecommerce/downloadInvoice/?value='+ pk)
  }

  openAddress=()=>{
    this.props.navigation.navigate('AddressScreen')
  }
  checkout=()=>{
    this.props.navigation.navigate('checkoutScreen')
  }

  cancelOrder=()=>{
    this.setModalVisible(!this.state.modalVisible);
  }

   toggle=(idx)=>{
     this.state.orders[idx].open = true;
     console.log(this.state.orders[idx],'ppppppppp');
     this.setState({ orders: this.state.orders  })
   }

   repeatOrder=(item)=>{

     for (var i = 0; i < item.orderQtyMap.length; i++) {
       var  count = item.orderQtyMap[i].qty;
       var varientCheck = item.orderQtyMap[i].prodVar;
       if(varientCheck != null){
         var prodVar = varientCheck[0]
         var pk = prodVar.parent_id;
         var salePrice = prodVar.discountedPrice ;
         var dp = 'https://happypockets.in/media/'+prodVar.prodImage;
         var name = item.orderQtyMap[i].product.product.name;
         var mrp = prodVar.price;
         var discount = prodVar.discountPrice;
         var sku = prodVar.sku;
         var listing = item.orderQtyMap[i].product.pk;
         var unitPack = prodVar.unitPerpack + " " + prodVar.unit;
         var varient = prodVar.id;
       }else{
         var pk = item.orderQtyMap[i].product.product.pk;
         var salePrice = item.orderQtyMap[i].product.product.discountedPrice ;
         var dp = item.orderQtyMap[i].product.product.displayPicture;
         var name = item.orderQtyMap[i].product.product.name;
         var mrp = item.orderQtyMap[i].product.product.price;
         var discount = item.orderQtyMap[i].product.product.price - item.orderQtyMap[i].product.product.discountedPrice;
         var sku = item.orderQtyMap[i].product.product.serialNo;
         var listing = item.orderQtyMap[i].product.pk;
         var unitPack = item.orderQtyMap[i].product.product.howMuch + " " + item.orderQtyMap[i].product.product.unit;
         var varient = null;
       }
       let product = Object.assign({count : count,variant : varient,pk:pk,salePrice:salePrice,dp:dp,name:name,mrp:mrp,discount:discount,sku:sku,listing:listing,unitPack:unitPack,actionTypes:actionTypes.RE_ORDER});
       this.props.reOrderFunction(product);
     }
     this.checkout();

   }

    render() {
      const { navigation } = this.props;
      const color = navigation.getParam('color','#000')
      if(this.state.loader == true){
        return (
          <View style={{flex:1,justifyContent:'center',alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#efa834" />
          </View>
        )
      }else{
      return (

        <LinearGradient
           colors={[ '#efa834','#efa834', '#efa834', '#efa834']} style={[styles.container]}>
        <View style={{backgroundColor: "#ffffff"}}>
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
             <TouchableOpacity  style={{flex: 1,backgroundColor:"#1f5b82",borderWidth:1,borderColor:'#1f5b82'}}  onPress={() => {}}>
               <View style={{alignSelf:'center',}}>
                 <MonoText   style={{color:"#fff",fontSize:17,paddingVertical:8}}>Submit</MonoText>
               </View>
             </TouchableOpacity>
            </View>
          </View>
        </Modal>
        </View>




          <ScrollView style={{backgroundColor:'#fff',}}>
          <FlatList style={{backgroundColor:'#fff',width:width,flexWrap:'nowrap',marginBottom:0,paddingBottom:30}}
            data={this.state.orders}
            keyExtractor={(item,index) => {
              return item.pk.toString();
            }}
            renderItem={({item, index, separators}) => (
              <View style={[styles.item,{backgroundColor:'#ffffff'}]}>
              <TouchableHighlight onPress={() => this.toggle(index)} >
              <Card  containerStyle={[styles.shadow, {  borderWidth: 1,borderColor: '#fff',borderRadius: 7, marginTop: 15,marginBottom: 3  }]}>
                <MonoText   style={{textAlign:'center',fontWeight:'700'}}>Order No : #{item.pk}</MonoText>
                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                  <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                    <MonoText>Total Amount: &#8377; {item.totalAmount}</MonoText>
                  </View>
                  <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                    <MonoText>Payment Mode: {item.paymentMode}</MonoText>
                  </View>
                </View>
                <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                  <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                  {item.approved == null && item.approved == undefined&&
                    <MonoText>Approved: No</MonoText>
                  }
                  {item.approved != null && item.approved != undefined&&
                    <MonoText>Approved: {item.approved}</MonoText>
                  }


                  </View>
                  <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                    <MonoText   >Status: {item.status}</MonoText>
                  </View>
                </View>
                <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                {item.paymentStatus == false &&
                  <MonoText>Payment Status: Not Received</MonoText>
                }
                {item.paymentStatus == true&&
                  <MonoText>Payment Status: Received</MonoText>
                }
                </View>
                <View style={{flex:1,flexDirection:'row'}}>
                  <View>
                  <TouchableOpacity style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center',marginTop:15}} onPress={()=>{this.repeatOrder(item)}}><FontAwesome name="shopping-cart" size={22} color="blue"  />
                    <MonoText   style={{fontSize:13,color:'blue',marginLeft:4}}>Repeat Order</MonoText>
                  </TouchableOpacity>
                  </View>
                  {item.approved &&
                  <TouchableOpacity style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center',marginTop:15}} onPress={()=>{this.pdfDownload(item.pk)}}><FontAwesome name="download" size={22} color="blue"  />
                    <MonoText   style={{fontSize:13,color:'blue',marginLeft:4}}>Download</MonoText>
                  </TouchableOpacity>
                }
                </View>
                {item.open?(
                  <View style={{marginTop:15}}>
                    <MonoText   style={{fontSize:13}}>{'Address : '+ item.billingStreet+'  '+item.billingCity+'  '+item.billingState+'  '+item.billingPincode+'.'}</MonoText>
                    <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                      <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                        <MonoText   style={{fontSize:13}}>LandMark : {item.billingLandMark}</MonoText>
                      </View>
                      <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                        <MonoText   style={{fontSize:13}}>Mobile : {item.mobileNo}</MonoText>
                      </View>
                    </View>
                    <FlatList style={{marginTop: 15,}}
                      data={item.orderQtyMap}
                      keyExtractor={(item, index) => index}
                      renderItem={({ item }) => (
                        <View style={{borderTopWidth:1,borderColor:'grey',paddingVertical:15}}>
                          <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                            <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                              <MonoText   style={{fontSize:13}}>Name :{item.productName}</MonoText>
                            </View>
                            <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                              <MonoText   style={{fontSize:13}}>Qty :{item.qty}</MonoText>
                            </View>
                          </View>
                          <View style={{flex:1,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',marginTop:15}}>
                            <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                              <MonoText   style={{fontSize:13}}>Price(+ GST) : &#8377; {item.priceDuringOrder}</MonoText>
                            </View>
                            <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-end'}}>
                              <MonoText   style={{fontSize:13}}>Total Amount : &#8377; {item.totalAmount}</MonoText>
                            </View>
                          </View>

                        </View>
                      )}
                    />

                  </View>
                ):<View></View>}
              </Card>
              </TouchableHighlight>
            </View>


            )}
          />
          <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'flex-start',backgroundColor:'#fff', width : width,}}>
            {this.state.orders.length>0&&<TouchableOpacity onPress={this.loadMore}  style={{padding:7,borderWidth:1,borderColor:'#efa834',backgroundColor:'#efa834',marginBottom:20,color:'#fffff'}} >
              <MonoText   style={{color:'#fff'}}>Load More</MonoText>
            </TouchableOpacity>}
            {this.state.orders.length==0&&<MonoText>No Items</MonoText> }
          </View>


          </ScrollView>
         </LinearGradient>


        );
      }
    }
}




const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reOrderFunction:  (args) => dispatch(actions.reOrderAction(args)),


  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderCompleted);





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
   backgroundColor: '#efa834',
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

 FloatingButtonStyle: {
   resizeMode: 'contain',
   width: 50,
   height: 50,


 }


  });
