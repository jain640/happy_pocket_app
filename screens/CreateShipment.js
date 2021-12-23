import React, {Component}from 'react';
import {View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  AsyncStorage,
  Image,ScrollView,FlatList,
  ImageBackground,ActivityIndicator,Alert,Picker}from 'react-native';
import { Ionicons ,FontAwesome,MaterialCommunityIcons,MaterialIcons, } from '@expo/vector-icons';
import settings from '../constants/Settings';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import * as WebBrowser  from 'expo-web-browser';
import  ModalBox from 'react-native-modalbox';
import { MonoText } from '../components/StyledText';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
const { width,height } = Dimensions.get('window');
import DatePicker from 'react-native-datepicker';
import moment from 'moment'

const GoodsCode = [
  '2 KG SUVIDHA BOX',
  '5 KG SUVIDHA BOX',
  'ARTIFICIAL JEWELLERY',
  'ART WORK/PAINTING',
  'AUTO PARTS',
  'CARPETS',
  'CHEMICALS(NONHAZARDOUS)',
  'CHERRIES',
  'COMPANY STOCK',
  'COMPUTER/PRINTER',
  'COSMETICS',
  'CUT FLOWERS',
  'CO LOADERS',
  'DRUGS/PHARMA',
  'ELECTRONICS',
  'ELECTRICAL APPLIANCES',
  'FINISHED LEATHER',
  'FISH SEEDS',
  'FLOWER BULB',
  'FOOD STUFF',
  'GLASS/GLASSWARE',
  'LIVE ANIMAL',
  'MACHINERY/MECHANICAL ITEMS',
  'MISC MANUFACTURED APP',
  'MUSICAL INSTRUMENT',
  'NEWS PAPER/PERIODICAL',
  'SPEED POST MAIL',
  'READY MADE GARMENTS',
  'SILVER WARE',
  'TELE COMMUNICATION PRODUCT',
  'HIGH VALUE CARGO',
  'WATCHES',
  'WOOD ARTICLES',
  'PERSONAL ARTICALS',
  'ELECTRICAL INSTRUMENTS',
  'ELECTRICAL PARTS',
  'WIRES & CABLES',
  'TEA',
  'PEANUTS',
  'GANGA JAL',
  'HALIM',
  'KASHMIRI KESAR',
  'KERALA SPICES',
  'SANTA GOODIES',
  'RAKHI',
  'APPLES',
  'DIWALI DELIGHTS',
  'HOLI',
  'CASHEW',
  'WALNUT',
  'JBPL',
  'COMPUTER MONITOR',
  'COMPUTER KEY BOARD',
  'COMPUTER PROCESSING UNIT(CPU)',
  'PRINTER',
  'COMPUTER PERIPHERALS',
  'ELECTRONIC EQUIPMENTS',
  'ELECTRONIC PARTS',
  'MACHINE TOOLS',
  'AUTOMOBILE PARTS',
  'HEAVY MACHINERY',
  'INDUSTRIAL MACHINERY',
  'INDUSTRIAL MACHINE PARTS',
  'RAW METAL PIECES /STEEL',
  'MISCELLEANOUS ENGINEERING GOODS',
  'TEXTILE MACHINERY',
  'HOUSE HOLD GOODS',
  'FOOD ITEMS',
  'COSMETICS',
  'GLASSWARES',
  'PLASTICS GOODS',
  'GIFT ARTICLES',
  'SPORTS GOODS',
  'FILM ROLL/CAMERA/TAPE',
  'READY MADE GARMENTS',
  'PAINTINGS',
  'HANDICRAFT ITMES',
  'TELEVISION /VCR /VCP',
  'REFERIGERATOR',
  'AUDIO EQUIPMENTS',
  'WASHING MACHINES',
  'AIR CONDITIONER / COOLERS',
  'COTTON GOODS',
  'CLOTH',
  'RAW SILK',
  'HANDLOOM GOODS',
  'SILK SAREES',
  'COTTON SAREES',
  'SAREES',
  'YARN/FLAX YARN',
  'BOOKS',
  'MAGZINES',
  'STATIONARY ITEMS',
  'DIARIES',
  'ADVERTISEMENT MATERIALS',
  'COMPUTER STATIONARY',
  'MISC PRINTED MATERIALS',
  'EMERGENCY / LIFE SAVING DRUGS',
  'HOMEO / AYURVEDIC',
  'MEDICAL EQUIPMENTS / DEVICES',
  'PHYSICIAN SAMPLES',
  'PHARMA DRUGS',
  'PHARMA BULK DRUGS',
  'VACCINE / PERISHABLE DRUGS',
  'SURGICAL EQUIPMENTS / INSTRUMENS',
  'MISC. PHARMA ITEMS',
  'SOLID CHEMICALS',
  'LIQUID CHEMICALS',
  'PAINTS',
  'ADHESIVES',
  'SCIENTIFIC BALANCES & INSTRUMENTS',
  'AGRICULTURAL PRODUCE',
  'RUBBER GOODS',
  'SEEDS',
  'BIOLOGICAL GOODS',
  'BIOLOGICAL EQUIPMENTS',
  'SILVER ORNAMENTS',
  'MANGO MANIA',
  'SALT AND SWEETS',
  'FLOWERS',
  'ACCESSORIES/SPARES',
  'WAREHOUSING',
  '2 TO 8 DEGREES (COLD CHAIN)',
  'DOCUMENTS',
  'ECOM SHIPMENTS',
  'EPACK',
  'E-PICK',
  'E- PICK ONESHIP',
  'EXCHANGE PICKUP',
  'LESS THAN 25 DEGREES (COLD CHAIN)',
  'ADV COOLING OIL',
  'NON DOCUMENTS',
  'NON DOCS (BULK)',
  'REFUND PICKUP',
  'JEWELLERY ITEMS',
  'STOCK TRANSFER',
  'VOI LOCAL PICKUP',
]

