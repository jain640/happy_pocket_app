import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  View,
  Slider,
  Dimensions, Alert,StatusBar,FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,TouchableWithoutFeedback,NativeModules,LayoutAnimation,Picker,Keyboard,
} from 'react-native';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import TextLoader from '../components/TextLoader';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { FontAwesome,Entypo,MaterialIcons ,Ionicons} from '@expo/vector-icons';
import {ColorPicker, StatusColorPicker } from 'react-native-status-color-picker';
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import { MonoText } from '../components/StyledText';
import * as FileSystem from 'expo-file-system';
import ModalBox from 'react-native-modalbox';
import { Card,CheckBox } from 'react-native-elements';
import { Switch,RadioButton } from 'react-native-paper';

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

const { width } = Dimensions.get('window');
const height = width * 0.8

const SERVER_URL = settings.url

const product = {
  "category": {
  "alias": "ImpactDrivers",
  "bannerImage": null,
  "categoryIndex": 0,
  "created": "2020-01-22T16:05:51.000767Z",
  "minCost": 100,
  "mobileBanner": null,
  "name": "Impact Drivers",
  "parent": null,
  "pk": 4,
  "restricted": false,
  "store": 1,
  "visual": null,
},
"cityin": [],
"cityout": [],
"codAdvance": 0,
"created": "2020-02-28T13:06:01.953055Z",
"description": "CreateTest",
"detailedDescription": null,
"iscod": false,
"name": "ProductCreate",
"parentCode": null,
"pincodein":  [],
"pincodeout":  [],
"pk": 81,
"productIndex": 0,
"statein":  [],
"stateout":  [],
"store": 1,
}



const colors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
         "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
         "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800",
         "#FF5722", "#795548", "#9E9E9E", "#607D8B","#000000","#FFFFFF","#EFA834","#1a396f"]

const gstTypes =  [{label: 'Gst Included',value:'gst_included'}, {label: 'Gst Extra',value:'gst_extra'},
                 {label: 'Gst not Applicable',value:'gst_notapplicable'}, ]

const productVariant = [{pk:null},{pk:	42,created:'2020-02-29T10:33:22.097688Z',sku:	null,unitType:	'Size and Color',price:	600,sellingPrice:	500,specialOffer:	null,maxQtyOrder:	10,minQtyOrder:	5,reOrderThreshold:	0,barcodeId	:null,shippingCost:	0,stock	:null,displayName:	'hexa Size and Color XL',parent:	83,discount:	0,brand:	null,productMeta:{pk:	2,code:	'3402',typ:	'HSN',taxRate	:10,description:	'GST',store	:null},customizable:	false,deliveryTime:	1,customisedDeliveryTime:	null,
images:	[{pk:	47,created:	'2020-02-29T10:32:56.876769Z',link:	null,attachment:	'/media/POS/productV2/1582972376_88_shirt2.jpg',mediaType:	'image',imageIndex:	0,title:	null,discription:	null}],value:	'XL',value2:	null,gstType:	'gst_included',enabled:	true}]

const warrantyProvider =  ['Manufacturer','Seller']

const warrantyType =  ['Manufacturing Defect','Not Physical damaged','Replacement','Repair']

const warrantyLimit =  ['Years','Months','Days']

