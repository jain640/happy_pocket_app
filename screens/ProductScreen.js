import React,{Component} from 'react';
import {View,Text,Dimensions,TextInput,TouchableOpacity,
        StyleSheet,AsyncStorage,ScrollView,FlatList,ToastAndroid,
        Alert,Image,ImageBackground,Keyboard} from 'react-native';
import Constants from 'expo-constants';
import {Card,CheckBox} from 'react-native-elements';
import {FontAwesome,Ionicons,MaterialIcons}from '@expo/vector-icons';
import Modal from "react-native-modal";
import { Dropdown } from 'react-native-material-dropdown-v2';
const { width } = Dimensions.get('window');
import { withNavigationFocus,DrawerActions } from 'react-navigation';
import { createDrawerNavigator,DrawerItems } from 'react-navigation-drawer';
import Carousel from 'react-native-snap-carousel';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import {ColorPicker, StatusColorPicker } from 'react-native-status-color-picker';
import * as  ImagePicker  from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { MonoText } from '../components/StyledText';
import { Switch } from 'react-native-switch';
import Tags from "react-native-tags";
import TagInput from 'react-native-tag-input';
import AutoTags from 'react-native-tag-autocomplete';

import settings from '../constants/Settings.js';
import RichTextScreen from '../screens/RichTextScreen';

const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const themeColor=settings.themeColor
const SERVER_URL = settings.url;

class ProductScreen extends React.Component{