class CreateShipment extends Component{
    constructor(props){
        super(props);
        var order = props.navigation.getParam('order')
        this.state={
            store:this.props.store,
            last_name:'',
            first_name:'',
            login:false,
            dp:'',
            loader:false,
            openShipment:false,
            goodCode:null,
            pickupTime:new Date(),
            orderPk:order,
            orderDetails:null,
            shipmentDetails:[],
            goodCode:GoodsCode[0],
            pickupTime:new Date(),
            date:moment(new Date()).format('DD-MM-YYYY'),
            time:moment(new Date()).format('HH:mm'),
            length:0,
            width:0,
            height:0,
            weight:0,
            editItem:null,
            editIndex:-1,
            edit:false
        }
    }

    static navigationOptions=({navigation})=>{
        const { params ={} }=navigation.state
        return{
            title:'Add Shipment Details',
            headerLeft:(
              <View style={{justifyContent:'flex-start',paddingLeft:15,}}>
                  <TouchableOpacity onPress={()=>{navigation.goBack();}}>
                    <MaterialIcons name="arrow-back" size={30} color={params.themeColor}/>
                  </TouchableOpacity>
              </View>
            ),
            headerStyle:{
                backgroundColor:'#fff',
                marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
            },
            headerTintColor: params.themeColor,
        }
    }

    getOrder=async()=>{
      var csrf = await AsyncStorage.getItem('csrf');
      var sessionid = await AsyncStorage.getItem('sessionid');
      this.setState({loader:true})
      fetch(SERVER_URL+'/api/POS/order/'+this.state.orderPk+'/', {
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
        if(responseJson!=undefined){
          this.getShipment()
          console.log(responseJson);
          this.setState({orderDetails:responseJson,pickupTime:responseJson.pickupTime,goodCode:responseJson.goodCode})
          if(responseJson.pickupTime!=null){
            this.setState({date:moment(responseJson.pickupTime).format('DD-MM-YYYY'),time:moment(responseJson.pickupTime).format('HH:mm')})
          }
          this.setState({ orderDetails: responseJson})
        }
          this.setState({loader:false})
      }).catch((error) => {
          this.setState({loader:false})
          return
  });
    }

