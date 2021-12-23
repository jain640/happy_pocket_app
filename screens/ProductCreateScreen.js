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
  Dimensions, Alert,StatusBar,FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,TouchableWithoutFeedback,NativeModules,LayoutAnimation,Keyboard,Picker
} from 'react-native';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { FontAwesome,Entypo,MaterialIcons,MaterialCommunityIcons ,Ionicons} from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import * as  ImagePicker  from 'expo-image-picker';
import {ColorPicker, StatusColorPicker } from 'react-native-status-color-picker';
import * as FileSystem from 'expo-file-system';
import ModalBox from 'react-native-modalbox';
import { Card ,SearchBar , Icon,CheckBox} from 'react-native-elements';
import { Switch } from 'react-native-paper';
import Loader from '../components/Loader'
const Entities = require('html-entities').XmlEntities;
import { MonoText } from '../components/StyledText';
import { RadioButton } from 'react-native-paper';
const entities = new Entities();

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

const { width } = Dimensions.get('window');
const height = width * 0.8

const SERVER_URL = settings.url



const colors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
         "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
         "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800",
         "#FF5722", "#795548", "#9E9E9E", "#607D8B","#000000","#FFFFFF","#EFA834","#1a396f"]

const gstTypes =  [{label: 'Gst Included',value:'gst_included'}, {label: 'Gst Extra',value:'gst_extra'},
                 {label: 'Gst not Applicable',value:'gst_not_applicable'}, ]

const warrantyProvider =  ['Manufacturer','Seller']

const warrantyType =  ['Manufacturing Defect','Not Physical damaged','Replacement','Repair']

const warrantyLimit =  ['Years','Months','Days']

class ProductCreateScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      headerLeft: (
        <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{ flex: 1, justifyContent: 'center', alignItems: 'center',marginLeft:15,height:'100%' }}>
         <MaterialIcons name="arrow-back" size={30} color='#fff'  />
        </TouchableOpacity>
     ),
     headerRight: (<View>
       {params.created&&
       <TouchableOpacity onPress={()=>{params.addVariant()}} style={{ flex: 1, justifyContent: 'center', alignItems: 'center',marginRight:15,height:'100%' }}>
        <MonoText   style={{color:'#fff',fontSize:16}}>Add Variant</MonoText>
       </TouchableOpacity>}</View>
    ),

      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Constants.statusBarHeight
      },
      headerTitleStyle: {
        flex:1,
        alignSelf:'center',
        textAlign:'center',
      },
      title: params.created?'Product':'Add Product',
      headerTintColor: '#fff',
    }
  };


  constructor(props) {
    super(props);
    var params = props.navigation.state.params

    this.state = {
      store:props.store,
      myStore:props.myStore,
      parent:params.category,
      subCategory:params.subcategory,
      selected:params.selected,
      level:params.level,
      name:'',
      colorPallet:false,
      description:'',
      mrp:'',
      sellingPrice:'',
      keyboardOffset:0,
      keyboardOpen:false,
      images:[{pk:null}],
      unitTypes:this.props.unitTypes,
      unitType:this.props.unitTypes[0],
      gstType:gstTypes[0].value,
      gstTypes:gstTypes,
      hsnShow:true,
      value:'',
      value2:null,
      visible: false,
      selectedColor: '#1a396f',
      taxCode:'',
      taxRate:'',
      colors:colors,
      variants:[],
      created:false,
      brandName:'',
      weight:'',
      minQtyOrder:'',
      inStock:'',
      loadingVisible:false,
      navigateList:false,
      iscod:false,
      codAdvance:0,
      loader:false,
      isWarranty:false,
      warrantyDuration:0,
      warrantyProvider:warrantyProvider[0],
      warrantyType:warrantyType[0],
      screenHeight:0,
      initialLoad:true,
      warrantyLimit:warrantyLimit[0]

    }

    willFocus = props.navigation.addListener(
     'didFocus',
       payload => {
         this.getProductVariant()
         }
    );
    Keyboard.addListener(
    'keyboardDidHide',
    this.keyboardDidHide
   )
   Keyboard.addListener(
      'keyboardDidShow', this.keyboardDidShow
   )
  }



  getProductVariant=async(bool)=>{
       var check =  bool!=undefined?bool:this.state.created
       if(check){
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
         responseJson.forEach((i)=>{
           i.selectedImage = 0
         })
         var list = this.state.product
         list.variant = responseJson
         this.setState({ variants: responseJson,product:list})
       }).catch((error) => {
         return
       });

       }

 }

 previous=(idx,variantIdx)=>{
   var variant = this.state.variants
   var item = variant[variantIdx]
   if(idx!=0){
     item.selectedImage = idx-1
     this.setState({variant:variant})
   }
 }
 next =(idx,variantIdx)=>{
   var variant = this.state.variants
   var item = variant[variantIdx]
   item.selectedImage = idx+1
   this.setState({variant:variant})
 }




  componentDidMount(){
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
      created:this.state.created,
      addVariant:(()=>this.goToVariant()),
    });
    // this.setUnitTypeArray();
  }

  goToVariant=()=>{
    this.props.navigation.navigate('ProductVariantDetails',{product:this.state.product,variant:null,gstType:this.state.gstType,taxCode:this.state.taxCode,taxRate:this.state.taxRate})
  }

  dropDownChanged = (itemValue, itemIndex) => {
    this.setState({ unitType:itemValue,value:'',value2:null,})
    if(itemValue =='Size and Color'||itemValue =='Quantity and Color'||itemValue =='Color'){
      this.setState({colorPallet:true})
      if(itemValue =='Color'){
        this.setState({value:this.state.selectedColor})
      }else{
        this.setState({value2:this.state.selectedColor})
      }
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

   showMessage=(msg)=>{
     this.refs.toast.show(msg)
   }

   createProduct=async()=>{

     var sessionid =  await AsyncStorage.getItem('sessionid');
     var csrf = await AsyncStorage.getItem('csrf');
     if(!this.state.created){
     if(this.state.name.length<1){
       this.showMessage('Please fill Product Name')
       return
     }
     if(this.state.colorPallet&&this.state.value.length<1){
       var msg = 'Please fill '+this.state.unitType
       this.showMessage(msg)
       return
     }
     if(this.state.colorPallet&&this.state.unitType!='Color'&&this.state.value2==null){
       var msg = 'Please fill '+this.state.unitType
       this.showMessage(msg)
       return
     }
     if(this.state.gstType!='gst_not_applicable'&&this.state.taxCode.length<1){
       this.showMessage('Please fill Tax Code')
       return
     }
     if(this.state.minQtyOrder.length<1){
       this.showMessage('Please fill Min Qty Order')
       return
     }
     if(this.state.inStock.length<1){
       this.showMessage('Please fill Stock Value')
       return
     }
     if(this.state.weight.length<1){
       this.showMessage('Please fill weight')
       return
     }
     if(this.state.mrp.length<1){
       this.showMessage('Please fill MRP')
       return
     }
     if(this.state.sellingPrice.length<1){
       this.showMessage('Please fill SellingPrice')
       return
     }
     if(this.state.isWarranty){
       if(Number(this.state.warrantyDuration)==0){
         this.showMessage('Please fill Warranty Duration')
         return
       }
     }
     var imagesPk = []
     this.state.images.forEach((item)=>{
       if(item.pk!=null){
         imagesPk.push(item.pk)
       }
     })

     var data ={
       name:this.state.name,
       description:this.state.description,
       taxCode:this.state.taxCode,
       taxRate:this.state.taxRate,
       gstType:this.state.gstType,
       images:imagesPk,
       unitType:this.state.unitType,
       value:this.state.value,
       category:this.state.selected.pk,
       price:this.state.mrp,
       sellingPrice:this.state.sellingPrice,
       store:this.state.myStore.pk,
       weight:this.state.weight,
       minQtyOrder:this.state.minQtyOrder,
       stock:this.state.inStock,
       iscod: this.state.iscod,
       codAdvance: this.state.codAdvance,
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
     }else if(this.state.colorPallet&&data.unitType=='Color'){
       data.value = this.state.value
     }


     if(!this.state.colorPallet){
       data.value = 1
     }

     if(this.state.taxCode.length==0){
       data.taxCode = 0;
     }else{
       data.taxCode = this.state.taxCode;
     }
     if(this.state.taxRate.length==0){
       data.taxRate = 0;
     }else{
       data.taxRate = this.state.taxRate;
     }
     if(this.state.brandName.length>0){
       data.brand = this.state.brandName
     }
     console.log(data,'jjjjjsdssssssssss');
     this.setState({loader:true})
     fetch(SERVER_URL +'/api/POS/createFirstProduct/' , {
         method: 'POST',
         headers:{
           "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
           'Content-Type': 'application/json',
           'X-CSRFToken':csrf,
           'Referer': SERVER_URL,
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
           this.setState({loader:false})
            if(responseJson==undefined){
              return
            }
            responseJson.variant.forEach((i)=>{
              i.selectedImage = 0
            })
            this.setState({product:responseJson,created:true,navigateList:true})
            this.props.navigation.setParams({
              created:this.state.created,
            })
            this.getProductVariant(true)
             // this.props.navigation.navigate('ProductVariantDetails',{product:responseJson,variant:responseJson.variant[0],gstType:responseJson.gstType,taxCode:responseJson.taxCode,taxRate:responseJson.taxRate})
         }).catch((err)=>{
           this.setState({loader:false})
         })
       }else{
         if(this.state.name.length<1){
           this.showMessage('Please fill Product Name')
           return
         }

         // if(this.state.taxCode.length<1){
         //   return
         // }
         // if(this.state.taxRate.length<1){
         //   return
         // }

         var data = {
           name:this.state.name,
           description:this.state.description,
           gstType:this.state.gstType,
           taxCode:this.state.taxCode,
           taxRate:this.state.taxRate,
           category:this.state.selected.pk,
         }
         if(data.gstType == 'gst_not_applicable'){
           data.taxRate = 0
           data.taxCode = 0
         }
         this.setState({loader:true})
         fetch(SERVER_URL +'/api/POS/productsv/'+this.state.product.pk+'/',{
            method:'PATCH',
            headers:{
              "Cookies":"csrftoken="+csrf+";sessionid="+sessionid+";",
              "Accept":'application/json',
              "Content-Type":'application/json',
              "X-CSRFToken":csrf,
              "Referer":SERVER_URL,
            },
            body:JSON.stringify(data),
          }).then((response)=>{
            this.setState({loader:false})
              if(response.status==200||response.status==201){
                return response.json()
              }
            }).then((jsonResponse)=>{
              if(jsonResponse==undefined){
                return
              }
              this.setState({product:jsonResponse,})
            }).catch((err)=>{
              this.setState({loader:false})
            })
       }
   }

   variantEdit=(idx)=>{
     this.props.navigation.navigate('ProductVariantDetails',{product:this.state.product,variant:this.state.variants[idx],gstType:this.state.product.gstType,taxCode:this.state.product.taxCode,taxRate:this.state.product.taxRate})
   }
   changeStatus=async(item,index)=>{
     var list = this.state.product
     var variants = this.state.variants
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
         list.variant[index].enabled = json.enabled
         variants[index].enabled = json.enabled
         this.setState({product:list,variants:variants})

       }).catch((error) => {
           Alert.alert('Something went wrong in Server side');
     });
   }

 contentSizeChange=(width,height)=>{
   if(!this.state.initialLoad){
     this.setState({screenHeight:height})
     this.scrollView.scrollToEnd({ animated: true })
   }
 }


  render() {
    var {loadingVisible} = this.state
    var themeColor = this.props.store.themeColor
    let varientChoicesText = this.state.unitTypes.map( (s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    let gstTypess= this.state.gstTypes.map( (s, i) => {
      return <Picker.Item key={i} value={s.value} label={s.label}  ></Picker.Item>
    });
    let warrantyTypes= warrantyType.map( (s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    let warrantyLimits= warrantyLimit.map( (s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    var y = height
    return (
        <View style={{flex:1,}}>
          <Loader
          modalVisible = {this.state.loader}
          animationType="fade"
          />
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>

          <View style={{padding:15,borderBottomWidth:1,borderColor:'#f2f2f2',}}>
           {this.state.level==3&&
            <MonoText   style={{fontSize:16,color:'#000'}}>{entities.decode(this.state.parent.name)} - {entities.decode(this.state.subCategory.name)} -
            <MonoText   style={{fontSize:16,color:themeColor}}>{entities.decode(this.state.selected.name)}</MonoText>
            </MonoText>
           }
           {this.state.level==2&&
               <MonoText   style={{fontSize:16,color:'#000'}}>{entities.decode(this.state.parent.name)} -
               <MonoText   style={{fontSize:16,color:themeColor}}>{entities.decode(this.state.selected.name)}</MonoText>
               </MonoText>
           }
           {this.state.level==1&&
               <MonoText   style={{fontSize:16,color:themeColor}}>{entities.decode(this.state.selected.name)}</MonoText>
           }
          </View>
          <ScrollView contentContainerStyle={{paddingBottom:50,paddingHorizontal:15}} ref={ref => {this.scrollView = ref}} onContentSizeChange={this.contentSizeChange} >
           <View onLayout={(e)=> {y = e.nativeEvent.layout.y;}}>
            <View style={{paddingTop:15}}>
               <View style={{flexDirection:'row'}}>
               <MonoText   style={{fontSize:16,fontWeight:'700'}}>Name</MonoText>
                <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
              <TextInput style={{marginTop:5,paddingHorizontal:10,height:40,borderWidth:1,borderColor:'#f2f2f2',fontSize:16}}
                  onChangeText={(name)=>this.setState({name:name})}
                  placeholder={'Enter Name'}
                  value={this.state.name}>
              </TextInput>
            </View>

            <View style={{paddingTop:15}}>
              <MonoText   style={{fontSize:16,fontWeight:'700'}}>Description</MonoText>
              <TextInput style={{marginTop:5,height:80,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:16,textAlignVertical:'top'}}
                  onChangeText={(description)=>this.setState({description:description})}
                  placeholder={'Description'}
                  multiline={true}
                  numberOfLines={3}
                  value={this.state.description}>
              </TextInput>
            </View>


            {!this.state.created&&
            <View style={{paddingTop:15,}}>
              <MonoText   style={{fontSize:16,fontWeight:'700'}}>Upload Images</MonoText>
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
           }
            {!this.state.created&&
             <View style={{paddingTop:15}}>
                <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Brand</MonoText>
                 <MonoText   style={{color:'grey',fontWeight:'700',marginTop:2,marginLeft:2}}>(Optional)</MonoText>
                  </View>
               <TextInput style={{marginTop:5,paddingHorizontal:10,height:40,borderWidth:1,borderColor:'#f2f2f2',fontSize:16}}
                   onChangeText={(brand)=>this.setState({brandName:brand})}
                   placeholder={'Brand name'}
                   value={this.state.brandName}>
               </TextInput>
             </View>
           }



            {!this.state.created&&
             <View style={{paddingTop:15,}}>
               <View style={{flexDirection:'row'}}>
               <MonoText   style={{fontSize:16,fontWeight:'700'}}>Unit Type</MonoText>
               <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
               </View>
               <View style={{width: "100%",height:40,marginTop:5 ,borderWidth:1,borderColor:'#f2f2f2',paddingVertical:7,backgroundColor:this.state.unitDisable?'#f2f2f2':'#fff' }}>
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
           }

             {!this.state.created&&this.state.colorPallet&&
             <View style={{paddingTop:15,}}>
               <View style={{flexDirection:'row'}}>
               <MonoText   style={{fontSize:16,fontWeight:'700'}}>{this.state.unitType}</MonoText>
               <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                </View>
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
                          onPress={() =>{this.setState({ visible: true })}}
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
            }
            {!this.state.created&&
             <View style={{paddingTop:15}}>
                <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Minimum Order Quantity</MonoText>
                <MonoText   style={{fontSize:16,fontWeight:'700',marginLeft:2}}>(MOQ)</MonoText>
                 <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                  </View>
               <TextInput style={{marginTop:5,paddingHorizontal:10,height:40,borderWidth:1,borderColor:'#f2f2f2',fontSize:16}}
                   onChangeText={(qty)=>this.setState({minQtyOrder:qty})}
                   value={this.state.minQtyOrder}
                   keyboardType={'numeric'}>
               </TextInput>
             </View>
           }
            {!this.state.created&&
             <View style={{paddingTop:15}}>
                <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>In Stock Quantity</MonoText>
                <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
               <TextInput style={{marginTop:5,paddingHorizontal:10,height:40,borderWidth:1,borderColor:'#f2f2f2',fontSize:16}}
                   onChangeText={(inStock)=>this.setState({inStock:inStock})}
                   value={this.state.inStock}
                   keyboardType={'numeric'}>
               </TextInput>
             </View>
           }
            {!this.state.created&&
             <View style={{paddingTop:15}}>
                <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Weight In Grams</MonoText>
                <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                </View>
               <TextInput style={{marginTop:5,paddingHorizontal:10,height:40,borderWidth:1,borderColor:'#f2f2f2',fontSize:16}}
                   onChangeText={(weight)=>this.setState({weight:weight})}
                   placeholder={'Product weight in grams'}
                   value={this.state.weight}
                   keyboardType={'numeric'}>
               </TextInput>
             </View>
           }

              <View style={{paddingTop:15,}}>
                <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>GST Type</MonoText>
                 <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                 </View>
                <View style={{width: "100%",height:40 ,borderWidth:1,borderColor: '#f2f2f2',paddingVertical:7,marginTop:5}}>
                  <Picker
                    selectedValue={this.state.gstType}
                    mode="dropdown"
                    style={{ width: "100%",height:26 ,}}
                    itemStyle={{marginVertical:0,paddingVertical:0}}
                    onValueChange={(itemValue, itemIndex)=>this.gstChanged(itemValue, itemIndex)}>
                    {gstTypess}
                  </Picker>
                </View>
              </View>

              {this.state.hsnShow&&
                <View style={{paddingTop:15,flexDirection:'row'}}>
                  <View style={{flex:1,marginRight:5}}>
                    <View style={{flexDirection:'row'}}>
                    <MonoText   style={{fontSize:16,fontWeight:'700'}}>Tax Code</MonoText>
                    <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                     </View>
                    <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000'}}
                        onChangeText={(taxCode)=>{this.setState({taxCode:taxCode});}}
                        value={this.state.taxCode.toString()}  keyboardType={'numeric'}>
                    </TextInput>
                  </View>
                  <View style={{flex:1,marginLeft:5}}>
                    <View style={{flexDirection:'row'}}>
                    <MonoText   style={{fontSize:16,fontWeight:'700'}}>Tax Rate</MonoText>
                     <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                      </View>
                    <View style={{flexDirection:'row'}}>
                      <View style={{flex:0.2,alignItems:'center',justifyContent:'center',borderTopWidth:1,borderBottomWidth:1,borderLeftWidth:1,borderColor:'#f2f2f2',height:40,marginTop:5}}>
                        <MonoText   style={{fontSize:18,color:'#000'}}>%</MonoText>
                      </View>
                      <View style={{flex:0.8}}>
                        <TextInput style={{height:40,paddingHorizontal:10,marginTop:5,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000'}}
                            onChangeText={(taxRate)=>{this.setState({taxRate:taxRate});}}
                            value={this.state.taxRate.toString()} keyboardType={'numeric'}>
                        </TextInput>
                      </View>
                    </View>
                  </View>
                </View>
              }
              {!this.state.created&&
              <View style={{paddingTop:15,}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>MRP</MonoText>
                <View style={{flexDirection:'row'}}>
                  <View style={{flex:0.1,alignItems:'center',justifyContent:'center',borderTopWidth:1,borderBottomWidth:1,borderLeftWidth:1,borderColor:'#f2f2f2',height:40,marginTop:5}}>
                    <MonoText   style={{fontSize:18,color:'#000'}}>&#8377;</MonoText>
                  </View>
                  <View style={{flex:0.9}}>
                    <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',}}
                        onChangeText={(mrp)=>this.setState({mrp:mrp})}
                        value={this.state.mrp.toString()} defaultValue={this.state.mrp.toString()} keyboardType={'numeric'}>
                    </TextInput>
                  </View>
                </View>
              </View>
            }
            {!this.state.created&&
              <View style={{paddingTop:15,}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>Selling Price</MonoText>
                <View style={{flexDirection:'row'}}>
                  <View style={{flex:0.1,alignItems:'center',justifyContent:'center',borderTopWidth:1,borderBottomWidth:1,borderLeftWidth:1,borderColor:'#f2f2f2',height:40,marginTop:5}}>
                    <MonoText   style={{fontSize:18,color:'#000'}}>&#8377;</MonoText>
                  </View>
                  <View style={{flex:0.9}}>
                    <TextInput style={{height:40,marginTop:5,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000',}}
                        onChangeText={(sellingPrice)=>this.setState({sellingPrice:sellingPrice})}
                        value={this.state.sellingPrice.toString()} defaultValue={this.state.sellingPrice.toString()} keyboardType={'numeric'}>
                    </TextInput>
                  </View>
                </View>
              </View>
            }
            <View style={{paddingTop:15,flexDirection:'row'}}>
                  <View style={{flex:1,marginRight:5}}>
                    <View style={{flexDirection:'row'}}>
                      <MonoText   style={{fontSize:16,fontWeight:'700'}}></MonoText>
                     </View>
                     <View style={{flex:1,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                       <MonoText   style={{  color: '#000', fontSize: 15,fontWeight: '700',marginLeft:0,marginTop:0 }}>COD</MonoText>
                       <CheckBox
                               checked={this.state.iscod  ? true:false}
                               onPress={() => this.setState({ iscod: !this.state.iscod })}
                               checkedColor={themeColor}
                               containerStyle={{backgroundColor:'transparent',borderWidth:0,marginTop:-12}}
                               />

                     </View>
                  </View>

            </View>
            <View style={{paddingTop:15,flexDirection:'row'}}>
            <View style={{flex:1,}}>
              <View style={{flexDirection:'row'}}>
              <MonoText   style={{fontSize:16,fontWeight:'700'}}>COD Advance</MonoText>
               <MonoText   style={{color:'grey',fontWeight:'700',marginTop:2,marginLeft:2}}>(Optional)</MonoText>
              </View>
              <View style={{flexDirection:'row'}}>
                <View style={{flex:0.2,alignItems:'center',justifyContent:'center',borderTopWidth:1,borderBottomWidth:1,borderLeftWidth:1,borderColor:'#f2f2f2',height:40,marginTop:5}}>
                  <MonoText   style={{fontSize:18,color:'#000'}}>&#8377;</MonoText>
                </View>
                <View style={{flex:0.8}}>
                  <TextInput style={{height:40,paddingHorizontal:10,marginTop:5,borderWidth:1,borderColor:'#f2f2f2',fontSize:18,color:'#000'}}
                      onChangeText={(codAdvance)=>{this.setState({codAdvance:codAdvance});}}
                      value={this.state.codAdvance.toString()} keyboardType={'numeric'}>
                  </TextInput>
                </View>
              </View>
            </View>
            </View>
            {!this.state.created&&
            <View style={{paddingTop:15,flexDirection:'row'}}>
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
          }
            {!this.state.created&&this.state.isWarranty&&
            <View style={{paddingVertical:10,}}>
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


              {this.state.variants.length>0&&
              <View style={{paddingVertical:20}}>
                 <MonoText   style={{fontSize:18,color:themeColor,fontWeight:'700',paddingHorizontal:15}}>Variants</MonoText>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
                <View style={{flexDirection:'row',paddingLeft:15,}}>
                  <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginTop: 5, paddingLeft: 0,marginBottom:10,paddingBottom:0,}}
                  data={this.state.variants}
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
                      <TouchableOpacity activeOpacity={1} onPress={()=>{this.variantEdit(index)}} style={{height:'100%'}}>
                        <View style={{flex:1,paddingVertical:10,paddingHorizontal:10,paddingBottom:10}}>
                          <View style={{justifyContent:'center',alignItems:'center'}}>
                            <MonoText   style={{fontSize:18,color:'#000',textAlign:'center'}} numberOfLines={2}>{item.displayName}</MonoText>
                            {item.images.length>0&&
                              <View style={{height:width*0.32,paddingVertical:width*0.02,flexDirection:'row',alialignItems:'center',justifyContent:'center'}}>
                                {item.selectedImage!=0&&
                                <View style={{flex:1,alignItems:'flex-start',justifyContent:'center'}}>
                                  <TouchableOpacity onPress={()=>this.previous(item.selectedImage,index)} style={[{width:50,height:50,alignItems: 'center',justifyContent: 'center',borderRadius: 25}]}>
                                    <MonoText><FontAwesome name="chevron-left" size={18} color={themeColor} /></MonoText>
                                  </TouchableOpacity>
                                </View>
                               }
                                {item.selectedImage==0&&
                                  <View style={{flex:1,alignItems: 'flex-end',justifyContent:'center'}}>
                                  <View  onPress={()=>this.next(item.selectedImage,index)} style={[{width:50,height:50,alignItems: 'center',justifyContent: 'center',borderRadius: 25}]}>
                                  </View>
                                  </View>
                                }
                                <Image source={{uri:SERVER_URL+item.images[item.selectedImage].attachment}} style={{width:width*0.25,height:width*0.25}} />
                                {item.images.length-1!=item.selectedImage&&
                                  <View style={{flex:1,alignItems: 'flex-end',justifyContent:'center'}}>
                                  <TouchableOpacity  onPress={()=>this.next(item.selectedImage,index)} style={[{width:50,height:50,alignItems: 'center',justifyContent: 'center',borderRadius: 25}]}>
                                    <MonoText><FontAwesome name="chevron-right" size={18} color={themeColor} /></MonoText>
                                  </TouchableOpacity>
                                  </View>
                                }
                                {item.images.length-1==item.selectedImage&&
                                  <View style={{flex:1,alignItems: 'flex-end',justifyContent:'center'}}>
                                  <View  onPress={()=>this.next(item.selectedImage,index)} style={[{width:50,height:50,alignItems: 'center',justifyContent: 'center',borderRadius: 25}]}>
                                  </View>
                                  </View>
                                }
                              </View>
                            }
                            {item.images.length==0&&
                              <View style={{height:width*0.32,paddingVertical:width*0.02}}>
                                <Image source={require('../assets/images/noImage.jpeg')} style={{width:width*0.25,height:width*0.25}} />
                              </View>
                            }

                          </View>
                          <MonoText   style={{fontSize:16,color:'grey',marginLeft:15}}>MRP : {item.price}</MonoText>
                          <MonoText   style={{fontSize:16,color:'grey',marginLeft:15,}}>Selling Price : {item.sellingPrice}</MonoText>
                          <View style={{flex:1,alignItems:'flex-end',justifyContent:'flex-end',marginRight:15,marginBottom:10}}>
                            <Switch
                             onValueChange={()=>{this.changeStatus(item,index)}}
                             value={item.enabled}
                             color={themeColor}
                             />
                           </View>
                        </View>
                      </TouchableOpacity>
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

          {!this.state.keyboardOpen&&<View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#fff',height:40}}>
           <View style={{flex:1,flexDirection:'row'}}>
            <TouchableOpacity style={{flex:1,alignItems:'center',backgroundColor:this.state.navigateList?'#fff':themeColor,justifyContent:'center',borderTopWidth:1,borderColor:themeColor}} onPress={()=>{this.createProduct()}}>
              <MonoText   style={{fontSize:18,fontWeight:'700',color:this.state.navigateList?'#000':'#fff'}}>{this.state.created?'Update':'Next'}  </MonoText>
            </TouchableOpacity>
            {this.state.navigateList&&
            <TouchableOpacity style={{flex:1,alignItems:'center',backgroundColor:themeColor,justifyContent:'center',borderTopWidth:1,borderColor:themeColor}} onPress={()=>{this.props.navigation.navigate('ProductList')}}>
              <MonoText   style={{fontSize:18,fontWeight:'700',color:'#fff'}}>Products</MonoText>
            </TouchableOpacity>
          }
           </View>
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
    );
  }
}


const styles = StyleSheet.create({


});

const mapStateToProps =(state) => {
    return {
    counter: state.cartItems.counter,
    cart : state.cartItems.cartItem,
    store:state.cartItems.store,
    myStore:state.cartItems.myStore,
    unitTypes:state.cartItems.unitTypes,
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

export default connect(mapStateToProps, mapDispatchToProps)(ProductCreateScreen);