class ProductVariantDetails extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      headerLeft: (
        <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{ flex: 1, justifyContent: 'center', alignItems: 'center',marginLeft:15,height:'100%' }}>
         <MaterialIcons name="arrow-back" size={30} color='#fff'  />
        </TouchableOpacity>
     ),

      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Constants.statusBarHeight
      },
      headerTitleStyle: {
        flex: 1,
        marginRight:60,
        fontSize:18,
        textAlign:'center',
        alignSelf: 'center',
      },
      title: params.title,
      headerTintColor: '#fff',
    }
  };




  constructor(props) {
    super(props);
    var params = props.navigation.state.params
    var variant = params.variant
    var images = [{pk:null}]
    if(variant!=null){
      var unitType = variant.unitType
      if(unitType == 'Color'){
        var selectedColor = variant.value
      }else if(unitType == 'Quantity and Color' ||unitType == 'Size and Color' ){
        var selectedColor = variant.value2
      }
      var value = variant.value
      var value2 = variant.value2
      var price = variant.price
      var sellingPrice = variant.sellingPrice
      var weight = variant.weight==null?0:variant.weight
      var inStock = variant.stock==null?0:variant.stock
      var minQtyOrder = variant.minQtyOrder
      variant.images.forEach((i)=>{
        i.attachment = SERVER_URL + i.attachment
        images.push(i)
      })
      var update = true
      var isWarranty = variant.isWarranty
      var warrantyDuration = variant.warrantyPeriod==null?0:variant.warrantyPeriod
      var warrantyProviderr = variant.warrantyProvider==null?warrantyProvider[0]:variant.warrantyProvider
      var warrantyTypee = variant.warrantyType
      var warrantyLimitType = variant.warrantyLimit
    }else{
      var unitType = this.props.unitTypes[0]
      var value = ''
      var value2 = '#1a396f'
      var price = 0
      var sellingPrice = 0
      var images = images
      var update = false
      var selectedColor = '#1a396f'
      var weight = 0
      var inStock = 0
      var minQtyOrder = 0
      var isWarranty = false
      var warrantyDuration = 0
      var warrantyProviderr = warrantyProvider[0]
      var warrantyTypee = warrantyType[0]
      var warrantyLimitType = warrantyLimit[0]
    }
    this.state = {
      store:props.store,
      product:params.product,
      unitTypes:props.unitTypes,
      unitType:unitType,
      value:value,
      colorPallet:false,
      colors:colors,
      selectedColor: selectedColor,
      visible: false,
      value2:value2,
      mrp:price,
      sellingPrice:sellingPrice,
      gstType:params.gstType,
      gstTypes:gstTypes,
      hsnShow:true,
      keyboardOffset: 0,
      images:images,
      csrf:null,
      sessionid:null,
      productVariant:[],
      isView:false,
      unitDisable:false,
      taxcodepk:params.product.taxCode,
      taxCode:params.taxCode,
      taxRate:params.taxRate,
      update:update,
      variantPk:variant,
      weight:weight,
      inStock:inStock,
      minQtyOrder:minQtyOrder,
      keyboardOpen:false,
      isWarranty:isWarranty,
      warrantyDuration:warrantyDuration,
      warrantyProvider:warrantyProviderr,
      warrantyType:warrantyTypee,
      screenHeight:0,
      initialLoad:true,
      warrantyLimit:warrantyLimitType
    }
    Keyboard.addListener(
    'keyboardDidHide',
    this.keyboardDidHide
   )
   Keyboard.addListener(
      'keyboardDidShow', this.keyboardDidShow
)
  }

  getUser=async()=>{
    let csrf = await AsyncStorage.getItem('csrf');
    let sessionid = await AsyncStorage.getItem('sessionid');
    this.setState({csrf:csrf,sessionid:sessionid})
    this.getProductVariant()
  }

  componentDidMount(){
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
      title:this.state.update?'Update Variant':'Add Variant'
    })
    this.getUser()
  }
  dropDownChanged = (itemValue, itemIndex) => {
    this.setState({ unitType:itemValue})
    if(itemValue =='Size and Color'||itemValue =='Color'||itemValue =='Quantity and Color'){
      this.setState({colorPallet:true})
    }else{
      this.setState({colorPallet:false})
    }
  }
  gstChanged = (itemValue, itemIndex) => {
    this.setState({ gstType:itemValue})
    if(itemValue=='gst_included'||itemValue=='gst_extra'){
      this.setState({hsnShow:true})
    }else{
      this.setState({hsnShow:false})
    }
  }
  onSelect = color =>{
      this.setState({ selectedColor: color ,visible:false,value2:color});
  }

  getTaxCode=async(taxcodetext)=>{
      this.setState({taxCode:taxcodetext});
      var csrf = await AsyncStorage.getItem('csrf');
      const sessionid = await AsyncStorage.getItem('sessionid');
      await fetch(SERVER_URL+'/api/POS/productMeta/?code__contains='+JSON.parse(this.state.taxCode),{
        method: 'GET',
        headers: {
          "Cookie" :"csrf="+csrf+";sessionid=" + sessionid+";",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken':csrf,
          'Referer': SERVER_URL
        },
      }).then((response) =>
          response.json()
      ).then((responseJson) => {
          this.setState({ TaxCode: responseJson})
          for(var i=0;i<responseJson.length;i++){
            if(this.state.taxCode==responseJson[i].code){
              this.setState({addcode:false})
            }else{
              this.setState({addcode:true})
            }
          }
      }).catch((error) => {
          return
      });
  }

  keyboardDidShow=(event)=> {
        this.setState({
            keyboardOpen:true,keyboardOffset: event.endCoordinates.height+27,
        })
    }

    keyboardDidHide=()=> {
        this.setState({
            keyboardOpen:false,keyboardOffset: 27,
        })
}