  getShipment=async()=>{
    var csrf = await AsyncStorage.getItem('csrf');
    var sessionid = await AsyncStorage.getItem('sessionid');
    fetch(SERVER_URL+'/api/POS/shipment/?order='+this.state.orderPk, {
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
      if(responseJson!=undefined){
        this.setState({ shipmentDetails: responseJson})
      }
        this.setState({loader:false})

    }).catch((error) => {
        this.setState({loader:false})
        return
  });
  }

    componentDidMount=()=>{
        this.props.navigation.setParams({
          themeColor:this.state.store.themeColor,
        })
        this.getOrder()
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


    saveOrder=async()=>{
      var hour    = this.state.time.split(':')[0]
      var minute    = this.state.time.split(':')[1]
      var date = moment(this.state.date + ' ' + this.state.time, 'DD/MM/YYYY HH:mm');
      // console.log( date,this.state.goodCode,hour,minute,'lllllllll');
      // return
      var dataToSend = {
        goodCode:this.state.goodCode,
        pickupTime:date,
      }
      var sessionid = await AsyncStorage.getItem('sessionid');
      var csrf = await AsyncStorage.getItem('csrf');
      this.setState({sessionid:sessionid,csrf:csrf,loader:true})
      fetch(SERVER_URL+'/api/POS/order/'+this.state.orderDetails.pk+'/',{
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
          return response.json()
        }
        }).then((json) => {
          console.log(json);
          if(json!=undefined){
            this.setState({orderDetails:json,pickupTime:json.pickupTime,goodCode:json.goodCode})
            if(json.pickupTime!=null){
              this.setState({date:moment(json.pickupTime).format('DD-MM-YYYY'),time:moment(json.pickupTime).format('HH:mm')})
            }
          }
          this.setState({loader:false})
        }).catch((error) => {
          this.setState({loader:false})
            Alert.alert('Something went wrong in Server side');
      });
    }

    commitShipment=async()=>{
      var sessionid = await AsyncStorage.getItem('sessionid');
      var csrf = await AsyncStorage.getItem('csrf');
      this.setState({sessionid:sessionid,csrf:csrf,loader:true})
      fetch(SERVER_URL+'/api/POS/commitShipment/?id='+this.state.orderDetails.pk+'/',{
        method: 'POST',
        headers: {
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Accept': 'application/json, text/plain,',
           'Content-Type': 'application/json;charset=utf-8',
           'X-CSRFToken':csrf,
           'Referer': SERVER_URL
         },
        }).then((response) =>{
          console.log(response.status,'kkkkkkkkkkkkk');
        if(response.status === 200 ){
          this.setState({loader:false})
          return true
        }else{
          return false
        }
        }).then((json) => {
          if(json){
            this.navigation.goBack()
          }
          this.setState({loader:false})
        }).catch((error) => {
          this.setState({loader:false})
            Alert.alert('Something went wrong in Server side');
      });
    }


