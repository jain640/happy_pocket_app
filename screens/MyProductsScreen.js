import React,{Component} from 'react';
import {View,Text,Dimensions,TextInput,TouchableOpacity,StyleSheet,FlatList,AsyncStorage,ScrollView} from 'react-native';
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
import { Switch } from 'react-native-switch';

const SERVER_URL = settings.url;

class MyProductsScreen extends React.Component{

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;

        return {
          drawerLabel: 'MyProducts',
          title: (params.text1==true?'':'Products'),
          headerLeft: (
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>

                 {params.text1==true ?
                 <TouchableOpacity onPress={()=>{params.isSearchState(params.text1);params.searchContact("");}}>
                        <MaterialIcons name="arrow-back" size={30} color={params.text1==true?params.themeColor:'#fff'} style={{paddingRight:8}}/>
                 </TouchableOpacity>:<TouchableOpacity onPress={()=>{navigation.navigate('SellerZone');}}>
                        <MaterialIcons name="arrow-back" size={30} color={params.text1==true?params.themeColor:'#fff'}/>
                 </TouchableOpacity>}
                 {params.text1==true &&
                 <SearchBar
                            containerStyle={{padding:0,width:width*0.8,marginBottom:3,marginTop:0,color:'#ffffff',fontSize:14,borderWidth:0,backgroundColor:'transparent',height:30,borderTopWidth:0}}
                            inputContainerStyle={{padding:0,height:30,width:width*0.8,fontSize:14,marginTop:0,marginBottom:2,backgroundColor:'#f9f9f9'}}
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
          Storepk:'',
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
          pageIndex:0,
          masterStorePK:this.props.masterStorePK,
          selectedStore:this.props.selectedStore
        }


    }

    getProducts=async()=>{
       if(this.state.store.storeType=='MULTI-OUTLET'){
         this.setState({pageIndex:0})
          if(this.state.selectedStore.pk!=undefined&&this.state.selectedStore.pk!=this.state.store.pk){
           await fetch(SERVER_URL +'/api/POS/outletProductsDetailed/?storeid='+this.state.selectedStore.pk+'&page='+this.state.pageIndex)
           .then((response) =>{ return response.json()})
           .then((responseJson) => {
               var arr =  this.state.products
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
               await fetch(SERVER_URL + '/api/POS/productlitesv/?offset=0&limit=24&storeid='+this.state.store.pk)
               .then((response) => { return response.json()})
               .then((responseJson) => {
                 var arr =  this.state.products
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
             await fetch(SERVER_URL + '/api/POS/productlitesv/?offset=0&limit=24&storeid='+this.state.store.pk)
             .then((response) => response.json())
             .then((responseJson) => {
               var arr =  this.state.products
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

        }



    reLoad=()=>{
      this.setState({offset:0,products:[]})
      this.userAsync()
    }







    userAsync = async () => {
        const sessionid = await AsyncStorage.getItem('sessionid');
        this.setState({SERVER_URL:SERVER_URL,sessionid:sessionid});

        try {
          await fetch(SERVER_URL+'/api/POS/productlitesv/?&search=&limit=6&offset='+this.state.offset+'&store='+this.state.Storepk,{
            headers: {
               "Cookie" :"sessionid=" + sessionid +";",
               'Accept': 'application/json',
               'Content-Type': 'application/json',
               'Referer': SERVER_URL,
            }})
            .then((response) => {

            if(response.status == '200' || response.status == 200){
              return response.json()
            }else{
              return undefined
            }
          })
          .then((responseJson) => {
          if(responseJson == undefined){
            this.setState({ products:[], isLoading: false ,offset:this.state.offset+10})
            this.setState({listBackup: []})
            return
          }
          var arr =  this.state.products
          for (var i = 0; i < responseJson.results.length; i++) {
            arr.push(responseJson.results[i])
          }
          this.setState({ products:arr, isLoading: false ,offset:this.state.offset+10})
          this.setState({listBackup: arr})
          })
          .catch((error) => {
          });
        } catch (error) {
            return
          }
        };


    isSearchState=(text1)=>{
          var text1=this.setState({text1:!text1})
          this.props.navigation.setParams({
            text1:this.state.text1,
          });
        }

    searchContact = (query)=>{
        var text =this.setState({text:query})
        this.props.navigation.setParams({
          text:()=>this.setState({text:query}),
        });
        if(query.length == 0){
          this.setState({products: this.state.listBackup})
          return
        }

        fetch(this.state.SERVER_URL+'/api/POS/productlitesv/?name__icontains='+query+'&limit=20',{
          headers: {
             "Cookie" :"sessionid=" + this.state.sessionid +";",
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'Referer': this.state.SERVER_URL,
          }
          }).then((response) => {
            if(response.status == '200' || response.status == 200){
              return response.json()
            }else{
              return undefined
            }
          })
          .then((responseJson) => {
            if(responseJson == undefined){
              this.setState({products: []})
              return
            }
            this.setState({products: responseJson.results})
          })
          .catch((error) => {
            this.setState({products: []})
            return
          });
        }

    getStore=async()=>{
        var csrf = await AsyncStorage.getItem('csrf');
        const userToken = await AsyncStorage.getItem('userpk');
        const sessionid = await AsyncStorage.getItem('sessionid');
        await fetch(SERVER_URL+'/api/POS/store/?owner='+userToken,{
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
              this.setState({ Storepk: responseJson[0].pk})
              this.state.Storepk=responseJson[0].pk
              AsyncStorage.setItem('Storepk',this.state.Storepk);
          })
          .catch((error) => {
            return
        });
    }

    componentDidMount=async()=>{
        this.props.navigation.setParams({
          themeColor: this.state.store.themeColor,
          text: this.state.text,
          text1:this.state.text1,
          searchContact:((text)=>this.searchContact(text)),
          isSearchState:((text1)=>this.isSearchState(text1)),

        });
        this.getStore();
        this.getProducts();
    }


   Touch=(item)=>{
       this.props.navigation.navigate('ProductScreen',{touchitem:item,userAsync:()=>this.reLoad()})
   }

   ShowAlert= async(item,pk,enabled,index,value,parentIdx)=>{
      var list = this.state.products
      var dataToSend = {
        enabled:!item.enabled,
      }
      var sessionid = await AsyncStorage.getItem('sessionid');
      var csrf = await AsyncStorage.getItem('csrf');
      this.setState({sessionid:sessionid,csrf:csrf})
      fetch(SERVER_URL+'/api/POS/productVariantsv/'+pk+'/',{
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
          return response.json()
        }
        }).then((json) => {
          list[parentIdx].variant[index].enabled = json.enabled
          this.setState({products:list})
        }).catch((error) => {
            Alert.alert('Something went wrong in Server side');
      });
    }

    filterList = text => {
         var newData = this.state.listBackup;
         newData = this.state.listBackup.filter(item => {
           const itemData = item.name.toLowerCase();
           const textData = text.toLowerCase();
           return itemData.indexOf(textData) > -1;
         });
         this.setState({
           query: text,
           products: newData,
           text:text,
         });
     };


   Render_Footer=()=>{
      return (
       <View style={{flex:1,justifyContent:'center'}} >
           <TouchableOpacity
               activeOpacity = { 0.7 }
               style={{paddingVertical:8,paddingHorizontal:8,alignSelf:'center'}}
               onPress = { this.userAsync }
               >
               <MonoText   style={{color:'#125891',textStyle:'underline'}}>Load More </MonoText>
                 {( this.state.fetching_Status)?<ActivityIndicator color = "#3bb3c8" style = {{ marginLeft: 6 }} />
                     :null}
           </TouchableOpacity>
       </View>
     )
   }


  render(){
    const data1=[{value: 'Ton',}, {value: 'Kilogram',}, {value: 'Gram',},
                 {value: 'Litre',} ,{value: 'MilliLitre',},{value: 'Quantity',},
                 {value: 'Size',},{value: 'Size & Color',}]
    var themeColor = this.props.store.themeColor
    return(
      <View style={{flex:1,backgroundColor:'#f1f1f1'}}>
        <FlatList
            data={this.state.products}
            extraData={this.state}
            inverted={false}
            scrollToEnd={true}
            horizontal={false}
            ListFooterComponent = { this.Render_Footer }
            nestedScrollEnabled={true}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index})=>{
              var parentIdx = index
              return(
            <TouchableOpacity  activeOpacity={0}disabled>
                <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center',
                              marginTop: 15,marginLeft:width*0.04,marginRight:width*0.04,borderWidth:0.5,
                              paddingHorizontal:10,paddingVertical:10,width:width*0.92,backgroundColor:'#ffffff',
                              borderColor:themeColor,borderBottomLeftRadius:17,borderTopRightRadius:17,borderRadius:17}}>
                      <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start',fontSize:24}}>
                          <TouchableOpacity style={{width:width*0.85,paddingVertical:4,paddingBottom:8}}onPress={()=>{this.Touch(item)}}>
                          <MonoText   style={{paddingBottom:2}}>{item.name}</MonoText>
                          <MonoText   style={{paddingVertical:2}}>{item.category==null?'':item.category.name}</MonoText>
                          <MonoText   style={{paddingVertical:2}}>{item.description}</MonoText>
                          </TouchableOpacity >
                          <View style={{borderWidth:0,width:width*0.85,}}>
                              {item.variant.length>0&&<View style={{borderTopWidth:0.5,borderBottomWidth:0.5,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderColor:'#7e807f'}}>
                                <MonoText   style={{fontWeight:'bold',paddingVertical:2,flex:0.15,borderWidth:0,textAlign:'center'}}>Status</MonoText>
                                {/* <MonoText   style={{fontWeight:'bold',paddingVertical:2,flex:0.2,borderWidth:0,textAlign:'center'}}>MRP</MonoText>  */}
                                <MonoText   style={{fontWeight:'bold',paddingVertical:2,flex:0.35,borderWidth:0,textAlign:'center'}}>SellingPrice</MonoText>
                                <MonoText   style={{fontWeight:'bold',paddingVertical:2,flex:0.13,borderWidth:0,textAlign:'center'}}>MOQ</MonoText>
                                <MonoText   style={{fontWeight:'bold',paddingVertical:2,flex:0.37,borderWidth:0,textAlign:'center'}}>Details</MonoText>
                              </View >}

                                <ScrollView style={{borderRadius:0,
                                                    backgroundColor:'#ffffff',borderColor : '#ffffff' ,}}
                                            horizontal={false}
                                            showsHorizontalScrollIndicator={false} >
                                    <FlatList
                                        data={item.variant}
                                        keyExtractor={(item,index) => {return index.toString();}}
                                        horizontal={false}
                                        extraData={this.state}
                                        numColumns={1}
                                        nestedScrollEnabled={true}
                                        renderItem={({item, index}) => {
                                          return (
                                        <View style={{paddingTop: 20,paddingHorizontal:0,backgroundColor:this.state.themeColor-10,borderRadius:0,}}>
                                            <Card containerStyle={{borderWidth: 0, borderColor: '#67d142', borderRadius: 0,margin:0,
                                                                    padding: 0,paddingBottom:10}}>
                                                <View style={{flexDirection:'row',justifyContent:'space-around',width:width*0.85,}}>
                                                    <Switch
                                                          value={item.enabled}
                                                          onValueChange={(value)=> this.ShowAlert(item,item.pk,item.enabled,index,value,parentIdx)}
                                                          height={24}
                                                          width={40}
                                                          containerStyle={{alignSelf:'flex-end',justifyContent:'flex-end',alignItems:'flex-end',paddingLeft:width*0.12,paddingVertical:2,width:40,height:20,borderWidth:1,borderColor:'#b4b4b4'}}
                                                          backgroundActive={themeColor}
                                                          backgroundInactive={'#f7f7f7'}
                                                          circleActiveColor={'#ffffff'}
                                                          circleInActiveColor={'#ffffff'}
                                                          circleBorderWidth={1}
                                                          outerCircleStyle={{borderColor:themeColor}}
                                                          changeValueImmediately={true}
                                                        />
                                                    <View style={{flexDirection:'row',alignItems:'flex-start',flex:0.35,justifyContent:'center'}}>
                                                    <MonoText
                                                      style={{paddingTop:4,
                                                              paddingRight:4,
                                                              color:'#dd0e0e',textAlign:'left',
                                                              textDecorationLine:'line-through',
                                                              textDecorationThickness:'2px',
                                                              textDecorationStyle:'solid'}}>
                                                        &#8377;{item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</MonoText>
                                                    <MonoText
                                                      style={{paddingTop:4,textAlign:'left',
                                                              paddingHorizontal:4,}}>
                                                        &#8377;{item.sellingPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</MonoText>
                                               </View>

                                                 <MonoText   style={{paddingTop:4,flex:0.13,
                                                             paddingHorizontal:0,
                                                             textAlign:'left'}}>
                                                 {item.maxQtyOrder}</MonoText>
                                                 <View style={{flexDirection:'row',alignItems:'flex-start',flex:0.37,justifyContent:'center'}}>
                                                  {(item.unitType!='Color'&&item.unitType!='Size and Color'&&item.unitType!='Quantity and Color')&&
                                                    <MonoText   style={{paddingTop:4,
                                                                paddingHorizontal:0,
                                                                textAlign:'left'}}>
                                                    {item.unitType} {item.value}</MonoText>
                                                  }

                                                  {item.unitType=='Color'&&
                                                    <View style={{justifyContent:'center',borderWidth:0,marginTop:6,borderRadius:50,height:width*0.03,width:width*0.03,backgroundColor:item.value}}>
                                                    </View>
                                                  }

                                                  {(item.unitType=='Size and Color'||item.unitType=='Quantity and Color')&&
                                                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                                                        <MonoText   style={{paddingTop:4,paddingRight:2,textAlign:'left',}}>
                                                          {item.unitType.split(" ")[0]} </MonoText>
                                                        <MonoText   style={{paddingTop:4,paddingHorizontal:2,textAlign:'left',}}>{item.value} </MonoText>
                                                        <View style={{borderWidth:0,borderRadius:50,marginTop:4,alignSelf:'center',
                                                                      height:width*0.03,width:width*0.03,backgroundColor:item.value2}}>
                                                        </View>
                                                   </View>
                                                  }
                                              </View>
                                           </View>
                                        </Card>
                                    </View>)
                                   }}
                                  />
                                  <View style={{height: 15}}></View>
                              </ScrollView>
                          </View>
                      </View>
                </View>
            </TouchableOpacity>) }}
            />
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
    masterStore:state.cartItems.masterStorePK,
    selectedStore:state.cartItems.selectedStore
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

export default connect(mapStateToProps, mapDispatchToProps)(MyProductsScreen);