      static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state
        return {
           title: params.edittouch==null?'New Products':'',
           headerLeft: (
             <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginLeft:15 }}>
            <TouchableOpacity onPress={()=>{params.goBack()}}><MaterialIcons name="arrow-back" size={30} color={'#fff'}/></TouchableOpacity>
             </View>
          ),
           headerStyle: {
             backgroundColor: params.themeColor,
             marginTop:Constants.statusBarHeight
           },
           headerTintColor: '#ffffff',
        }
      };

      constructor(props){
          super(props);
          var touchdata=this.props.navigation.getParam('touchitem',null);
          var params = props.navigation.state.params
          if(touchdata==null||touchdata==undefined){
            var data={
               products:[],
              categorytext:'',
              categorypk:params.selected.pk,
              nametext:'',
              descriptiontext:'',
              productpk:'',
              add:false,
              taxratetext:'',
              taxtyptext:'',
              checked:false,
              codtext:'',
              parent:params.category,
              subCategory:params.subcategory,
              selected:params.selected,
              level:params.level,
              initial:params.initial,
              isView:false
            }
          }else{
            var data={
              products:touchdata,
              categorytext:(touchdata.category==null?'':touchdata.category.name),
              categorypk:(touchdata.category==null?'':touchdata.category.pk),
              nametext:touchdata.name,
              descriptiontext:touchdata.description,
              productpk:touchdata.pk,
              add:true,
              checked:touchdata.iscod,
              codtext:touchdata.codAdvance,
              parent:touchdata.category,
              subCategory:touchdata.category,
              selected:touchdata.category,
              level:1,
              initial:false,
              isView:true
            }
          }

            this.state = {
              categorytext:data.categorytext,
              nametext:data.nametext,
              taxcodetext:'',
              descriptiontext:data.descriptiontext,
              modalVisible:false,
              skutext:'',
              unittypetext:'',
              valutext:'',
              mrptext:'',
              sellingpricetext:'',
              listResult:[],
              add:data.add,
              Storepk:'',
              categorypk:data.categorypk,
              TaxCode:[],
              taxcodepk:'',
              PVariant:[],
              productpk:data.productpk,
              gsttypetext:'',
              addmore:false,
              data2: [{lable: 'Gst Included',value:'gst_included'},
                      {lable: 'Gst Extra',value:'gst_extra'},
                      {lable: 'Gst not Applicable',value:'gst_notapplicable'}, ],
              value: '',
              lable:'',
              Images:[{attachment:null,}],
              selectedImage:null,
              hasCameraPermission:null,
              type: Camera.Constants.Type.back,
              imageDetails:null,
              photo:[],
              photoshoot:false,
              codeTax:[],
              visible: false,
              colors: ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
                       "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
                       "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800",
                       "#FF5722", "#795548", "#9E9E9E", "#607D8B","#000000",
                       "#FFFFFF","#EFA834","#1a396f"],
             selectedColor: '#1a396f',
             text: '',
             sizetext:'',
             selectedImg:null,
             imageModal:false,
             attachOpen:false,
             image:[],
             filesPk:[],
             editpvpk:'',
             store:this.props.store,
             addcode:true,
             enabled:false,
             checked:data.checked,
             codtext:data.codtext,
             tags:[],
             statetext:'',
             suggestions : [],
             tagsSelected : [],
             suggestions1 : [],
             tagsSelected1 : [],
             suggestions2 : [],
             tagsSelected2 : [],
             suggestions3 : [],
             tagsSelected3 : [],
             suggestions4 : [],
             tagsSelected4 : [],
             suggestions5 : [],
             tagsSelected5 : [],
             parent:data.parent,
             subCategory:data.subCategory,
             selected:data.selected,
             level:data.level,
             initial:data.initial,
             products:data.products,
             keyboardOffset: 0,
             isView:data.isView,
             data2: [{lable: 'Gst Included',value:'gst_included'},
                                   {lable: 'Gst Extra',value:'gst_extra'},
                                   {lable: 'Gst not Applicable',value:'gst_notapplicable'}, ],
            }
            Keyboard.addListener('keyboardDidHide',this.keyboardDidHide)
            Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
          }

          keyboardDidShow=(event)=> {
                this.setState({
                    keyboardOffset: event.endCoordinates.height+27,
                })
            }

            keyboardDidHide=()=> {
                this.setState({
                    keyboardOffset: 0,
                })
          }

          handleDelete = index => {
              let tagsSelected = this.state.tagsSelected;
              tagsSelected.splice(index, 1);
              this.setState({ tagsSelected });
          }

          handleAddition = (suggestion) => {
              this.setState({ tagsSelected: this.state.tagsSelected.concat([suggestion]) });
          }


          handleDelete1 = index => {
              let tagsSelected1 = this.state.tagsSelected1;
              tagsSelected1.splice(index, 1);
              this.setState({ tagsSelected1});
          }

          handleAddition1 = (suggestion) => {
              this.setState({ tagsSelected1: this.state.tagsSelected1.concat([suggestion]) });
          }

          handleDelete2 = index => {
              let tagsSelected2 = this.state.tagsSelected2;
              tagsSelected2.splice(index, 1);
              this.setState({ tagsSelected2 });
          }

          handleAddition2 = (suggestion) => {
              this.setState({ tagsSelected2: this.state.tagsSelected2.concat([suggestion]) });
          }

          handleDelete3 = index => {
              let tagsSelected3 = this.state.tagsSelected3;
              tagsSelected3.splice(index, 1);
              this.setState({ tagsSelected3 });
          }

          handleAddition3 = (suggestion) => {
              this.setState({ tagsSelected3: this.state.tagsSelected3.concat([suggestion]) });
          }

          handleDelete4 = index => {
              let tagsSelected4 = this.state.tagsSelected4;
              tagsSelected4.splice(index, 1);
              this.setState({ tagsSelected4 });
          }

          handleAddition4 = (suggestion) => {
              this.setState({ tagsSelected4: this.state.tagsSelected4.concat([suggestion]) });
          }

          handleDelete5 = index => {
              let tagsSelected5 = this.state.tagsSelected5;
              tagsSelected5.splice(index, 1);
              this.setState({ tagsSelected5 });
          }

          handleAddition5 = (suggestion) => {
              this.setState({ tagsSelected5: this.state.tagsSelected5.concat([suggestion]) });
          }

          customFilterData = query => {
            if(query.length>=3){
            query = query.toUpperCase();
            let searchResults = this.state.suggestions.filter(s => {
              return (
                s.name.toUpperCase().includes(query)
              );
            });
            return searchResults;
          }else {
            return
          }
          };
          customFilterData1 = query => {
            if(query.length>=3){
            query = query.toUpperCase();
            let searchResults = this.state.suggestions1.filter(s => {
              return (
                s.name.toUpperCase().includes(query)
              );
            });
            return searchResults;
          }else {
            return
          }
          };
          customFilterData2 = query => {
            if(query.length>=3){
            query = query.toUpperCase();
            let searchResults = this.state.suggestions2.filter(s => {
              return (
                s.name.toUpperCase().includes(query)
              );
            });
            return searchResults;
          }else {
            return
          }
          };
          customFilterData3 = query => {
            if(query.length>=3){
            query = query.toUpperCase();
            let searchResults = this.state.suggestions3.filter(s => {
              return (
                s.name.toUpperCase().includes(query)
              );
            });
            return searchResults;
          }else {
            return
          }
          };
          customFilterData4 = query => {
            if(query.length>=3){
            query = query.toUpperCase();
            let searchResults = this.state.suggestions4.filter(s => {
              return (
                s.name.toUpperCase().includes(query)
              );
            });
            return searchResults;
          }else {
            return
          }
          };
          customFilterData5 = query => {
            if(query.length>=3){
            query = query.toUpperCase();
            let searchResults = this.state.suggestions5.filter(s => {
              return (
                s.name.toUpperCase().includes(query)
              );
            });
            return searchResults;
          }else {
            return
          }
          };

          userAsyncState = async () => {
             var csrf = await AsyncStorage.getItem('csrf');
             const sessionid = await AsyncStorage.getItem('sessionid');
             await fetch(SERVER_URL+'/api/POS/geoSearch/?state=',{
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

                 var suggestions  = []
                     for (var i = 0; i < responseJson.length; i++) {
                       suggestions.push({name:responseJson[i]})
                     }
                     this.setState({suggestions:suggestions});
                     this.setState({suggestions3:suggestions});
               }).catch((error) => {
                 return
             });
             };
             userAsyncCity = async () => {
                var csrf = await AsyncStorage.getItem('csrf');
                const sessionid = await AsyncStorage.getItem('sessionid');
                await fetch(SERVER_URL+'/api/POS/geoSearch/?city=',{
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

                    var suggestions  = []
                        for (var i = 0; i < responseJson.length; i++) {
                          suggestions.push({name:responseJson[i]})
                        }
                        this.setState({suggestions1:suggestions});
                        this.setState({suggestions4:suggestions});
                  }).catch((error) => {
                    return
                });
                };
                userAsyncPincode = async () => {
                   var csrf = await AsyncStorage.getItem('csrf');
                   const sessionid = await AsyncStorage.getItem('sessionid');
                   await fetch(SERVER_URL+'/api/POS/geoSearch/?pincode=',{
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

                       var suggestions  = []
                           for (var i = 0; i < responseJson.length; i++) {
                             suggestions.push({name:responseJson[i]})
                           }
                           this.setState({suggestions2:suggestions});
                           this.setState({suggestions5:suggestions});
                     }).catch((error) => {
                       return
                   });
                   };

            ok = data => {
                this.setState({ selectedColor: data.selectedColor, });
                this.close();
            };

            close = () => {
                this.setState({ visible: false });
            };

            goBack=()=>{
              if(this.state.initial==true){
                this.props.navigation.goBack()
              }else{
                this.props.navigation.state.params.userAsync()
                this.props.navigation.goBack()
              }
            }

            componentDidMount=async()=>{
              this.userAsyncState();
              this.userAsyncCity();
              this.userAsyncPincode();

                var touchdata=this.props.navigation.getParam('touchitem',null);
                this.props.navigation.setParams({
                  themeColor: this.state.store.themeColor,
                  edittouch:touchdata,
                  goBack:this.goBack
                });
                this.setState({themeColor:this.state.store.themeColor})
                const value = this.state.data2[0].value;
                this.setState({value});
                this.getStore();
                this.getProductVariant();
                this.cameraPermission();
            }

            getUser=async()=>{
                var data = new FormData();
                data.append("username", 'admin');
                data.append("password", '123');
                data.append("csrfmiddlewaretoken", 'szEGiVz0VILVc83FvAyP5BeHToqiN1ama3mmjwMh53k1jgrccCKaG9dVTmPmYNQ2');
                fetch(SERVER_URL + '/login?next=/ERP/', {
                    method: 'POST',
                    body: data,
                    headers: {
                    }
                }).then((response) => {
                    if (response.status == 200) {
                    }
                      response.json();
                  }).then((responseJson) => {
                      AsyncStorage.setItem("csrf", responseJson.csrf_token)
                      AsyncStorage.setItem("userpk", responseJson.pk + '')
                      AsyncStorage.setItem("login", JSON.stringify(true)).then(res => {
                      });
                  }).catch((error) => {
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
                }).then((response) =>
                   response.json()
                ).then((responseJson) => {
                    this.setState({ Storepk: responseJson[0].pk})
                }).catch((error) => {
                    return
                });
            }

            getCategory=async(categorytext)=>{
                this.setState({categorytext:categorytext})
                var csrf = await AsyncStorage.getItem('csrf');
                const sessionid = await AsyncStorage.getItem('sessionid');
                await fetch(SERVER_URL+'/api/POS/categorysv/?store=1&name__contains='+this.state.categorytext,{
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
                    this.setState({ listResult: responseJson})
                }).catch((error) => {
                    return
                });
            }

            getTaxCode=async(taxcodetext)=>{
                this.setState({taxcodetext:taxcodetext});
                var csrf = await AsyncStorage.getItem('csrf');
                const sessionid = await AsyncStorage.getItem('sessionid');
                await fetch(SERVER_URL+'/api/POS/productMeta/?code__contains='+JSON.parse(this.state.taxcodetext),{
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
                      if(this.state.taxcodetext==responseJson[i].code){
                        this.setState({addcode:false})
                      }else{
                        this.setState({addcode:true})
                      }
                    }
                }).catch((error) => {
                    return
                });
            }
            Reset=()=>{
                this.setState({descriptiontext:'',nametext:'',categorytext:'',listResult:null})
            }

            save=async(touchdata)=>{

                if(touchdata==null){
                var data={
                    category:this.state.categorypk,
                    description:this.state.descriptiontext,
                    name:this.state.nametext,
                    store:this.state.Storepk,
                    iscod:this.state.checked,
                }
                var descdetail=await AsyncStorage.getItem("richtext")
                if(descdetail!=null){
                  data.detailedDescription=descdetail
                }
                var csrf = await AsyncStorage.getItem('csrf');
                const sessionid = await AsyncStorage.getItem('sessionid');
                await fetch(SERVER_URL+'/api/POS/productsv/',{
                    method: 'POST',
                    headers: {
                      "Cookie" :'csrftoken='+csrf+'; sessionid='+sessionid,
                      'Accept': 'application/json, text/plain, */*',
                      'Content-Type': 'application/json;charset=utf-8',
                      'X-CSRFToken':csrf,
                      'Referer': SERVER_URL,
                    },
                    body:JSON.stringify(data),
                  }).then((response) => {
                      if(response.status===200||response.status===201){
                          this.setState({add:true,})
                      }
                      return response.json()
                  }).then((responseJson) => {
                      this.setState({ products: responseJson,});
                      this.setState({productpk:responseJson.pk});
                  }).catch((error) => {
                  });
                }else{
                  var cityin=[];
                  for(var i=0;i<this.state.tagsSelected1.length;i++){
                    cityin.push({text:this.state.tagsSelected1[i].name})
                  }
                  var cityout=[];
                  for(var i=0;i<this.state.tagsSelected4.length;i++){
                    cityout.push({text:this.state.tagsSelected4[i].name})
                  }
                  var pincodein=[];
                  for(var i=0;i<this.state.tagsSelected2.length;i++){
                    pincodein.push({text:this.state.tagsSelected2[i].name})
                  }
                  var pincodeout=[];
                  for(var i=0;i<this.state.tagsSelected5.length;i++){
                    pincodeout.push({text:this.state.tagsSelected5[i].name})
                  }
                  var statein=[];
                  for(var i=0;i<this.state.tagsSelected.length;i++){
                    statein.push({text:this.state.tagsSelected[i].name})
                  }
                  var stateout=[];
                  for(var i=0;i<this.state.tagsSelected3.length;i++){
                    stateout.push({text:this.state.tagsSelected3[i].name})
                  }

                  var data={
                      category:this.state.categorypk,
                      description:this.state.descriptiontext,
                      name:this.state.nametext,
                      store:this.state.Storepk,
                      // iscod:this.state.checked,
                      // codAdvance:this.state.codtext,
                      cityin:cityin,
                      cityout:cityout,
                      pincodein:pincodein,
                      pincodeout:pincodeout,
                      statein:statein,
                      stateout:stateout
                  }
                  var descdetail=await AsyncStorage.getItem("richtext")
                  if(descdetail!=null){
                    data.detailedDescription=descdetail
                  }
                  var csrf = await AsyncStorage.getItem('csrf');
                  const sessionid = await AsyncStorage.getItem('sessionid');
                  await fetch(SERVER_URL+'/api/POS/productsv/'+this.state.productpk+'/',{
                      method: 'PATCH',
                      headers: {
                        "Cookie" :'csrftoken='+csrf+'; sessionid='+sessionid,
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json;charset=utf-8',
                        'X-CSRFToken':csrf,
                        'Referer': SERVER_URL,
                      },
                      body:JSON.stringify(data),
                    }).then((response) => {
                        if(response.status===200||response.status===201){
                            this.setState({add:true})
                        }
                        return response.json()
                    }).then((responseJson) => {
                        this.setState({ products: responseJson[0],});
                        this.setState({productpk:responseJson.pk});
                    }).catch((error) => {
                        return
                    });
                }
            }

            savedata=()=>{
              if((this.state.value=='gst_extra'||this.state.value=='gst_included'
                ||this.state.lable=='gst_extra'||this.state.lable=='gst_included')&&(this.state.taxcodepk!='')){
                this.props.navigation.navigate('ProductVariantDetails',{product:this.state.products,gstTypes:this.state.value,taxcodepk:this.state.taxcodepk})//{product:JSON.stringify(responseJson)}
              }else if(this.state.value=='gst_notapplicable'&&this.state.taxcodepk==''){
                this.props.navigation.navigate('ProductVariantDetails',{product:this.state.products,gstTypes:this.state.value,taxcodepk:this.state.taxcodepk})
             }
              else{
              return  ToastAndroid.show('please add gsttype and taxcode..', ToastAndroid.SHORT);
            }

            }

           invoiceTitle=(i)=>{
                 this.setState({categorytext:i.name});
                 this.state.categorytext=i.name;
                 this.state.categorypk=i.pk;
                 if(this.state.categorytext===i.name){
                   this.setState({listResult:null});
                 }
             }

           taxCode=(i)=>{

                this.setState({codeTax:[i]});
                if(this.state.taxcodetext===JSON.stringify(i.code)){

                  this.setState({TaxCode:[]});
                  this.setState({addcode:false});
                }else if(this.state.taxcodetext===''){
                  this.setState({TaxCode:[]});
                  this.setState({addcode:true});
                }
            }

           getProductVariant=async()=>{
                if(this.state.productpk==''){return}else{
                var csrf = await AsyncStorage.getItem('csrf');
                const sessionid = await AsyncStorage.getItem('sessionid');
                await fetch(SERVER_URL+'/api/POS/productVariantsv/?parent='+this.state.productpk,{
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
                    this.setState({ PVariant: responseJson})
                }).catch((error) => {
                    return
                });
              }
          }

         SavePVariant=async()=>{
           var csrf = await AsyncStorage.getItem('csrf');
           const sessionid = await AsyncStorage.getItem('sessionid');
             var dataSend={
                 gstType:this.state.value,
                 customizable:false,
                 maxQtyOrder:10,
                 minQtyOrder:5,
                 parent:  this.state.productpk,
                 price:this.state.mrptext,
                 sellingPrice:this.state.sellingpricetext,
                 unitType:this.state.unittypetext,
             }
             if(this.state.unittypetext=='Size and Color'){
                dataSend.value=this.state.valutext
                dataSend.value2=this.state.selectedColor
             }else if(this.state.unittypetext=='Quantity and Color'){
                dataSend.value=this.state.valutext
                dataSend.value2=this.state.selectedColor
             }else if(this.state.unittypetext=='Size'){
                dataSend.value=this.state.valutext
             }else if(this.state.unittypetext=='Color'){
                dataSend.value=this.state.selectedColor
             }else{
                dataSend.value=this.state.valutext
             }
             if(this.state.value=='gst_extra'||this.state.value=='gst_included'){
                if(this.state.taxcodetext.length>0){
                   dataSend.productMeta=this.state.taxcodepk
                }else{
                   return Alert.alert('please entar taxCode..mno')
               }
             }
             var img=this.state.Images.map((i)=>{return(i.pk)})
             if(img.length>0){
                var i=img.filter(Boolean);
                dataSend.images=i
             }
             if(this.state.editpvpk==''){
             fetch(SERVER_URL+'/api/POS/productVariantsv/',{
                method:'POST',
                headers:{
                  "Cookies":"csrf="+csrf+";sessionid="+sessionid+";",
                  "Accept":'application/json',
                  "Content-Type":'application/json',
                  "X-CSRFToken":csrf,
                  "Referer":SERVER_URL,
                },
                body:JSON.stringify(dataSend),
              }).then((response)=>{
                  if(response.status==200||response.status==201){
                      this.setState({sellingpricetext:'',unittypetext:'',
                                      valutext:'',modalVisible:false,
                                      taxcodetext:'',Images:[{attachment:null}],
                                      codeTax:[],lable:'',value:'',mrptext:'',taxratetext:''})
                  }
                  return response.json()
              }).then((responseJson)=>{
                  this.getProductVariant();
              }).catch((error)=>{
              })
            }else{
              fetch(SERVER_URL+'/api/POS/productVariantsv/'+this.state.editpvpk+'/',{
                  method:'PATCH',
                  headers:{
                    "Cookies":"csrf="+csrf+";sessionid="+sessionid+";",
                    "Accept":'application/json',
                    "Content-Type":'application/json',
                    "X-CSRFToken":csrf,
                    "Referer":SERVER_URL,
                  },
                  body:JSON.stringify(dataSend),
                  }).then((response)=>{
                  if(response.status==200||response.status==201){
                    this.setState({sellingpricetext:'',unittypetext:'',
                                    valutext:'',modalVisible:false,
                                    taxcodetext:'',Images:[{attachment:null}],
                                    codeTax:[],lable:'',value:'',mrptext:'',taxratetext:''})
                  }
                  return response.json()
              }).then((responseJson)=>{
                this.getProductVariant();
              }).catch((error)=>{
              })
            }
         }

        saveVar=async()=>{
            if(this.state.unittypetext==''){
                return Alert.alert('unittype is not a valid choice.')
            }else if(this.state.sellingpricetext==''){
                return Alert.alert('A valid number is required.')
            }else{
                this.SavePVariant();
            }
        }

        Delete =async({item,index})=>{
          var csrf = await AsyncStorage.getItem('csrf');
          const sessionid = await AsyncStorage.getItem('sessionid');
            var arr = this.state.Images
            arr.splice(index,1);
            if(arr.length > 0){

               this.setState({Images:arr})
            }else{
               this.setState({Images:[],})
            }
            fetch(SERVER_URL+'/api/POS/mediasv/'+item.pk+'/', {
                method: 'DELETE',
                headers: {
                  "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
                  'Content-Type': 'application/json',
                  'X-CSRFToken':csrf,
                 'Referer': SERVER_URL,
                },
              }).then((response) =>{
                 if(response.status == '204'||response.status == '204'){
                     return response.json();
                  }
              }).then((json) => {
              }).catch((error) => {
            });
        }

        DeletePVariant=async(item,index)=>{
          var csrf = await AsyncStorage.getItem('csrf');
          const sessionid = await AsyncStorage.getItem('sessionid');
            Alert.alert('Confirm', 'Are you sure want to delete ?',
                [{text: "Yes",onPress: () => {
                    var arr = this.state.PVariant
                    arr.splice(index,1)
                    if(arr.length > 0){
                        this.setState({PVariant:arr})
                    }else{
                        this.setState({PVariant:[],})
                    }
                    fetch(SERVER_URL+'/api/POS/productVariantsv/'+item.pk+'/', {
                        method: 'DELETE',
                        headers: {
                          "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
                          'Content-Type': 'application/json',
                          'X-CSRFToken':csrf,
                          'Referer': SERVER_URL,
                         },
                        }).then((response) =>{
                          if(response.status == '204'||response.status == '204'){
                              ToastAndroid.show('Product varieant item is deleted ', ToastAndroid.SHORT);
                              return response.json();
                          }
                        }).then((json) => {
                        }).catch((error) => {
                        });
                      }
                    },
                  {text: 'No',onPress: () => {return},
                   style: 'cancel',
                  },
            ],{ cancelable: false })
        }

        cameraPermission=async()=>{
            const { status } = await Permissions.askAsync(Permissions.CAMERA);
            this.setState({ hasCameraPermission: status === 'granted' });
        }

        setCameraImage =  (image) => {
            this.setState({selectedImage:image.uri,imageDetails:image,photoshoot:false})
            this.addGoodss();
        }

        onSelect = color =>{
            this.setState({ selectedColor: color ,visible:false,});
            if(this.state.unittypetext=='Color'){
                this.setState({ selectedColor: color ,visible:false,valutext:color});
            }
        }

        modalAttach =async (event) => {
            if(event == 'gallery') return this._pickImage();
            if(event == 'camera'){
                this.handlePhoto()
            }
        };

        _pickImage = async () => {
          var csrf = await AsyncStorage.getItem('csrf');
          const sessionid = await AsyncStorage.getItem('sessionid');
            this.setState({photoshoot:false});
            let result = await ImagePicker.launchImageLibraryAsync({
               mediaTypes: ImagePicker.MediaTypeOptions.Images,
               allowsMultipleSelection: true
            });
            this.attachShow(false)
            let img = new FormData();
            let filename = result.uri.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            var type = match ? `image/${match[1]}` : `image`;
            const photo = {
               uri: result.uri,
               type: type,
               name:filename,
            };
            var imageLib = this.state.image
            imageLib.push(photo)
            this.setState({ image: imageLib });
            var formData = new FormData();
            formData.append("attachment",(photo.name == null ||photo.uri ==null?'':photo));
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
                 var arr =this.state.Images;
                 arr.unshift(json)
                 this.setState({Images:arr});
             }).catch((error) => {
             });
       };

       handlePhoto = async () => {
            this.setState({photoshoot:false});
            let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});
            this.attachShow(false)
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
            var imageLib = this.state.image
            imageLib.push(photo)
            this.setState({ image: imageLib });
            var formData = new FormData();
            formData.append("attachment",(photo.name == null ||photo.uri ==null?'':photo));
            var csrf = await AsyncStorage.getItem('csrf');
            const sessionid = await AsyncStorage.getItem('sessionid');
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
                var arr =this.state.Images;
                arr.unshift(json)
                this.setState({Images:arr});
            }).catch((error) => {
           });
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

        getCameraRollAsync=async()=> {
           const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
           if(status === 'granted'){
              this.attachShow(true)
           }else{
              throw new Error('Gallery permission not granted');
           }
        }

       getCameraAsync=async()=> {
           const{ status, permissions } = await Permissions.askAsync(Permissions.CAMERA);
           if(status === 'granted'){
              this.attachShow(true)
           }else{
              throw new Error('Camera permission not granted');
           }
        }

       editCard=(item)=>{

           if(item.images.length>0){
           var img =item.images;
             if(item.images[0].attachment != null){
              img.unshift({attachment:null})
            }else{
              if(item.images[0].pk != undefined){
                img.unshift({attachment:null,add:true})
              }
            }
          }else{
            var img =item.images;
            img.unshift({attachment:null});
          }




           this.setState({
                value:item.gstType,
                lable:item.gstType,
                mrptext:JSON.stringify(item.price),
                sellingpricetext:JSON.stringify(item.sellingPrice),
                unittypetext:item.unitType,
                modalVisible:true,
                Images:img,
                taxcodepk:item.productMeta==null?'':item.productMeta.pk,
                taxcodetext:item.productMeta==null?'':JSON.stringify(item.productMeta.code),
                taxratetext:item.productMeta==null?'':JSON.stringify(item.productMeta.taxRate),
            })

            if(item.unitType=='Size and Color'){
                this.setState({valutext:item.value})
                this.setState({selectedColor:item.value2==null?'':item.value2})
            }else if(item.unitType=='Quantity and Color'){
                this.setState({valutext:item.value})
                this.setState({selectedColor:item.value2==null?'':item.value2})
            }else if(item.unitType=='Size'){
                this.setState({sizetext:item.value})
            }else if(item.unitType=='Color'){
                this.setState({valutext:item.value})
                this.setState({selectedColor:item.value})
            }else{
                this.setState({valutext:item.value})
            }this.setState({editpvpk:item.pk})
        }

        openPvariantModal=()=>{
            if(this.state.PVariant.length>1){
                this.setState({unittypetext:this.state.PVariant[1].unitType,value:'',lable:''})
            }
            this.setState({modalVisible:true})
        }

        goToTop = () => {
          this.setState({addmore:true});
             this.scrollView_ref.scrollTo({y:100, animated:true});
        }

        Close=()=>{
          this.setState({modalVisible:false,value:'',
                                         mrptext:'',sellingpricetext:'',
                                         unittypetext:'',Images:[{attachment:null}],
                                         taxcodetext:'',value:'',lable:'',
                                         taxcodepk:'',sizetext:'',
                                         selectedColor:'',valutext:'',taxratetext:'',
                                       })
        }


      AddTax=async()=>{
        var csrf = await AsyncStorage.getItem('csrf');
        var sessionid = await AsyncStorage.getItem('sessionid');
        var data={
          taxRate:this.state.taxratetext,
          code:this.state.taxcodetext,
          description:'GST',
        }

        await fetch(SERVER_URL+'/api/POS/productMeta/',{
           method:'POST',
           headers:{
             "Cookie":"csrftoken="+csrf+"; sessionid="+sessionid,
             "Accept":'application/json, ',
             "Content-Type":'application/json',
             "X-CSRFToken":csrf,
             "Referer":SERVER_URL+'/admin/',
           },
           body:JSON.stringify(data),
         }).then((response)=>{
             if(response.status==200||response.status==201){
               ToastAndroid.show('Tax is added successfully..', ToastAndroid.SHORT)
             }
             return response.json()
         }).then((responseJson)=>{
             this.setState({taxcodepk:responseJson.pk})
         }).catch((error)=>{
         })
      }

       ShowAlert= async(pk,enabled,index,value)=>{
          var PVariant = this.state.PVariant
          PVariant[index].enabled = !PVariant[index].enabled
          this.setState({ PVariant: PVariant})
          this.setState({enabled:value})
          this.state.enabled=value
          var dataToSend = {
            enabled:this.state.enabled,
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
            if(response.status === '200' ){
              return response.json()
            }
            }).then((json) => {
            }).catch((error) => {
                Alert.alert('Something went wrong in Server side');
          });
        }

        onChangeText1=async(statetext)=>{
          return
        }

        customRenderTags = tags => {

          return (<View style={styles.customTagsContainer}>
              {this.state.tagsSelected.map((t, i) => {
                return (<TouchableOpacity
                            key={i}
                            style={styles.customTag}
                            onPress={() => this.handleDelete(i)}>
                              <MonoText   style={{ color: "#000000" }}>{t.name}</MonoText>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
      };
      customRenderTags1 = tags => {
        return (
          <View style={styles.customTagsContainer}>
            {this.state.tagsSelected1.map((t, i) => {
              return (  <TouchableOpacity
                            key={i}
                            style={styles.customTag}
                            onPress={() => this.handleDelete1(i)}>
                                <MonoText   style={{ color: "#000000" }}>{t.name}</MonoText>
                </TouchableOpacity>
              );
            })}
          </View>
        );
    };
      customRenderTags2 = tags => {
          return (
            <View style={styles.customTagsContainer}>
              {this.state.tagsSelected2.map((t, i) => {
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.customTag}
                    onPress={() => this.handleDelete2(i)}>
                      <MonoText   style={{ color: "#000000" }}>{t.name}</MonoText>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
      };
        customRenderTags3 = tags => {
          return (
            <View style={styles.customTagsContainer}>
              {this.state.tagsSelected3.map((t, i) => {
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.customTag}
                    onPress={() => this.handleDelete3(i)}>
                      <MonoText   style={{ color: "#000000" }}>{t.name}</MonoText>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        };
        customRenderTags4 = tags => {
          return (
            <View style={styles.customTagsContainer}>
              {this.state.tagsSelected4.map((t, i) => {
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.customTag}
                    onPress={() => this.handleDelete4(i)}>
                      <MonoText   style={{ color: "#000000" }}>{t.name}</MonoText>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        };
        customRenderTags5 = tags => {
          return (
            <View style={styles.customTagsContainer}>
              {this.state.tagsSelected5.map((t, i) => {
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.customTag}
                    onPress={() => this.handleDelete5(i)}>
                      <MonoText   style={{ color: "#000000" }}>{t.name}</MonoText>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        };


 render(){
   const data1=[{value: 'Ton',}, {value: 'Kilogram',}, {value: 'Gram',},
                {value: 'Litre',} ,{value: 'MilliLitre',},{value: 'Quantity',},
                {value: 'Color',},{value: 'Size',},{value: 'Size and Color',},
                {value: 'Quantity and Color',}]
   const datasize=[{value:'XS'},{value:'S'},{value:'M'},
                   {value:'L'},{value:'XL'},{value:'XXL'},]
   var touchdata=this.props.navigation.getParam('touchitem',null);
   return(
     <View style={{flex:1,backgroundColor:'#f1f1f1',paddingBottom:this.state.keyboardOffset}}>
       <View style={{padding:15,paddingBottom:6,paddingTop:6,borderBottomWidth:1,borderColor:'#a8a8a8',backgroundColor:'#fff'}}>
        {this.state.level==3&&
          <View style={{flexDirection:'row'}}>
         <MonoText   style={{fontSize:16,color:'#000'}}>{entities.decode(this.state.parent.name)} - </MonoText>
         <MonoText   style={{fontSize:16,color:'#000'}}>{entities.decode(this.state.subCategory.name)} - </MonoText>
         <MonoText   style={{fontSize:16,color:'#e37c1e'}}>{entities.decode(this.state.selected.name)}</MonoText>
       </View>
        }
        {this.state.level==2&&
            <MonoText   style={{fontSize:16,color:'#000'}}>{entities.decode(this.state.parent.name)} - {entities.decode(this.state.selected.name)}</MonoText>
        }
        {this.state.level==1&&
            <MonoText   style={{fontSize:16,color:'#ec8e37'}}>{entities.decode(this.state.selected.name)}</MonoText>
        }
       </View>
        <View style={{flex:1,marginHorizontal:1,paddingHorizontal:width*0.02,borderLeftWidth:0,
                      borderRightWidth:0,borderColor:this.state.themeColor,paddingBottom:width*0.02}}>
          <View style={{borderWidth:0,borderColor:'#c63636'}}>
          <ScrollView
                style={{borderWidth:0,borderColor:'#68c636',marginBottom:50}}
                ref={(ref) => {this.scrollView_ref=ref}}>
           <View style={{flexDirection:'column',paddingTop:width*0.01}}>
               <MonoText   style={{fontSize:width*0.037}}>Name</MonoText>
               <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
                                  fontSize:width*0.037,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0}}
                   onChangeText={(nametext)=>this.setState({nametext:nametext})}
                   placeholder={'Enter Name'}
                   value={this.state.nametext}>
               </TextInput>
          </View>

          <View style={{flexDirection:'column',paddingTop:width*0.01}}>
               <MonoText   style={{fontSize:width*0.037}}>Description</MonoText>
               <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
                                  fontSize:width*0.037,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0,
                                  textAlignVertical: "top"}}
                   onChangeText={(descriptiontext)=>this.setState({descriptiontext:descriptiontext})}
                   minHeight={this.state.descriptiontext == null||
                              this.state.descriptiontext== undefined?
                              150:this.state.descriptiontext.length >150?
                              this.state.descriptiontext.length*0.7:150}
                   maxHeight={this.state.descriptiontext == null||
                              this.state.descriptiontext== undefined?
                              150:this.state.descriptiontext.length >150?
                              this.state.descriptiontext.length*0.7:150}
                   multiline={true}
                   textBreakStrategy={'highQuality'}

                   value={this.state.descriptiontext}>
               </TextInput>
          </View>

          <View style={{marginTop:width*0,justifyContent:'flex-end' ,borderWidth:0 ,}}>
              {this.state.addmore==false?
               <TouchableOpacity
                    style={{alignSelf:'flex-end',borderWidth:0,padding:width*0.01}}
                     onPress={()=>{this.goToTop();}}>
                    <MonoText   style={{fontSize:width*0.032,color:'#45bcf6'}}>show more..</MonoText>
               </TouchableOpacity>:
               <TouchableOpacity
                    style={{alignSelf:'flex-end',borderWidth:0,padding:width*0.01}}
                    onPress={()=>{this.setState({addmore:false})}}>
                    <MonoText   style={{fontSize:width*0.032,color:'#45bcf6'}}>show less..</MonoText>
               </TouchableOpacity>
             }
          </View>

          {this.state.addmore==true?<View style={{}}>
            <RichTextScreen/>
            <View style={{flexDirection:'row',marginTop:8,justifyContent:'space-between'}}>
              <MonoText   style={{fontSize:width*0.037}}>COD</MonoText>
              <CheckBox
                    checkedIcon={<Image source={require('../assets/images/checked.png')} style={{height:25,width:25}} />}
                    uncheckedIcon={<Image source={require('../assets/images/unchecked.png')} style={{height:25,width:25}} />}
                    checked={this.state.checked}
                    onPress={() =>  {this.setState({checked:!this.state.checked});}}
                    containerStyle={{marginTop:-6,paddingRight:4}}
                />
              <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.01,
                                 fontSize:width*0.035,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0,width:width*0.7}}
                  onChangeText={(codtext)=>this.setState({codtext:codtext})}
                  placeholder={''}
                  value={this.state.codtext}>
              </TextInput>
            </View>
            <View style={{marginTop:8,justifyContent:'space-between'}}>
                <MonoText   style={{fontSize:20}}>GST Type</MonoText>
                <View style={{flexDirection:'row',paddingTop:width*0.017,justifyContent:'space-between'}}>
                  <MonoText   style={{fontSize:width*0.037,paddingVertical:width*0.01,paddingTop:width*0.022}}>GST Type</MonoText>
                  <Dropdown
                    value={this.state.lable}
                    data={this.state.data2}
                    dropdownOffset={{top:8}}
                    baseColor={this.state.themeColor}
                    rippleColor={this.state.themeColor}
                    shadeColor={this.state.themeColor}
                    rippleInsets={{backgroundColor:this.state.themeColor,top:10}}
                    containerStyle={{borderWidth:0,  borderRadius:0, paddingLeft:0,paddingVertical:width*0.015,borderRadius:0,
                                      fontSize:width*0.037,borderColor:'#bdbdbd',width:width*0.7}}
                    rippleCentered={true}
                    onChangeText={(value)=>this.setState({value,taxcodepk:'',taxtyptext:'',taxcodetext:'',taxratetext:''})}
                    inputContainerStyle={{paddingVertical:width*0.015,borderRadius:0,
                                          fontSize:width*0.037,paddingLeft:6,padding:4,paddingTop:-10,
                                          borderWidth: 0.2,fontSize:16,backgroundColor:'#ffffff',borderColor:'#bdbdbd'}}
                    pickerStyle={{borderWidth:0,borderRadius:10,borderColor:this.state.themeColor,backgroundColor:this.state.themeColor,
                                  rippleColor:this.state.themeColor,paddingLeft:10,width:width*0.35,
                                  marginLeft:width*0.5,marginTop:width*0.18,color:'#ffffff'}}
                    itemTextStyle={{color:'#ffffff'}}
                    itemColor={'#ffffff'}
                    selectedItemColor={'#ffffff'}
                  />
             </View>
            {(this.state.value=='gst_extra'||this.state.value=='gst_included'
                ||this.state.lable=='gst_extra'||this.state.lable=='gst_included')&&
                <View style={{flexDirection:'row',paddingTop:width*0.015,justifyContent:'space-between'}}>
                  <MonoText   style={{fontSize:width*0.037,paddingTop:width*0.022}}>Tax Code</MonoText>
                  <TextInput
                    style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
                            fontSize:width*0.037,borderRadius:0,width:width*0.7,
                            borderWidth:0.2,borderColor:'#bdbdbd'}}
                    onChangeText={(taxcodetext)=>{this.getTaxCode(taxcodetext);this.setState({taxcodetext:taxcodetext});}}
                    placeholder={'Enter Taxcode'}
                    value={this.state.taxcodetext}>
                  </TextInput>
                </View>  }

                    {(this.state.taxcodetext.length>0&&this.state.TaxCode.length>0)?
                        <ScrollView style={{paddingHorizontal:width*0.05,height:width*0.32,marginTop:width*0.017,backgroundColor:'#c6c6c6'}}>
                            {this.state.TaxCode.map((i)=>{
                              return(
                                  <View style={{paddingHorizontal:width*0.02,paddingVertical:width*0.01,backgroundColor:'#c6c6c6'}}>
                                      <TouchableOpacity onPress={()=>{this.setState({taxcodetext:JSON.stringify(i.code),
                                                                                                        taxcodepk:i.pk,
                                                                                                        taxtyptext:i.typ,
                                                                                                        taxratetext:JSON.stringify(i.taxRate)});
                                                                                                      this.taxCode(i);}}
                                                          style={{paddingHorizontal:width*0.02,paddingVertical:width*0.01,}}>
                                                      <MonoText   style={{paddingVertical:width*0.015,
                                                                    fontSize:width*0.037,}}>{this.state.TaxCode[0].code}    {this.state.TaxCode[0].taxRate}%  {i.description.split(' ')[0]}</MonoText>
                                        </TouchableOpacity>
                                    </View>
                                    )}
                                )}
                        </ScrollView>:<View style={{height:0}}></View>}

                      {(this.state.value=='gst_extra'||this.state.value=='gst_included'
                      ||this.state.lable=='gst_extra'||this.state.lable=='gst_included')&&
                      <View style={{flexDirection:'row',paddingTop:width*0.015,justifyContent:'space-between'}}>
                        <MonoText   style={{fontSize:width*0.037,paddingTop:width*0.022}}>TaxRate</MonoText>
                        <TextInput
                          style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
                                   fontSize:width*0.037,borderRadius:0,width:width*0.7,
                                   borderWidth:0.2,borderColor:'#bdbdbd'}}
                          onChangeText={(taxratetext)=>this.setState({taxratetext})}

                          placeholder={'Enter Taxrate'}
                          value={this.state.taxratetext}>
                        </TextInput>
                      </View>  }
                      {(this.state.addcode==true&&(this.state.value=='gst_extra'||this.state.value=='gst_included'
                      ||this.state.lable=='gst_extra'||this.state.lable=='gst_included'))&&
                        <View style={{alignItems:'flex-end',marginTop:4}}>
                          <TouchableOpacity style={{backgroundColor:this.state.themeColor}}
                            onPress={()=>{this.AddTax()}}>
                            <MonoText   style={{color:'#fff',paddingVertical:4,paddingHorizontal:4}}>Add</MonoText>
                          </TouchableOpacity>
                        </View>}
          </View>
            <View style={{marginTop:5,}}>
              <MonoText   style={{fontSize:20}}>Show In</MonoText>
              <View style={{marginTop:0,}}>
                    <MonoText   style={{fontSize:16,marginHorizontal:0}}>State</MonoText>
                    <View style={{borderWidth:0,marginHorizontal:0,}}>
                        <AutoTags
                            style={{backgroundColor:'#ffffff',width:width*1,paddingHorizontal:4,margin:-6,marginRight:-2,borderWidth:6,borderColor:'#fff'}}
                            placeholder='Search...'
                            suggestions={this.state.suggestions}
                            tagsSelected={this.state.tagsSelected}
                            handleAddition={this.handleAddition}
                            handleDelete={this.handleDelete}
                            filterData={this.customFilterData}
                            renderTags={this.customRenderTags}

                            />
                      </View>
              </View>
              <View style={{marginTop:6,}}>
                    <MonoText   style={{fontSize:16,marginHorizontal:0}}>City</MonoText>
                    <View style={{borderWidth:0,marginHorizontal:0}}>
                        <AutoTags
                            style={{backgroundColor:'#ffffff',width:width*1,paddingHorizontal:4,margin:-6,marginRight:-2,borderWidth:6,borderColor:'#fff'}}
                            placeholder='Search...'
                            suggestions={this.state.suggestions1}
                            tagsSelected={this.state.tagsSelected1}
                            handleAddition={this.handleAddition1}
                            handleDelete={this.handleDelete1}
                            filterData={this.customFilterData1}
                            renderTags={this.customRenderTags1}
                            />
                      </View>
              </View>
              <View style={{marginTop:6,}}>
                    <MonoText   style={{fontSize:16,marginHorizontal:0}}>Pincode</MonoText>
                    <View style={{borderWidth:0,marginHorizontal:0}}>
                        <AutoTags
                            style={{backgroundColor:'#ffffff',width:width*1,paddingHorizontal:4,margin:-6,marginRight:-2,borderWidth:6,borderColor:'#fff'}}
                            placeholder='Search...'
                            suggestions={this.state.suggestions2}
                            tagsSelected={this.state.tagsSelected2}
                            handleAddition={this.handleAddition2}
                            handleDelete={this.handleDelete2}
                            filterData={this.customFilterData2}
                            renderTags={this.customRenderTags2}
                            />
                      </View>
              </View>
            </View>
            <View style={{marginTop:5,}}>
              <MonoText   style={{fontSize:20}}>Hide In</MonoText>
              <View style={{marginTop:6,}}>
                    <MonoText   style={{fontSize:16,marginHorizontal:0}}>State</MonoText>
                    <View style={{borderWidth:0,marginHorizontal:0}}>
                        <AutoTags
                            style={{backgroundColor:'#ffffff',width:width*1,paddingHorizontal:4,margin:-6,marginRight:-2,borderWidth:6,borderColor:'#fff'}}
                            placeholder='Search...'
                            suggestions={this.state.suggestions3}
                            tagsSelected={this.state.tagsSelected3}
                            handleAddition={this.handleAddition3}
                            handleDelete={this.handleDelete3}
                            filterData={this.customFilterData3}
                            renderTags={this.customRenderTags3}
                            />
                      </View>
              </View>
              <View style={{marginTop:6,}}>
                    <MonoText   style={{fontSize:16,marginHorizontal:0}}>City</MonoText>
                    <View style={{borderWidth:0,marginHorizontal:0}}>
                        <AutoTags
                            style={{backgroundColor:'#ffffff',width:width*1,paddingHorizontal:4,margin:-6,marginRight:-2,borderWidth:6,borderColor:'#fff'}}
                            placeholder='Search...'
                            suggestions={this.state.suggestions4}
                            tagsSelected={this.state.tagsSelected4}
                            handleAddition={this.handleAddition4}
                            handleDelete={this.handleDelete4}
                            filterData={this.customFilterData4}
                            renderTags={this.customRenderTags4}
                            />
                      </View>
              </View>
            <View style={{marginTop:6,}}>
                    <MonoText   style={{fontSize:16,marginHorizontal:0}}>Pincode</MonoText>
                      <View style={{borderWidth:0,marginHorizontal:0}}>
                        <AutoTags
                            style={{backgroundColor:'#ffffff',paddingHorizontal:4,width:width*1,margin:-6,marginRight:-2,borderWidth:6,borderColor:'#fff'}}
                            placeholder='Search...'
                            suggestions={this.state.suggestions5}
                            tagsSelected={this.state.tagsSelected5}
                            handleAddition={this.handleAddition5}
                            handleDelete={this.handleDelete5}
                            filterData={this.customFilterData5}
                            renderTags={this.customRenderTags5}
                            />
                      </View>
              </View>
            </View>
           </View>:<View></View>}

         </ScrollView>
       </View>

          {/* {this.state.add==true?<View style={{marginTop:width*0.01,justifyContent:'flex-end' ,borderWidth:0 ,}}>
              <TouchableOpacity
                    style={{alignSelf:'flex-end',borderWidth:0,padding:width*0.04,backgroundColor:'#ffffff',
                            alignItems:'center',borderWidth:1,borderRadius:0,borderColor:this.state.themeColor}}
                    onPress={()=>{this.openPvariantModal()}}>
                    <FontAwesome
                        name={'plus'}
                        size={width*0.05}
                        color={this.state.themeColor}/>
              </TouchableOpacity>
          </View>:<View></View>} */}


           {(touchdata!=null ||(this.state.PVariant!=null&&this.state.add==true))&&
             <View style={{marginTop:40}}>
             <View style={{alignItems:'flex-end'}}>
                   <Switch
                    onValueChange={()=>{this.setState({isView:!this.state.isView})}}
                    value={this.state.isView}
                    color={this.state.themeColor}
                  />
           </View >
           {this.state.isView&&
          <FlatList
              data={this.state.PVariant}
              extraData={this.state}
              scrollToEnd={true}
              horizontal={true}
              nestedScrollEnabled={true}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index})=>(
                <Card containerStyle={{flex:1,flexDirection:'column',justifyContent:'center',alignItems:'center',marginBottom:40,
                                        marginTop: 8,marginLeft:width*0.04,marginRight:width*0.04,borderWidth:1.5,paddingHorizontal:0,
                                        paddingVertical:10,borderRadius:7,width:width*0.65,backgroundColor:'#ffffff',
                                        borderColor:this.state.themeColor,height:width*0.5,alignSelf:'flex-end'}}>
                    {item.specialOffer!=null&&<View style={{borderWidth:0,borderRadius:0,height:width*0.06,width:width*0.3,position:'absolute',top:-8,right:-45,zIndex:2}}>
                        <ImageBackground  source={require('../assets/images/inmaimages.png')}style={{height:'100%',width:'100%',backgroundColor:'transparent'}}>
                              <MonoText   style={{fontSize:14,paddingTop:0,textAlign:'center',color:'#ffffff'}}>Special Offer</MonoText>
                          </ImageBackground>
                    </View>}
                  <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start',fontSize:24,
                                backgroundColor:'#ffffff',width:width*0.47,borderRadius:7,paddingHorizontal:4,borderWidth:0}}>
                    {item.maxQtyOrder!=null&&  <View>


                      {item.images.length>0?
                      <ScrollView style={{borderRadius:0,width:width*0.45,height:width*0.27,
                                          backgroundColor:'#ffffff',borderColor : '#ffffff' ,}}
                                  horizontal={false}
                                  showsHorizontalScrollIndicator={false} >
                          <FlatList
                              data={item.images}
                              keyExtractor={(item,index) => {return index.toString();}}
                              horizontal={false}
                              numColumns={1}
                              nestedScrollEnabled={true}
                              renderItem={({item, index}) => (
                              <View style={{paddingTop: 20,paddingHorizontal:0,flex:1,backgroundColor:this.state.themeColor-10,borderRadius:0,}}>
                                  <Card containerStyle={{borderWidth: 0, borderColor: '#67d142', borderRadius: 7,margin:0,
                                                          padding: 0,width:width*0.45,height:width*0.27,}}>
                                      <Image
                                          style={{ width:'100%',height:'100%',zIndex: 1,borderRadius:0,opacity:1,zIndex:1}}
                                          source={{uri:item.attachment}}/>
                                  </Card>
                              </View>
                            )}
                          />
                          <View style={{height: 15}}></View>
                      </ScrollView>:<View style={{height:width*0.27}}>
                        <View style={{width:width*0.45,height:width*0.27,borderWidth:0,}}>
                          <Image style={{ width:'100%',height:'100%',zIndex: 1,borderRadius:0,opacity:0.8,zIndex:1}}
                            source={require('../assets/images/noImg.jpeg')}/>
                        </View>
                      </View>}


                      <TouchableOpacity onPress={()=>{this.editCard(item)}} style={{width:width*0.45}} >
                        <View style={{flexDirection:'row',}}>
                          <MonoText   style={{paddingVertical:1,fontSize:16,color:'#666666'}}>Price: </MonoText>
                          <FontAwesome name={'rupee'} size={16} style={{textDecorationLine:'line-through',paddingTop:5}} color={'#f21818'}/>
                          <MonoText   style={{paddingVertical:1,fontSize:16,color:'#000',textDecorationLine:'line-through',color:'#f21818'}}>{item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</MonoText>
                        </View>
                        <View style={{flexDirection:'row',}}>
                          <MonoText   style={{paddingVertical:1,fontSize:16,color:this.state.themeColor}}>Selling Price: </MonoText>
                          <FontAwesome name={'rupee'} size={16} style={{paddingTop:5,paddingLeft:6}}color={this.state.themeColor}/>
                          <MonoText   style={{paddingVertical:1,fontSize:16,color:'#000',color:this.state.themeColor}}>{item.sellingPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</MonoText>
                            </View>
                      </TouchableOpacity>

                    <View style={{borderWidth:0,width:width*0.47,}}>
                        {this.state.enabled==item.enabled &&
                          <Switch
                                value={this.state.enabled==item.enabled?this.state.enabled:item.enabled}
                                onValueChange={(value) => this.ShowAlert(item.pk,item.enabled,index,value)}
                                height={24}
                                width={40}
                                containerStyle={{alignSelf:'flex-end',justifyContent:'flex-end',alignItems:'flex-end',paddingLeft:width*0.12,paddingVertical:2,width:40,height:24,borderWidth:1,borderColor:this.state.themeColor}}
                                backgroundActive={this.state.themeColor}
                                backgroundInactive={'#f7f7f7'}
                                circleActiveColor={'#ffffff'}
                                circleInActiveColor={'#ffffff'}
                                circleBorderWidth={1}
                                circleBorderActiveColor={this.state.themeColor}
                                circleBorderInactiveColor={'#f7f7f7'}
                                outerCircleStyle={{borderColor:this.state.themeColor}}
                              />}
                            {this.state.enabled!=item.enabled &&
                              <Switch
                                  value={this.state.enabled==item.enabled?this.state.enabled:item.enabled}
                                  onValueChange={(value) => this.ShowAlert(item.pk,item.enabled,index,value)}
                                  height={24}
                                  width={40}
                                  containerStyle={{alignSelf:'flex-end',justifyContent:'flex-end',alignItems:'flex-end',paddingLeft:width*0.12,paddingVertical:2,width:40,height:24,borderWidth:1,borderColor:this.state.themeColor}}
                                  backgroundActive={this.state.themeColor}
                                  backgroundInactive={'#f7f7f7'}
                                  circleActiveColor={'#ffffff'}
                                  circleInActiveColor={'#ffffff'}
                                  circleBorderWidth={1}
                                  circleBorderActiveColor={this.state.themeColor}
                                  circleBorderInactiveColor={'#f7f7f7'}
                                  outerCircleStyle={{borderColor:this.state.themeColor}}
                                />}
                    </View>
                  </View> }

                </View>

              </Card>
            )}
          />}</View>}

          {!this.state.keyboardOffset&&
          <View style={{flex:1,marginTop:width*0.01,marginHorizontal:0,borderWidth:0 ,flexDirection:'row',position:'absolute',bottom:0,left:0,right:0}}>
            {this.state.add==true?<TouchableOpacity
                  style={{flex:0.5,alignSelf:'flex-end',borderWidth:1,borderColor:this.state.themeColor,
                          paddingHorizontal:width*0.035,backgroundColor:this.state.themeColor,borderRadius:0}}
                  onPress={()=>this.save(touchdata)}>
                  <MonoText   style={{paddingVertical:width*0.02,fontSize:width*0.037,color:'#fff',textAlign:'center'}}>Save</MonoText>
            </TouchableOpacity>:<TouchableOpacity
                  style={{flex:0.5,alignSelf:'flex-start',borderWidth:1,borderColor:this.state.add==true?'#a39e9f':this.state.themeColor,
                          paddingHorizontal:width*0.035,backgroundColor:this.state.add==true?'#a39e9f':'#ffffff',borderRadius:0}}
                  onPress={()=>{this.Reset()}}>
                  <MonoText   style={{paddingVertical:width*0.02,fontSize:width*0.037,color:this.state.add==true?'#807c7c':this.state.themeColor,textAlign:'center'}}>Reset</MonoText>
            </TouchableOpacity>}

              {this.state.add==true?<TouchableOpacity
                    style={{flex:0.5,alignSelf:'flex-end',borderWidth:1,borderColor:this.state.themeColor,
                            paddingHorizontal:width*0.035,backgroundColor:this.state.themeColor,borderRadius:0}}
                    onPress={()=>this.savedata()}>
                    <MonoText   style={{paddingVertical:width*0.02,fontSize:width*0.037,color:'#fff',textAlign:'center'}}>Add Varients</MonoText>
              </TouchableOpacity>:<TouchableOpacity
                    style={{flex:0.5,alignSelf:'flex-end',borderWidth:1,borderColor:this.state.themeColor,
                            paddingHorizontal:width*0.035,backgroundColor:this.state.themeColor,borderRadius:0}}
                    onPress={()=>this.save(touchdata)}>
                    <MonoText   style={{paddingVertical:width*0.02,fontSize:width*0.037,color:'#fff',textAlign:'center'}}>Save</MonoText>
              </TouchableOpacity>}
          </View>}


        </View>




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
   modalView1:{
     backgroundColor: '#fff',
     marginHorizontal: 0 ,
     borderTopLeftRadius:5,
     borderTopRightRadius:5,
     justifyContent: 'flex-end',
     width:width
   },
   customTagsContainer: {
     flexDirection: "row",
     flexWrap: "wrap",
     alignItems: "flex-start",
     backgroundColor: "#ffffff",
     width: width*1
  },
  customTag: {
    backgroundColor: "#e6e2e2",
    justifyContent: "center",
    alignItems: "center",
    height: 30,
    marginLeft: 5,
    marginTop: 5,
    borderRadius: 30,
    padding: 8
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center"
  },
  header: {
    backgroundColor: "#010101",
    height: 80,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 15,
    marginBottom: 10
  },
  autocompleteContainer: {
    flex: 1,
    backgroundColor:'#ffffff',
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1
  },
  label: {
    color: "#000000",
    fontWeight: "bold",
    marginBottom: 10
  },
  messageContainer: {
    marginTop: 160,
    height: 200,
    alignSelf: "stretch",
    marginLeft: 20,
    marginRight: 20
  },
  message: {
    backgroundColor: "#000000",
    height: 200,
    textAlignVertical: "top"
  }
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

export default connect(mapStateToProps, mapDispatchToProps)(ProductScreen);