    addPackage=async()=>{
      var sessionid = await AsyncStorage.getItem('sessionid');
      var csrf = await AsyncStorage.getItem('csrf');
      this.setState({sessionid:sessionid,csrf:csrf,loader:true})
      var dataToSend = {
        height:this.state.height,
        weight:this.state.weight,
        length:this.state.length,
        width:this.state.width,
        order:this.state.orderDetails.pk
      }
      if(this.state.edit){
        fetch(SERVER_URL+'/api/POS/shipment/'+this.state.editItem.pk+'/',{
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
          if(response.status === 200 || response.status == 201 ){
            this.setState({loader:false,edit:false})
            return response.json()
          }
          }).then((json) => {
            if(json!=undefined){
              var arr = this.state.shipmentDetails
              arr[this.state.editIndex] = json
              this.setState({shipmentDetails:arr,edit:false})
              this.setState({height:0,width:0,length:0,weight:0,})
            }
            this.setState({loader:false,edit:false})
          }).catch((error) => {
            this.setState({loader:false,edit:false})
            this.setState({height:0,width:0,length:0,weight:0,})
              Alert.alert('Something went wrong in Server side');
        });
      }else{
        fetch(SERVER_URL+'/api/POS/shipment/',{
          method: 'POST',
          headers: {
             "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
             'Accept': 'application/json, text/plain,',
             'Content-Type': 'application/json;charset=utf-8',
             'X-CSRFToken':csrf,
             'Referer': SERVER_URL
           },
          body:JSON.stringify(dataToSend)
          }).then((response) =>{
          if(response.status === 200 || response.status == 201 ){
            this.setState({loader:false,edit:false})
            return response.json()
          }
          }).then((json) => {
            if(json!=undefined){
              var arr = this.state.shipmentDetails
              arr.push(json)
              this.setState({shipmentDetails:arr,edit:false})
            }
            this.setState({loader:false,edit:false})
            this.setState({height:0,width:0,length:0,weight:0,})
          }).catch((error) => {
            this.setState({loader:false,edit:false})
            this.setState({height:0,width:0,length:0,weight:0,})
              Alert.alert('Something went wrong in Server side');
        });
      }

    }

    deleteItem=async(item,index)=>{
      var sessionid = await AsyncStorage.getItem('sessionid');
      var csrf = await AsyncStorage.getItem('csrf');
      this.setState({sessionid:sessionid,csrf:csrf,loader:true})
      fetch(SERVER_URL+'/api/POS/shipment/'+item.pk+'/',{
        method: 'DELETE',
        headers: {
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Accept': 'application/json, text/plain,',
           'Content-Type': 'application/json;charset=utf-8',
           'X-CSRFToken':csrf,
           'Referer': SERVER_URL
         },
        }).then((response) =>{
        if(response.status === 200 || response.status == 201 || response.status == 204 ){
          this.setState({loader:false})
          return true
        }else{
          return false
        }
        }).then((json) => {
          if(json){
            var arr = this.state.shipmentDetails
            arr.splice(index,1)
            this.setState({shipmentDetails:arr})
          }
          this.setState({loader:false})
        }).catch((error) => {
          this.setState({loader:false})
            Alert.alert('Something went wrong in Server side');
      });
    }

    editItem=async(item,index)=>{
      this.scrollView.scrollTo({x:0,y:150,animated: true })
      var sessionid = await AsyncStorage.getItem('sessionid');
      var csrf = await AsyncStorage.getItem('csrf');
      this.setState({height:item.height,width:item.width,length:item.length,weight:item.weight,editItem:item,editIndex:index,edit:true})
    }

    renderHeader = () => {
      return (
        <View style={{paddingVertical: 8,flex:1,backgroundColor:'#f2f2f2',flexDirection: 'row'}}>
          <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
            <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>Length</MonoText>
          </View>
          <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
            <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>Width</MonoText>
          </View>
          <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
            <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>Height</MonoText>
          </View>
          <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
            <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>Weight</MonoText>
          </View>
        </View>
      )
     };


