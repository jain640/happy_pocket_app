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
import { MonoText } from '../components/StyledText';
import * as FileSystem from 'expo-file-system';
import ModalBox from 'react-native-modalbox';
import { Card ,SearchBar , Icon,CheckBox} from 'react-native-elements';
import { Switch } from 'react-native-paper';
import Loader from '../components/Loader';


const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

const { width } = Dimensions.get('window');
const height = width * 0.8

const SERVER_URL = settings.url

const unitTypes = ['Quantity','Ton','Kilogram','Gram','Litre','Millilitre','Size','Size and Color','Color','Quantity and Color']

const colors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
         "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
         "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800",
         "#FF5722", "#795548", "#9E9E9E", "#607D8B","#000000","#FFFFFF","#EFA834","#1a396f"]

const gstTypes =  [{label: 'Gst Included',value:'gst_included'}, {label: 'Gst Extra',value:'gst_extra'},
                 {label: 'Gst not Applicable',value:'gst_not_applicable'}, ]

class ProductView extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      headerLeft: (
        <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{ flex: 1, justifyContent: 'center', alignItems: 'center',marginLeft:15,height:'100%' }}>
         <MaterialIcons name="arrow-back" size={30} color='#fff'  />
        </TouchableOpacity>
     ),
      headerRight: (
        <TouchableOpacity onPress={()=>{params.addVariant()}} style={{ flex: 1, justifyContent: 'center', alignItems: 'center',marginRight:15,height:'100%' }}>
         <MonoText   style={{color:'#fff',fontSize:16}}>Add Variant</MonoText>
        </TouchableOpacity>
     ),

      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Constants.statusBarHeight
      },
      headerTitleStyle: {
        flex:1,
        alignSelf:'center',
        textAlign:'center',
        marginRight:80,
        fontSize:18
      },
      title: params.title,
      headerTintColor: '#fff',
    }
  };


  constructor(props) {
    super(props);
    var params = props.navigation.state.params
    var item = params.item
    var taxCode = item.taxCode==undefined?0:item.taxCode.toString()
    var taxRate = item.taxRate==undefined?0:item.taxRate.toString()
    var codAdvance = item.codAdvance==undefined?0:item.codAdvance.toString()
    console.log(item,'llllllllll');

    this.state = {
      store:props.store,
      selected:item.category,
      level:1,
      name:item.name,
      colorPallet:false,
      description:item.description,
      mrp:0,
      sellingPrice:0,
      keyboardOffset:0,
      images:[{pk:null}],
      unitTypes:unitTypes,
      unitType:unitTypes[0],
      gstType:item.gstType,
      gstTypes:gstTypes,
      hsnShow:true,
      value:'',
      value2:null,
      visible: false,
      selectedColor: '#1a396f',
      taxCode:taxCode,
      taxRate:taxRate,
      colors:colors,
      product:item,
      variants:[],
      brandName:'',
      codAdvance:codAdvance,
      iscod:item.iscod,
      loader:false,
      keyboardOpen:false
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



  componentDidMount(){
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
      title:this.state.name,
      addVariant:(()=>this.goToVariant()),
    })

  }

  goToVariant=()=>{
    this.props.navigation.navigate('ProductVariantDetails',{product:this.state.product,variant:null,gstType:this.state.gstType,taxCode:this.state.taxCode,taxRate:this.state.taxRate})
  }

  dropDownChanged = (itemValue, itemIndex) => {
    this.setState({ unitType:itemValue})
    if(itemValue =='Size and Color'||itemValue =='Quantity and Color'){
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



   createProduct=async()=>{
     var sessionid =  await AsyncStorage.getItem('sessionid');
     var csrf = await AsyncStorage.getItem('csrf');
     if(this.state.name.length<1){
       return
     }

     if(this.state.taxCode.length<1){
       return
     }
     if(this.state.taxRate.length<1){
       return
     }

     var data = {
       name:this.state.name,
       description:this.state.description,
       gstType:this.state.gstType,
       taxCode:this.state.taxCode,
       taxRate:this.state.taxRate,
       category:this.state.selected.pk,
       iscod:this.state.iscod,
       codAdvance:this.state.codAdvance
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
          if(response.status==200||response.status==201){
            return response.json()
          }
        }).then((jsonResponse)=>{
          if(jsonResponse==undefined){
            return
          }
          this.setState({loader:false})
          this.props.navigation.state.params.reloadRes()
        }).catch((err)=>{
          this.setState({loader:false})
        })
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

   variantEdit=(idx)=>{
     this.props.navigation.navigate('ProductVariantDetails',{product:this.state.product,variant:this.state.variants[idx],update:(item)=>this.reLoad(item),gstType:this.state.gstType,taxCode:this.state.taxCode,taxRate:this.state.taxRate})
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
          responseJson.forEach((i)=>{
            i.selectedImage = 0
          })
            var list = this.state.product
            list.variant = responseJson
            this.setState({ variants: responseJson,product:list})
            this.props.navigation.state.params.reload(list)
        }).catch((error) => {
            return
        });

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
         this.props.navigation.state.params.reload(list)
       }).catch((error) => {
           Alert.alert('Something went wrong in Server side');
     });
   }

   reLoad=(item)=>{
     var product= this.state.product
     var variants= this.state.variants
     var index = null
     variants.forEach((i,idx)=>{
       if(i.pk==item.pk){
         index = idx
       }
     })
     if(index!=null){
       variants[index] = item
       product.variant[index] = item
     }
     this.setState({product:product,variants:variants})
     this.props.navigation.state.params.reload(item)

   }



  render() {
    var themeColor = this.props.store.themeColor
    let varientChoicesText = this.state.unitTypes.map( (s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    let gstTypess= this.state.gstTypes.map( (s, i) => {
      return <Picker.Item key={i} value={s.value} label={s.label}  ></Picker.Item>
    });
    return (
        <View style={{flex:1,paddingBottom:0}}>
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
               <MonoText   style={{fontSize:16,color:themeColor}}>Category : {entities.decode(this.state.selected.name)}</MonoText>
           }
          </View>
          <ScrollView contentContainerStyle={{paddingBottom:40,}}>

            <View style={{paddingTop:15,paddingHorizontal:15}}>
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

            <View style={{paddingTop:15,paddingHorizontal:15}}>
              <MonoText   style={{fontSize:16,fontWeight:'700'}}>Description</MonoText>
              <TextInput style={{marginTop:5,height:80,paddingHorizontal:10,borderWidth:1,borderColor:'#f2f2f2',fontSize:16}}
                  onChangeText={(description)=>this.setState({description:description})}
                  placeholder={'Description'}
                  multiline={true}
                  numberOfLines={3}
                  value={this.state.description}>
              </TextInput>
            </View>

            <View style={{paddingTop:15,paddingHorizontal:15}}>
               <View style={{flexDirection:'row'}}>
               <MonoText   style={{fontSize:16,fontWeight:'700'}}>Brand</MonoText>
               <MonoText   style={{color:'grey',fontWeight:'700',marginTop:2,marginLeft:2}}>(optional)</MonoText>
                </View>
              <TextInput style={{marginTop:5,paddingHorizontal:10,height:40,borderWidth:1,borderColor:'#f2f2f2',fontSize:16}}
                  onChangeText={(brand)=>this.setState({brandName:brand})}
                  placeholder={'Enter Name'}
                  value={this.state.brandName}>
              </TextInput>
            </View>


              <View style={{paddingTop:15,paddingHorizontal:15}}>
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
                <View style={{paddingTop:15,flexDirection:'row',paddingHorizontal:15}}>
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
              <View style={{paddingTop:5,flexDirection:'row',paddingHorizontal:15}}>
                    <View style={{flex:1,marginRight:5}}>
                      <View style={{flexDirection:'row'}}>
                        <MonoText   style={{fontSize:16,fontWeight:'700'}}></MonoText>
                       </View>
                       <View style={{flex:1,flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                         <MonoText   style={{  color: '#000', fontSize: 15,fontWeight: '700',marginLeft:0,marginTop:6 }}>COD</MonoText>
                         <CheckBox
                                 checked={this.state.iscod  ? true:false}
                                 onPress={() => this.setState({ iscod: !this.state.iscod })}
                                 checkedColor={themeColor}
                                 containerStyle={{backgroundColor:'transparent',borderWidth:0,marginTop:-6}}
                                 />

                       </View>
                    </View>

              </View>
              <View style={{paddingVertical:5,flexDirection:'row',paddingHorizontal:15}}>
              <View style={{flex:1,}}>
                <View style={{flexDirection:'row'}}>
                <MonoText   style={{fontSize:16,fontWeight:'700'}}>COD Advance</MonoText>
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





          </ScrollView>

          {!this.state.keyboardOpen&&<View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:themeColor,height:40}}>
            <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center'}} onPress={()=>{this.createProduct()}}>
              <MonoText   style={{fontSize:18,fontWeight:'700',color:'#fff'}}>Update</MonoText>
            </TouchableOpacity>
          </View>
        }
          <Loader
            modalVisible = {this.state.loader}
            animationType="fade"
          />

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
    store:state.cartItems.store
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

export default connect(mapStateToProps, mapDispatchToProps)(ProductView);