attachShow=async(bool)=>{
  const { status, expires, permissions } = await Permissions.getAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );
      if(permissions.camera.status == 'granted'){
        if(permissions.cameraRoll.status == 'granted'){
          this.setState({attachOpen:bool})
        }else{
          this.getCameraRollAsync()
        }
      }else{
        this.getCameraAsync()
  }
}

getCameraAsync=async(obj)=> {
  const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
  if (status === 'granted') {
    this.attachShow(true)
  } else {
    throw new Error('Camera permission not granted');
 }
}

getCameraRollAsync=async(obj)=> {
  const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  if (status === 'granted') {
    this.attachShow(true)
  } else {
    throw new Error('Gallery permission not granted');
 }
}

modalAttach =async (event) => {
  if(event == 'gallery') return this._pickImage();
  if(event == 'camera') {
    this.handlePhoto()
  }
};

_pickImage = async () => {
    let csrf = await AsyncStorage.getItem('csrf');
    let sessionid = await AsyncStorage.getItem('sessionid');
    let result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Images,
     allowsMultipleSelection: true
   });
    let img = new FormData();
    let filename = result.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    var type = match ? `image/${match[1]}` : `image`;
    const photo = {
      uri: result.uri,
      type: type,
      name:filename,
    };
    var formData = new FormData();
    if(photo.uri ==null||photo.name == null ){
      this.attachShow(false)
      return
    }
    formData.append("attachment",photo);
    fetch(SERVER_URL+'/api/POS/mediasv/', {
       method: 'POST',
       headers: {
         "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
         'Content-Type': 'multipart/form-data;',
         'X-CSRFToken':csrf,
         'Referer': SERVER_URL,
       },
       body:formData,
       }).then((response) =>{
          return response.json()
       }).then((json) => {
         var images =this.state.images;
         images.push(json)
         this.setState({images:images});
     }).catch((error) => {
         return
     });
    this.attachShow(false)
};


  handlePhoto = async () => {
    let csrf = await AsyncStorage.getItem('csrf');
    let sessionid = await AsyncStorage.getItem('sessionid');
    let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});
    if(picture.cancelled == true){
     return
    }
    let img = new FormData();
    let filename = picture.uri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;
    const photo = {
     uri: picture.uri,
     type: type,
     name:filename,
    };
    var formData = new FormData();
    if(photo.uri ==null||photo.name == null ){
      this.attachShow(false)
      return
    }
    formData.append("attachment",photo);
    fetch(SERVER_URL+'/api/POS/mediasv/', {
       method: 'POST',
       headers: {
         "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
         'Content-Type': 'multipart/form-data;',
         'X-CSRFToken':csrf,
         'Referer': SERVER_URL,
       },
       body:formData,
       }).then((response) =>{
          return response.json()
       }).then((json) => {
         var images =this.state.images;
         images.push(json)
         this.setState({images:images});
     }).catch((error) => {
         return
     });
    this.attachShow(false)
  }


    removeImage=(index)=>{
     var imgs = this.state.images
     var item = imgs[index]
     fetch(SERVER_URL+'/api/POS/mediasv/'+item.pk+'/', {
         method: 'DELETE',
         headers: {
           "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
           'Content-Type': 'application/json',
           'X-CSRFToken':this.state.csrf,
          'Referer': SERVER_URL,
         },
       }).then((response) =>{
          if(response.status == '204'||response.status == 204){
            imgs.splice(index,1)
            this.setState({images:imgs})
            return response.json();
           }
       }).then((json) => {

       }).catch((error) => {
     });
  }


  getProductVariant=async()=>{
       var csrf = await AsyncStorage.getItem('csrf');
       const sessionid = await AsyncStorage.getItem('sessionid');
       await fetch(SERVER_URL+'/api/POS/productVariantsv/?parent='+this.state.product.pk,{
           method: 'GET',
           headers: {
             "Cookie" :"csrf="+csrf+";sessionid=" + sessionid+";",
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'X-CSRFToken':csrf,
             'Referer': SERVER_URL
           },
       }).then((response) =>
          response.json()
       ).then((responseJson) => {
           var arr =responseJson;
           arr.unshift({pk:null})
           this.setState({ productVariant: arr})
           if(arr.length>1){
             this.setState({unitType:arr[1].unitType,unitDisable:true})
             if(arr[1].unitType =='Size and Color'||arr[1].unitType =='Color'||arr[1].unitType =='Quantity and Color'){
               this.setState({colorPallet:true})
             }else{
               this.setState({colorPallet:false})
             }
           }
       }).catch((error) => {
           return
       });
 }

  add = ()=>{
    if(this.state.value.length==0){
      return
    }
    var imagesPk = []
    this.state.images.forEach((item)=>{
      if(item.pk!=null){
        imagesPk.push(item.pk)
      }
    })
    var data = {
      customizable:	false,
      gstType	:this.state.gstType,
      images:imagesPk,
      maxQtyOrder:10,
      minQtyOrder:5,
      parent:this.state.product.pk,
      price:this.state.mrp,
      sellingPrice:this.state.sellingPrice,
      unitType:this.state.unitType,
      value:this.state.value,
      taxCode:this.state.taxCode,
      taxRate:this.state.taxRate,
      weight:this.state.weight,
      stock:this.state.inStock,
      minQtyOrder:this.state.minQtyOrder,
      isWarranty: this.state.isWarranty,
    }
    if(this.state.isWarranty){
     data.warrantyProvider = this.state.warrantyProvider
     data.warrantyPeriod = this.state.warrantyDuration
     data.warrantyType = this.state.warrantyType
     data.warrantyLimit = this.state.warrantyLimit
    }
    if(this.state.colorPallet&&data.unitType!='Color'){
      data.value2 = this.state.value2
    }
    if(this.state.colorPallet&&data.unitType=='Color'){
      data.value= this.state.selectedColor
    }
    if(this.state.update!=true){
      var url = SERVER_URL+'/api/POS/productVariantsv/'
      var method = 'POST'
    }else{
      var url = SERVER_URL+'/api/POS/productVariantsv/'+this.state.variantPk.pk+'/'
      var method = 'PATCH'
    }
    fetch(url,{
       method:method,
       headers:{
         "Cookies":"csrf="+this.state.csrf+";sessionid="+this.state.sessionid+";",
         "Accept":'application/json',
         "Content-Type":'application/json',
         "X-CSRFToken":this.state.csrf,
         "Referer":SERVER_URL,
       },
       body:JSON.stringify(data),
     }).then((response)=>{
         if(response.status==200||response.status==201){
           return response.json()
         }
       }).then((jsonResponse)=>{
         if(jsonResponse==undefined){
           return
         }
         this.props.navigation.goBack()
         return
         if(this.state.update==true){
           // this.props.navigation.state.params.update(jsonResponse)
           this.props.navigation.goBack()
           return
         }
         if(this.state.update!=true){
           this.setState({unitType:props.unitTypes[0],value:'',value2:null,mrp:0,sellingPrice:0,images:[{pk:null}],unitDisable:true})
         }
       })
  }





  render() {
    var themeColor = this.state.store.themeColor
    let varientChoicesText = this.state.unitTypes.map( (s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    let gstTypes= this.state.gstTypes.map( (s, i) => {
      return <Picker.Item key={i} value={s.value} label={s.label}  ></Picker.Item>
    });
    let warrantyTypes= warrantyType.map( (s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    let warrantyLimits= warrantyLimit.map( (s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    return (
      <View style={{flex:1}}>
      <ScrollView >
        <View style={{flex:1,paddingBottom:45}}>

        {!this.state.isView&&
          <View>
          <View style={{paddingVertical:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:18,fontWeight:'700'}}>{this.state.product.name}</MonoText>
            <MonoText   style={{fontSize:16,fontWeight:'700',marginTop:20}}>Unit Type</MonoText>
            <View style={{width: "100%",height:40 ,borderWidth:1,marginTop:5,borderColor:'#f2f2f2',paddingVertical:7,backgroundColor:this.state.unitDisable?'#f2f2f2':'#fff' }}>
              <Picker
                selectedValue={this.state.unitType}
                mode="dropdown"
                enabled={!this.state.unitDisable}
                style={{ width: "100%",height:26 ,}}
                itemStyle={{marginVertical:0,paddingVertical:0}}
                onValueChange={(itemValue, itemIndex)=>this.dropDownChanged(itemValue, itemIndex)}>
                {varientChoicesText}
              </Picker>
            </View>
          </View>
          <View style={{paddingBottom:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>{this.state.unitType}</MonoText>
            <View style={{flex:1,flexDirection:'row',marginTop:5,}}>
            {this.state.unitType!='Color'&&
              <TextInput style={{flex:this.state.colorPallet?1.5:1,height:40,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,backgroundColor:'#fff'}}
                  onChangeText={(value)=>this.setState({value:value})}
                  placeholder={this.state.unitType.split(' ')[0]}
                  value={this.state.value}>
              </TextInput>
            }
              <View style={{flex:this.state.colorPallet?0.5:0,alignItems:'center',justifyContent:'flex-start',}}>
                {this.state.colorPallet&&
                  <Ionicons
                       name="md-color-palette"
                       style={{ color: this.state.selectedColor }}
                       onPress={() =>{ this.setState({ visible: true })}}
                       size={width*0.1}
                   />
                }
              </View>
            </View>

            {this.state.visible&&
              <View style={{marginTop:15,backgroundColor:'#f2f2f2'}}>
                <ColorPicker
                     colors={this.state.colors}
                     selectedColor={this.state.selectedColor}
                     onSelect={this.onSelect}
                 />
              </View>
            }
          </View>
          <View style={{paddingBottom:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>MRP</MonoText>
            <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',}}
                onChangeText={(mrp)=>this.setState({mrp:mrp})}
                value={this.state.mrp.toString()} defaultValue={this.state.mrp.toString()} keyboardType={'numeric'}>
            </TextInput>
          </View>
          <View style={{paddingBottom:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>Selling Price</MonoText>
            <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',}}
                onChangeText={(sellingPrice)=>this.setState({sellingPrice:sellingPrice})}
                value={this.state.sellingPrice.toString()} defaultValue={this.state.sellingPrice.toString()} keyboardType={'numeric'}>

            </TextInput>
          </View>
          <View style={{paddingBottom:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>Minimum Order Quantity</MonoText>
            <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',}}
                onChangeText={(minQtyOrder)=>this.setState({minQtyOrder:minQtyOrder})}
                value={this.state.minQtyOrder.toString()}
                keyboardType={'numeric'}>
            </TextInput>
          </View>
          <View style={{paddingBottom:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>Weight In Grams</MonoText>
            <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',}}
                onChangeText={(weight)=>this.setState({weight:weight})}
                value={this.state.weight.toString()}
                keyboardType={'numeric'}>
            </TextInput>
          </View>
          <View style={{paddingBottom:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>In Stock Quantity</MonoText>
            <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',}}
                onChangeText={(inStock)=>this.setState({inStock:inStock})}
                value={this.state.inStock.toString()}
                keyboardType={'numeric'}>
            </TextInput>
          </View>

          <View style={{paddingTop:15,flexDirection:'row',paddingHorizontal:15,}}>
            <View style={{flex:1,marginRight:5}}>
               <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                 <CheckBox
                   checked={this.state.isWarranty  ? true:false}
                   onPress={() =>{this.setState({initialLoad:false,isWarranty: !this.state.isWarranty });}}
                   checkedColor={themeColor}
                   containerStyle={{backgroundColor:'transparent',borderWidth:0,marginTop:-6,marginLeft:-6}}
                   />
                   <MonoText   style={{  color: '#000', fontSize: 15,fontWeight: '700',marginLeft:-10,marginTop:6 }}>Warranty Applicable</MonoText>
               </View>
            </View>
          </View>
          {this.state.isWarranty&&
          <View style={{paddingVertical:10,paddingHorizontal:15,}}>
            <View style={{flex:1,}}>
              <View style={{}}>
                <View style={{flexDirection:'row'}}>
                  <MonoText   style={{fontSize:16,fontWeight:'700'}}>Warranty Duration</MonoText>
                  <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                </View>
                <View style={{flexDirection:'row'}}>
                  <View style={{flex:0.6}}>
                    <TextInput style={{height:40,paddingHorizontal:10,marginTop:5,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000'}}
                        onChangeText={(duration)=>{this.setState({warrantyDuration:duration});}}
                        value={this.state.warrantyDuration.toString()} keyboardType={'numeric'}>
                    </TextInput>
                  </View>
                  <View style={{flex:0.4,alignItems:'center',justifyContent:'center',borderTopWidth:1,borderBottomWidth:1,borderRightWidth:1,borderColor:'#f2f2f2',height:40,marginTop:5}}>
                    <Picker
                      selectedValue={this.state.warrantyLimit}
                      mode="dropdown"
                      style={{ width: "100%",height:40 ,}}
                      itemStyle={{marginVertical:0,paddingVertical:0}}
                      onValueChange={(itemValue, itemIndex)=>this.setState({warrantyLimit:itemValue})}>
                      {warrantyLimits}
                  </Picker>
                  </View>
                </View>
              </View>

                <View style={{marginTop:15}}>
                <View style={{flexDirection:'row'}}>
                  <MonoText   style={{fontSize:16,fontWeight:'700'}}>Warranty Provider</MonoText>
                  <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                </View>
                <View style={{flexDirection:'row',marginTop:5}}>
                  <View style={{flex:1,flexDirection:'row'}}>
                    <RadioButton
                      value={warrantyProvider[0]}
                      color={themeColor}
                      status={this.state.warrantyProvider === warrantyProvider[0] ? 'checked' : 'unchecked'}
                      onPress={() => { this.setState({ warrantyProvider: warrantyProvider[0] }); }}
                    />
                    <MonoText   style={{  color: '#000', fontSize: 15,fontWeight: '700',marginTop:6}}>{warrantyProvider[0]}</MonoText>
                  </View>
                  <View style={{flex:1,flexDirection:'row'}}>
                    <RadioButton
                      value={warrantyProvider[1]}
                      color={themeColor}
                      status={this.state.warrantyProvider === warrantyProvider[1] ? 'checked' : 'unchecked'}
                      onPress={() => { this.setState({ warrantyProvider: warrantyProvider[1] }); }}
                    />
                    <MonoText   style={{  color: '#000', fontSize: 15,fontWeight: '700',marginTop:6}}>{warrantyProvider[1]}</MonoText>
                  </View>
                </View>
              </View>

              <View style={{paddingTop:15,}}>
                <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Warranty Type</MonoText>
                 <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                <View style={{width: "100%",height:40 ,borderWidth:1,borderColor: '#f2f2f2',paddingVertical:7,marginTop:5}}>
                  <Picker
                    selectedValue={this.state.warrantyType}
                    mode="dropdown"
                    style={{ width: "100%",height:26 ,}}
                    itemStyle={{marginVertical:0,paddingVertical:0}}
                    onValueChange={(itemValue, itemIndex)=>this.setState({warrantyType:itemValue})}>
                    {warrantyTypes}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
        }
          <View style={{paddingBottom:15,paddingHorizontal:15,}}>
            <MonoText   style={{fontSize:16,fontWeight:'700'}}>Images</MonoText>
            <View style={{flex:1,}}>
              <FlatList style={{margin:0,backgroundColor:'#fff',marginBottom: 10 , borderRadius:10}}
              data={this.state.images}
              showsVerticalScrollIndicator={false}
              numColumns={5}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item,index) => {
                return index.toString();
              }}
              nestedScrollEnabled={true}
              renderItem={({item, index}) => (
                <View style={{height:'100%'}}>
                {item.pk!=null&&
                  <TouchableOpacity style={{borderRadius:10,}} onPress={()=>this.removeImage(index)}>
                    <Image
                    source={{uri:item.attachment}}
                    style={{ width: width*0.154, height:width*0.154, borderRadius: 10,marginLeft:index%5==0?0:width*0.03,marginTop:width*0.02 }}
                    />
                    <View style={{position: 'absolute',top:0,right:-10,width:20,height:20,backgroundColor: '#fa4616',alignItems: 'center',justifyContent: 'center',borderRadius:10}}>
                      <FontAwesome  name="close" size={15} color="#fff" />
                    </View>
                  </TouchableOpacity>
                }
                {item.pk==null&&
                <TouchableOpacity style={{borderRadius:10,}} onPress={()=>{this.attachShow(true)}}>
                  <View style={{ width: width*0.154, height:width*0.154, borderRadius: 10,marginLeft:index%5==0?0:width*0.03,marginTop:width*0.02,backgroundColor: '#f2f2f2',alignItems: 'center',justifyContent: 'center',borderRadius:10}}>
                    <FontAwesome  name="plus" size={15} color="#000" />
                  </View>
                </TouchableOpacity>
              }
               </View>
              )}
              />
            </View>
           </View>



          </View>
        }

          {this.state.isView&&
          <View style={{}}>
            <MonoText   style={{marginLeft:15,fontSize:18,fontWeight:'700',marginTop:20}}>Product Variants</MonoText>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
              <View style={{flexDirection:'row',paddingLeft:15,}}>
                <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginTop: 5, paddingLeft: 0,marginBottom:10,paddingBottom:0,}}
                data={this.state.productVariant}
                keyExtractor={(item,index) => {
                  return index.toString();
                }}
                extraData={this.state}
                horizontal={true}
                nestedScrollEnabled={true}
                renderItem={({item, index}) => (
                  <View style={{paddingVertical:15,}}>
                  {item.pk!=null&&
                    <Card containerStyle={[styles.shadow, {borderWidth: 0, borderColor: '#fff', borderRadius: 15,width:width*0.6,height:width*0.6,margin:0,padding: 0,marginRight:15,marginLeft:5}]}>
                    <View style={{height:'100%'}}>
                      <View style={{flex:1,paddingVertical:10,paddingHorizontal:10,paddingBottom:10}}>
                        <View style={{justifyContent:'center',alignItems:'center'}}>
                          <MonoText   style={{fontSize:18,color:'#000',textAlign:'center'}} numberOfLines={2}>{item.displayName}</MonoText>
                          {item.images.length>0&&
                            <View style={{height:width*0.32,paddingVertical:width*0.02}}>
                              <Image source={{uri:SERVER_URL+item.images[0].attachment}} style={{width:width*0.25,height:width*0.25}} />
                            </View>
                          }

                        </View>
                        <MonoText   style={{fontSize:16,color:'grey',marginLeft:15}}>MRP : {item.price}</MonoText>
                        <MonoText   style={{fontSize:16,color:'grey',marginLeft:15,}}>Selling Price : {item.sellingPrice}</MonoText>
                      </View>
                    </View>
                  </Card>
                  }
                  {item.pk==null&&
                    <Card containerStyle={[styles.shadow, {borderWidth: 0, borderColor: '#fff', borderRadius: 15,width:width*0.6,height:width*0.6,margin:0,padding: 0,marginRight:15,marginLeft:5}]}>
                      <TouchableOpacity onPress={()=>{this.setState({isView:false})}} style={{height:'100%'}}>
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                          <FontAwesome  name="plus" size={50} color="#000" />
                        </View>
                      </TouchableOpacity>
                    </Card>
                  }
                  </View>
                )}
                />
              </View>
            </ScrollView>
          </View>
        }
        </View>
      </ScrollView>

      {!this.state.isView&&
        <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:themeColor,height:40}}>
          <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center'}} onPress={()=>{this.add()}}>
            <MonoText   style={{fontSize:18,fontWeight:'700',color:'#fff'}}>{this.state.update?'Update':'Add + '} </MonoText>
          </TouchableOpacity>
        </View>
      }

      <ModalBox
        style={{height:150}}
        position={'bottom'}
        ref={'attachModal'}
        isOpen={this.state.attachOpen}
        onClosed={()=>{this.setState({attachOpen:false})}}>
          <View style={{flex:1,flexDirection: 'row'}}>
            <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('gallery')}}>
              <View style={{height:60,width:60,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 30}} >
                <FontAwesome  name="photo" size={35} color="#fff" />
              </View>
              <MonoText   style={{fontSize: 18,color:themeColor,fontWeight: '600',}}>Gallery</MonoText>
            </TouchableOpacity>
            <TouchableOpacity style={{flex:1,alignItems: 'center',justifyContent: 'center'}} onPress={()=>{this.modalAttach('camera')}}>
              <View style={{height:60,width:60,backgroundColor: themeColor,alignItems: 'center',justifyContent: 'center',borderRadius: 30}} >
                <FontAwesome  name="camera" size={25} color="#fff" />
              </View>
              <MonoText   style={{fontSize: 18,color:themeColor,fontWeight: '600',}}>Camera</MonoText>
            </TouchableOpacity>
          </View>
        </ModalBox>

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
   shadowOpacity: 0,
   shadowRadius: 3.84,
   elevation: 5,
},

});

const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    unitTypes:state.cartItems.unitTypes
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


  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductVariantDetails);