    render(){
   var varientChoicesText = GoodsCode.map( (s, i) => {
     return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
   });

    if(!this.state.loader&&this.state.orderDetails!=null){
    return(
      <View style={[styles.container,{backgroundColor:'#fff'}]}>
        <ScrollView ref={ref => {this.scrollView = ref}}>
           <View style={{marginHorizontal:15,marginVertical:15}}>
              <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Pickup Date</MonoText>
              </View>
              <View style={{width: "100%",height:40,backgroundColor:'#fff' }}>
                <View style={{flex:1,flexDirection:'row',}}>
                  <View style={{flex:0.2,marginTop:5,height:40,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:1,borderRightWidth:0,borderColor:'#f2f2f2',borderRadius:0}}>
                      <FontAwesome name="calendar" size={17} />
                   </View>
                  <View style={{flex:0.8,marginTop:5,height:40,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:0,borderColor:'#f2f2f2',borderRadius:0,marginRight:5}}>
                    <DatePicker
                      style={{padding:0,margin:0,alignItems:'center',justifyContent:'center',width:'100%' }}
                      date={this.state.date}
                      mode="date"
                      placeholder="select date"
                      format="DD-MM-YYYY"
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      showIcon={false}
                      iconComponent={
                         <FontAwesome
                             size={20}
                             color='#1a689a'
                             name='calendar'
                         />
                       }
                      customStyles={{
                        dateInput: {padding:0,margin:0,backgroundColor:'#fff',borderWidth:1,height:40,fontSize:18,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,  }
                      }}
                      onDateChange={date => {
                        this.setState({ date: date });
                      }}
                    />
                  </View>
               </View>
             </View>
          </View>
           <View style={{marginHorizontal:15,marginBottom:15}}>
              <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Pickup Time</MonoText>
              </View>
              <View style={{width: "100%",height:40,backgroundColor:'#fff' }}>
                <View style={{flex:1,flexDirection:'row',}}>
                  <View style={{flex:0.2,marginTop:5,height:40,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:1,borderRightWidth:0,borderColor:'#f2f2f2',borderRadius:0}}>
                      <FontAwesome name="calendar" size={17} />
                   </View>
                  <View style={{flex:0.8,marginTop:5,height:40,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',fontSize:16,borderWidth:0,borderColor:'#f2f2f2',borderRadius:0,marginRight:5}}>
                    <DatePicker
                      style={{padding:0,margin:0,alignItems:'center',justifyContent:'center',width:'100%' }}
                      date={this.state.time}
                      mode="time"
                      format={'HH:mm'}
                      placeholder="select Time"
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      showIcon={false}
                      iconComponent={
                         <FontAwesome
                             size={20}
                             color='#1a689a'
                             name='clock-o'
                         />
                       }
                      customStyles={{
                        dateInput: {padding:0,margin:0,backgroundColor:'#fff',borderWidth:1,height:40,fontSize:18,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,  }
                      }}
                      onDateChange={time => {
                        this.setState({ time: time });
                      }}
                    />
                  </View>
               </View>
             </View>
          </View>
          <View style={{marginHorizontal:15,marginBottom:15}}>
            <View style={{flexDirection:'row'}}>
              <MonoText   style={{fontSize:16,fontWeight:'700'}}>Goods Code</MonoText>
            </View>
            <View style={{width: "100%",height:40,marginTop:5 ,borderWidth:1,borderColor:'#f2f2f2',paddingVertical:7,backgroundColor:'#fff' }}>
              <Picker
                selectedValue={this.state.goodCode}
                mode="dropdown"
                style={{ width: "100%",height:26 ,}}
                itemStyle={{marginVertical:0,paddingVertical:0}}
                onValueChange={(itemValue, itemIndex)=>this.setState({goodCode:itemValue})}>
                {varientChoicesText}
              </Picker>
            </View>
          </View>
          <View style={{paddingVertical:15,paddingHorizontal:15}}>
              <Text style={{fontWeight:'700',fontSize:18,color:'#000'}}>Add Package</Text>
              <View style={{marginVertical:15}}>
                   <View style={{flexDirection:'row'}}>
                     <MonoText   style={{fontSize:16,fontWeight:'700'}}>Length</MonoText>
                   </View>
                   <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                       onChangeText={(length) => this.setState({length})} keyboardType={'numeric'} placeholder={'Length'}
                       value={this.state.length.toString()}>
                   </TextInput>
              </View>
              <View style={{marginBottom:15}}>
                   <View style={{flexDirection:'row'}}>
                     <MonoText   style={{fontSize:16,fontWeight:'700'}}>Width</MonoText>
                   </View>
                   <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                       onChangeText={(width) => this.setState({width})} keyboardType={'numeric'} placeholder={'Width'}
                       value={this.state.width.toString()}>
                   </TextInput>
              </View>
              <View style={{marginBottom:15}}>
                   <View style={{flexDirection:'row'}}>
                     <MonoText   style={{fontSize:16,fontWeight:'700'}}>Height</MonoText>
                   </View>
                   <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                       onChangeText={(height) => this.setState({height})} keyboardType={'numeric'} placeholder={'Height'}
                       value={this.state.height.toString()}>
                   </TextInput>
              </View>
              <View style={{marginBottom:15}}>
                   <View style={{flexDirection:'row'}}>
                     <MonoText   style={{fontSize:16,fontWeight:'700'}}>Weight</MonoText>
                   </View>
                   <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:5}}
                       onChangeText={(weight) => this.setState({weight})} keyboardType={'numeric'} placeholder={'Weight'}
                       value={this.state.weight.toString()}>
                   </TextInput>
              </View>
              <View style={{marginBottom:15}}>
                <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:this.state.store.themeColor,paddingVertical:8,}} onPress={()=>{this.addPackage()}} >
                  <MonoText   style={{fontSize:18,fontWeight:'400',color:'#fff'}}>{this.state.edit?'Edit':'Add'}</MonoText>
                </TouchableOpacity>
              </View>
              {this.state.shipmentDetails.length>0&&
                <View style={{}}>
              <FlatList
                  data={this.state.shipmentDetails}
                  extraData={this.state}
                  scrollToEnd={true}
                  horizontal={false}
                  ListHeaderComponent={this.renderHeader}
                  nestedScrollEnabled={true}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index})=>(
                    <View style={{paddingVertical: 8,flex:1,backgroundColor:(index+1)%2==0?'#f2f2f2':'#fff',flexDirection: 'row'}}>
                      <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
                        <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>{item.length}</MonoText>
                      </View>
                      <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
                        <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>{item.width}</MonoText>
                      </View>
                      <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
                        <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>{item.height}</MonoText>
                      </View>
                      <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center'}}>
                        <MonoText   style={{fontSize: 14,fontWeight: '600',color:'#000'}}>{item.weight}</MonoText>
                      </View>
                      <View style={{flex:0.2,alignItems: 'center',justifyContent: 'center',}}>
                        <View style={{flex:1,flexDirection:'row'}}>
                          <TouchableOpacity onPress={()=>{this.editItem(item,index)}} style={{flex:1,flexDirection:'row'}}>
                             <FontAwesome name="pencil" size={24} color={themeColor} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={()=>{this.deleteItem(item,index)}} style={{flex:1,flexDirection:'row'}}>
                              <MaterialCommunityIcons name="delete" size={24} color={'red'} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                  />
              </View>
            }
          </View>
        </ScrollView>

        <View style={{justifyContent:'space-between',flexDirection:'row',backgroundColor:'#fff',}}>
          <TouchableOpacity onPress={()=>{this.saveOrder()}} style={{borderLeftWidth:0.5,flex:1,borderColor:'green',backgroundColor:'green'}}>
              <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>Save</MonoText>
          </TouchableOpacity>
          {this.state.shipmentDetails.length>0&&
            <TouchableOpacity style={{borderWidth:0.5,alignSelf:'center',flex:1,borderColor:this.state.store.themeColor,backgroundColor:this.state.store.themeColor}} onPress={()=>{this.commitShipment()}}>
          <MonoText   style={{textAlign:'center',fontSize:20,paddingVertical:6,color:'#fff'}}>Create Shipment</MonoText>
          </TouchableOpacity>
          }
        </View>

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

export default connect(mapStateToProps, mapDispatchToProps)(CreateShipment)
