import React,{Component} from 'react';
import {
  Image,Platform,ScrollView,
  StyleSheet,AsyncStorage,ToastAndroid,Keyboard,
  Text,TextInput,Alert,Dimensions,ActivityIndicator,
  TouchableOpacity,LayoutAnimation,KeyboardAvoidingView,
  View,Button,ImageBackground,FlatList,
} from 'react-native';
import { Card } from 'react-native-elements';
import Constants from 'expo-constants';
import { Ionicons ,FontAwesome,MaterialIcons} from '@expo/vector-icons';
import InputView from 'rn-autoheight-input'
import { Dropdown } from 'react-native-material-dropdown-v2';
import { Searchbar } from 'react-native-paper';
import Autocomplete from 'react-native-autocomplete-input';
import settings from '../constants/Settings.js';
import {connect} from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import Modal from 'react-native-modalbox';
import { MonoText } from './StyledText';

const SERVER_URL = settings.url;
const IS_IOS = Platform.OS === 'ios';
const { width } = Dimensions.get('window');
const API = SERVER_URL;
const themeColor = settings.themeColor
// import ThemeUtils from '../components/ThemeUtils';



 class CreateQuote extends Component {

    static navigationOptions=({navigation})=>{
        const { params ={}} = navigation.state
        return{
            title:'Create A Quote',
            headerLeft:(
                <View style={{justifyContent:'flex-start',paddingLeft:15,}}>
                    <TouchableOpacity onPress={()=>{navigation.goBack();}}>
                      <MaterialIcons name="arrow-back" size={30} color={'#fff'}/>
                    </TouchableOpacity>
                </View>
            ),
            headerStyle:{
                backgroundColor:params.themeColor,
            },
            headerTintColor: '#fff'
       }
    }

    constructor (props) {
            super(props);
            var originalData =   props.navigation.getParam('edituser',null);
            if(originalData != null){
              var pkf = {}
              var assignData = Object.assign(pkf,originalData)
            }else{
              var pkf = null
            }
            var reset = props.navigation.getParam('reset',null);
            if(pkf == null){
              var data = {
                  item: null,
                  query: '',
                  count:0,
                  status:false,
                  statuslist:false,
                  list:[],
                  list1:[],
                  text:'',
                  dropdata:[],
                  dataadd:[],
                  listcount:[],
                  add:false,
                  selectedItems:[],
                  productsArr:[],
                  qtyArr:[],
                  selected:null,
                  List:[],
                  Total:[],
                  turmconditions:'',
                  turmcondition:[],
                  csrf:'',
                  sessionid:'',
                  dataSelected:null,
                  turmTitle:'',
                  turmVersion:'',
                  turmBody:'',
                  itemdata:'',
                  coupon:[],
                  coupons:'',
                  dataSelect:null,
                  couponTitle:'',
                  coupondescription:'',
                  couponpercent:'',
                  files:[],
                  mailBody:null,
                  subject:'Quotation',
                  pk:'',
                  value:17407,
                  Save:[],
                  pkitem:[],
                  resetData:null,
                  Save1:[],
                  contact:[],
                  email:'',
                  ttotal:'',
                  selectedTerm : null,
                  selectedCoupon : null,
                }
              }else{
                var subtotal = pkf.data.map((item)=>{
                  return item.subtotal
              })
             var data = {
                item:null,
                query: '',
                resetData:reset,
                count:0,
                status:false,
                statuslist:false,
                list:[],
                list1:[],
                text:'',
                dropdata:[],
                dataadd:[],
                listcount:[],
                add:true,
                selectedItems:[],
                productsArr:[],
                qtyArr:[],
                selected:null,
                List:pkf.data,
                Total:subtotal,
                selectedTerm : JSON.parse(pkf.term).pk,
                turmconditions:pkf.term.title,
                turmcondition:[],
                csrf:'',
                sessionid:'',
                dataSelected:null,
                turmTitle:'',
                turmVersion:'',
                turmBody:'',
                itemdata:'',
                coupon:[],
                selectedCoupon:JSON.parse(pkf.item).coupon,
                coupons:pkf.item.coupon,
                dataSelect:null,
                couponTitle:'',
                coupondescription:'',
                couponpercent:'',
                files:pkf.item.files,
                mailBody:pkf.item.mailBody,
                subject:pkf.item.subject,
                pk:JSON.parse(pkf.item).pk,
                value:pkf.item.value,
                Save:[],
                pkitem:[],
                Save1:[],
                contact:pkf.pkm.pk,
                email:pkf.pkm.email,
              }
            }
            this.state ={
                RefeData:[],
                item: data.item,
                resetData:data.resetData,
                query: data.query,
                count:data.count,
                status:data.status,
                statuslist:data.statuslist,
                list:data.list,
                list1:data.list1,
                text:data.text,
                dropdata:data.dropdata,
                dataadd:data.dataadd,
                listcount:data.listcount,
                add:data.add,
                selectedItems:data.selectedItems,
                productsArr:data.productsArr,
                qtyArr:data.qtyArr,
                selected:data.selected,
                List:data.List,
                turmconditions:data.turmconditions,
                turmcondition:data.turmcondition,
                csrf:data.csrf,
                sessionid:data.sessionid,
                dataSelected:data.dataSelected,
                turmTitle:data.turmTitle,
                turmVersion:data.turmVersion,
                turmBody:data.turmBody,
                itemdata:data.itemdata,
                coupon:data.coupon,
                coupons:data.coupons,
                dataSelect:data.dataSelect,
                couponTitle:data.couponTitle,
                coupondescription:data.coupondescription,
                couponpercent:data.couponpercent,
                files:data.files,
                mailBody:data.mailBody,
                subject:data.subject,
                pk:data.pk,
                value:data.value,
                Save:data.Save,
                pkitem:data.pkitem,
                selectedTerm:data.selectedTerm,
                selectedCoupon:data.selectedCoupon,
                Save1:data.Save1,
                contact:data.contact,
                SERVER_URL:'',
                datalist:[],
                search:false,
                pkf:pkf,
                email:data.email,
                isOpen:false,
                Total:data.Total,
                ttotal:'',
                isOpen2:false,
                subtotal:'',tax:'',
                desc:'',rate:'',
                quantity:'',taxCode:'',
                clickadd:false,
                amount:0,
                couponSend:null,
                termSend:null,
                createProduct:false,
                newRate:0,
                selecetService:'',
                serviceClicked:true,
                serviceResults:[],
                serviceItem:null,
                store:this.props.store,
                isOpen3:false,
              }
          Keyboard.addListener('keyboardDidHide',this.showKeyboard)
          Keyboard.addListener('keyboardDidShow', this.hideKeyboard)
        };

      showKeyboard =()=>{
          this.setState({keyboardOpen : false})
          this.setState({scrollHeight:this.state.scrollHeight+500})
          setTimeout(()=> {
            if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
              return
            }
            this.refs._scrollView.scrollToEnd({animated: true});
            }, 500);
        }

      hideKeyboard =(e)=>{
          this.setState({keyboardOpen : true})
          this.setState({keyboardHeight:e.endCoordinates.height+30});
          try {
            this.setState({scrollHeight:this.state.scrollHeight-500})
          }catch (e) {}
          finally {}
          setTimeout(()=> {
            if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
              return
            }
            this.refs._scrollView.scrollToEnd({animated: true});
          }, 500);
        }

      componentDidMount = async() => {
        this.props.navigation.setParams({
          themeColor:this.state.store.themeColor
        });
          this.userAsync();
          this.getuserAsync();
          const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
          const sessionid = await AsyncStorage.getItem('sessionid');
          const csrf = await AsyncStorage.getItem('csrf');
          this.setState({sessionid:sessionid,csrf:csrf,SERVER_URL:SERVER_URL});
          this.calculate()
      }

      StatusShow = (turmconditions,index) =>{
          if(turmconditions==null && index==null){
            this.setState({turmconditions:'',turmTitle:'',turmVersion:'',turmBody:'',status:false})
            return
          }
          this.setState({turmconditions:this.state.turmcondition[index].value,
                          dataSelected:index,termSend:this.state.turmcondition[index].pk});
          this.setState({turmTitle:this.state.turmcondition[index].title,dataSelected:index});
          this.setState({turmVersion:this.state.turmcondition[index].version,dataSelected:index});
          this.setState({turmBody:this.state.turmcondition[index].body,dataSelected:index});

          this.setState({status: true})
      }

      StatusListShow = (coupons,index) =>{
          if(coupons==null && index==null){
            this.setState({coupons:'',couponTitle:'',coupondescription:'',couponpercent:'',statuslist:false})
            return
          }
          this.setState({coupons:this.state.coupon[index].value,dataSelect:index,couponSend:this.state.coupon[index].pk});
          this.setState({couponTitle:this.state.coupon[index].title,dataSelect:index});
          this.setState({coupondescription:this.state.coupon[index].description,dataSelect:index});
          this.setState({couponpercent:this.state.coupon[index].percentage,dataSelect:index});
          // if(this.state.statuslist == false){
          //   this.setState({statuslist: true})
          // }
          this.setState({statuslist: true})
        }

      statusChange = (arr,selected,fun)=>{
          for (var i = 0; i < arr.length; i++) {
            if(arr[i].pk == selected){
              fun(arr[i],i)
            }else{
              fun(null,null)
            }
          }
        }

    reset = () => {
        this.setState({count:0,item:null,text:'',createProduct:false,serviceItem:null})
        var total = 0

      }


        SaveContinue =  (email,pk) => {
            var dataSend ={
            coupon:this.state.couponSend,
            data:JSON.stringify(this.state.List),
            files:this.state.files,
            mailBody:this.state.mailBody,
            subject:this.state.subject,
            termsAndCondition:this.state.termSend,
            value:this.state.value,
            }
            var List=JSON.stringify(this.state.List);
            var dueDate=null;
            if(this.state.pkf ==  null){
              dataSend.to = email
              dataSend.contact = pk
              fetch(this.state.SERVER_URL+'/api/clientRelationships/contract/', {
                method: 'POST',
                headers: {
                  "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
                  'Content-Type': 'application/json',
                  'X-CSRFToken':this.state.csrf,
                  'Referer':this.state.SERVER_URL,
                  },
                body:JSON.stringify(dataSend),
                }).then((response) =>{
                  if(response.status == '200'||response.status == '201'){
                    Alert.alert('Saved successfully...','',[{text:'ok',onPress:()=>this.props.navigation.navigate('Test',{
                      wentBack: true,
                    })},
                  ], { cancelable: true });
                    return response.json();
                  }
                  else{
                     Alert.alert(error.message);
                   }
                }).then((json) => {
                  this.setState({Save:json});
                })
                .catch((error) => {
                  Alert.alert(error.message);
                });
              }
              else if(this.state.pkf != null){
                var datasSend ={
                  coupon:this.state.coupons,
                  data:JSON.stringify(this.state.List),
                  files:this.state.files,
                  mailBody:this.state.mailBody,
                  subject:this.state.subject,
                  termsAndCondition:this.state.turmconditions,
                  value:this.state.value,
                }
                dataSend.to= this.state.email
                fetch(this.state.SERVER_URL+'/api/clientRelationships/contract/'+this.state.pk+'/', {
                    method: 'PATCH',
                    headers: {
                      "Cookie" :"csrftoken="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
                      'Content-Type': 'application/json',
                      'X-CSRFToken':this.state.csrf,
                      'Referer': this.state.SERVER_URL,
                      },
                    body:JSON.stringify(dataSend),
                    }).then((response) =>{
                      if(response.status == '200'||response.status == '201'){
                        Alert.alert('Updated successfully...','',[{text:'ok',onPress:()=>{this.props.navigation.state.params.onGoBack();this.props.navigation.goBack()}},
                        ], { cancelable: true });
                          return response.json();
                      }
                      else{
                       Alert.alert(error.message);
                     }
                    }).then((json) => {
                      this.setState({Save1:json});
                    })
                    .catch((error) => {
                    Alert.alert(error.message);
                    });
              }else{
            }
        }

      calculate = () =>{
          var total = 0
          for (var i = 0; i < this.state.List.length; i++) {
            var subtotal = (this.state.List[i].quantity)*(this.state.List[i].rate+parseInt(this.state.List[i].rate*this.state.List[i].tax/100))
            total += subtotal
          }
          this.setState({amount:total})
        }

      searchInvoice = () => {
          if(this.state.text.length >= 1 ){
           fetch(this.state.SERVER_URL+'/api/finance/inventory/?name__icontains='+this.state.text, {
             method: 'GET',
             headers: {
              "Cookie" :"csrf="+this.state.csrf+";sessionid=" + this.state.sessionid +";",
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRFToken':this.state.csrf,
              'Referer': this.state.SERVER_URL
             }
           }).then((response) =>{
             if(response.status == '200'){
              return response.json()
             }
           }).then((json) => {
             if(json != undefined && json.length > 0 ){
               this.setState({ list1: json,createProduct:false,count:0})
              this.props.navigation.navigate('DataSearch',{arr:json,onGoBack:this.goback} )
             }else{
               this.setState({createProduct:true,count:1})
              ToastAndroid.show('No Data Found', ToastAndroid.SHORT);
             }
           })
         }else{
           ToastAndroid.show('Enter name', ToastAndroid.SHORT);
         }
    }

    searchkkk = async () =>{
        const SERVER_URL = await AsyncStorage.getItem('SERVER_URL');
        const userToken = await AsyncStorage.getItem('userpk');
        const sessionid = await AsyncStorage.getItem('sessionid');
        const csrf = await AsyncStorage.getItem('csrf');
        const storePk = await AsyncStorage.getItem('storePk');
        this.setState({SERVER_URL:SERVER_URL})
        if(this.state.text.length >= 1 ){
          fetch(SERVER_URL+'/api/finance/inventory/?name__icontains='+this.state.text, {
            method: 'GET',
            headers: {
              "Cookie" :"csrf="+csrf+";sessionid=" + sessionid +";",
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRFToken':csrf,
              'Referer': SERVER_URL
            }
          }).then((response) =>{
            if(response.status == '200'){
              return response.json()
            }
          }).then((json) => {
            if(json.length > 0 ){
              this.props.navigation.navigate('DataSearch',{arr:json,onGoBack:this.goback} )
              this.setState({ list1: json,})
            }else{
              ToastAndroid.show('No Data Found', ToastAndroid.SHORT);
            }
          })
        }else{
          ToastAndroid.show('enter name', ToastAndroid.SHORT);
        }
    }

     goback = (item)=>{
         this.setState({search:true})
         this.setState({item:item})
         this.setState({count:1})
    }

     decreaseCart = ()=>{
         if(this.state.count==0){
           this.setState({count:this.state.count})
           return
         }
         this.setState({count:this.state.count-1})
      }

     increaseCart = ()=>{
        if(this.state.item!=null||this.state.serviceItem!=null){
          this.setState({count:this.state.count+1})
        }else {
          ToastAndroid.show('Add Product', ToastAndroid.SHORT);
          return
        }
      }


     add = () =>{
        var dataadd  =this.state.list1;
        this.setState({add:true});
      }

      serviceAdd = ()=>{
        if(this.state.count == 0){
           ToastAndroid.show('Add  Quantity', ToastAndroid.SHORT);
           return
         }
         if(this.state.serviceItem==null){
           ToastAndroid.show('please add item', ToastAndroid.SHORT);
           return
         }
         this.setState({add:true})
         var currency = 'INR';
         var type = 'onetime';
         var saleType = 'Product';
         var quantity = this.state.count;
         var desc = this.state.text;
         var rate = this.state.newRate;
         var tax = this.state.serviceItem.taxRate;

         var taxCode = this.state.serviceItem.code;
         var totalTax = this.state.count*this.state.serviceItem.taxRate;
         var subtotal=(quantity)*(parseInt(rate)+parseInt(parseInt(rate)*tax/100));
         // (item.quantity)*(item.rate+parseInt(item.rate*item.tax/100))
         var obj = {
           currency:currency,
           type:type,
           tax:parseInt(tax),
           desc:desc,
           rate:parseInt(rate),
           quantity:quantity,
           taxCode:parseInt(taxCode),
           totalTax:parseInt(totalTax),
           subtotal:parseInt(subtotal),
           saleType:saleType,
           }
           var arr = this.state.List
           arr.push(obj)
           this.setState({List:arr,createProduct:false,serviceItem:null,selecetService:'',newRate:0,count:0,text:''})
           this.calculate()
      }

     addGoodss = () =>{
       if(this.state.count == 0){
          ToastAndroid.show('Add  Quantity', ToastAndroid.SHORT);
          return
        }
       if(this.state.count != 0){
            this.setState({add:true})
            var currency = 'INR';
            var type = 'onetime';
            var saleType = 'Service';
            var pk = this.state.item.pk;
            var quantity = this.state.count;
            var qtyAdded = this.state.item.qtyAdded;
            var desc = this.state.item.desc;
            var rate = this.state.item.rate;
            var tax = this.state.item.tax;
            var taxCode = this.state.item.taxCode;
            var totalTax = this.state.count*this.state.item.tax;
            var total=this.state.item.rate*this.state.count;
            var subtotal=(this.state.count)*(this.state.item.rate+parseInt(this.state.item.rate*this.state.item.tax/100));
            var obj = {
              currency:currency,
              type:type,
              tax:tax,
              desc:desc,
              rate:rate,
              quantity:quantity,
              taxCode:taxCode,
              totalTax:totalTax,
              subtotal:subtotal,
              saleType:saleType,
              total:total,
              pk:pk,
              qtyAdded:qtyAdded
              }
              this.setState({subtotal:subtotal,quantity:quantity,desc:desc})
              this.setState({taxCode:taxCode,rate:rate,tax:tax})
              if(this.state.pkf!= null){
                var finalTotal = 0
                for (var i = 0; i < this.state.List.length; i++) {
                  if(this.state.List[i].pk == this.state.item.pk){
                    this.state.List[i].quantity = this.state.count
                    this.state.Total.push({total:this.state.List[i].subtotal})
                    var a = this.state.Total
                    var ttotal=0
                    for (var i=0; i < a.length; i++) {
                          ttotal += a[i].total;
                      }
                      this.setState({ttotal:ttotal})
                      this.setState({add:true,item:null,clickadd:false,count:0,createProduct:false,serviceItem:null})
                      this.calculate()
                      this.setState({List:this.state.List})
                    return
                  }
                }
              var arr = this.state.List
                arr.push(obj)
                this.setState({add:true,count:0,})
                this.setState({holder:'',holder1:''})
                this.setState({search:false})
                this.setState({text:''})
                this.setState({clickadd:false})
                this.setState({List:arr})

                this.state.Total.push({total:obj.subtotal})
                var a = this.state.Total
                var ttotal=0
                for (var i=0; i < a.length; i++) {
                      ttotal += a[i].total;
                  }this.setState({ttotal:ttotal})
              }else{
              for (var i = 0; i < this.state.List.length; i++) {
                if(this.state.List[i].pk == this.state.item.pk){
                  this.state.List[i].quantity = this.state.count
                  this.state.Total.push({total:this.state.List[i].subtotal})
                  var a = this.state.Total
                  var ttotal=0
                  for (var i=0; i < a.length; i++) {
                        ttotal += a[i].total;
                    }this.setState({ttotal:ttotal})
                    this.setState({add:true,item:null,clickadd:false,count:0,createProduct:false,serviceItem:null})
                    this.calculate()
                  return
                }
              }
            var arr = this.state.List
              arr.push(obj)
              this.setState({add:true,count:0,})
              this.setState({holder:'',holder1:''})
              this.setState({search:false})
              this.setState({text:''})
              this.setState({clickadd:false})
              this.setState({List:arr})
              this.state.Total.push({total:obj.subtotal})
              var a = this.state.Total
              var ttotal=0
              for (var i=0; i < a.length; i++) {
                    ttotal += a[i].total;
                }this.setState({ttotal:ttotal})
              }
            this.setState({add:true,item:null,clickadd:false,createProduct:false,serviceItem:null})
            this.calculate()
          }
          else
          {
            this.setState({add:false,item:null,clickadd:false})
            this.calculate()
          }
     }



     Delete(item,index){
         var arr = this.state.List
         this.setState({resetList:arr})
         arr.splice(index,1)
         if(arr.length > 0){
           this.setState({List:arr})
           var stotal = ''
           stotal= this.state.ttotal-this.state.subtotal
           this.setState({ttotal:stotal})
         }else{
           this.setState({List:[],add:false})
           var stotal = ''
           stotal= this.state.ttotal-this.state.subtotal
           this.setState({ttotal:stotal})
         }
         this.calculate()
         this.setState({item:null})
       }

       hideadd(item,index){
         this.Delete(item,index)
         this.setState({clickadd:true,search:false,count:item.quantity,text:'',item:item})
         var stotal = ''
         stotal= this.state.ttotal-this.state.subtotal
         this.setState({ttotal:stotal})
     }

     searchService = (text)=>{
       this.setState({ selecetService: text })
       if(text.length >0){
        fetch(this.state.SERVER_URL+'/api/clientRelationships/productMeta/?description__icontains=' +text,{
          headers: {
             "Cookie" :"sessionid=" + this.state.sessionid +";",
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'Referer': this.state.SERVER_URL,
          }
          })
        .then((response) =>{
          if(response.status == '200' || response.status == 200){
            return response.json()
          }
          return
        })
        .then((responseJson) => {
          if(responseJson == undefined){
            return
          }
           this.setState({
             serviceResults:responseJson,
             serviceClicked:false,
           });
         })
         .catch((error) => {
           return
         });
     }
   }

   searchServiceQuery(query) {
     if (query === '') {
         return [];
       }
     const { serviceResults } = this.state;
     return serviceResults;
   }

  render(){
      const pkitem =   this.props.navigation.getParam('user',null);
      let email = pkitem!=null ?pkitem.email:'';
      let pkContact = pkitem!=null ?pkitem.pk:'';
      let turmconditions=this.state;
      let data = [{value: 'yttyt'},  {value: 'new terms'}];
      let datalist = [{value: 'none-0'},  {value: 'some-10'},  {value: 'New Discount-20'}];
      const { text } = this.state;
      const { selecetService } = this.state;
      const serviceResults = this.searchServiceQuery(selecetService);

  // const list = this._filterData(text);
  // const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
      return(
        <View style={[styles.container,{}]}>
            <View style={{flex:0.25,marginTop:10,marginHorizontal:width*0.04}}>
                <View style={{flex:1,flexDirection:'column',marginTop:8,}}>
                      <View style={{flex:0.8}}>
                          {this.state.clickadd ==true ?
                            <TextInput style={{backgroundColor:'#fafdff',paddingHorizontal:20,height:35,borderWidth:1,borderColor:'#f1f1f1'}}
                                onChangeText={(text) => this.setState({text})}
                                placeholder={'Enter Mobile No'}
                                editable={false}
                                value={this.state.text}>
                            </TextInput>:
                            <TextInput style={{backgroundColor:'#fafdff',paddingHorizontal:20,height:35,borderWidth:1,borderColor:'#f1f1f1'}}
                                onChangeText={(text) => this.setState({text})}
                                placeholder={'Enter Mobile No'}
                                value={this.state.text}>
                            </TextInput>
                          }
                      </View>
                </View>
                <View style={{flex:1,flexDirection:'column',marginTop:10,}}>
                  <TextInput style={{backgroundColor:'#fafdff',paddingHorizontal:20,height:35,borderWidth:1,borderColor:'#f1f1f1'}}
                      onChangeText={(text) => this.setState({text})}
                      placeholder={'Enter Name'}
                      editable={false}
                      value={this.state.text}>
                  </TextInput>
                </View>
                <TouchableOpacity style={{flex:1,flexDirection:'column',marginTop:10,}} onPress={()=>{this.setState({isOpen3:true})}}>
                <MonoText   style={{fontSize:14,color:'#5bb3ec'}}>Show more..</MonoText>
                </TouchableOpacity>
           </View>
           <View style={{flex:0.15,marginTop:5,marginHorizontal:width*0.04}}>
                {/* <MonoText   style={{fontSize:16}}>Description / Product Name</MonoText>  */}
                <View style={{flex:1,flexDirection:'row',marginTop:0,}}>
                    <View style={{flex:0.8}}>
                        {this.state.clickadd ==true ?
                          <TextInput style={{backgroundColor:'#fafdff',paddingHorizontal:20,height:35,borderWidth:1,borderColor:'#f1f1f1'}}
                              onChangeText={(text) => this.setState({text})}
                              placeholder={'Enter products name'}
                              editable={false}
                              value={this.state.text}>
                          </TextInput>:
                          <TextInput style={{backgroundColor:'#fafdff',paddingHorizontal:20,height:35,borderWidth:1,borderColor:'#f1f1f1'}}
                              onChangeText={(text) => this.setState({text})}
                              placeholder={'Enter products name'}
                              value={this.state.text}>
                          </TextInput>
                        }
                    </View>
                    <View style={{flex:0.2,}}>
                        <TouchableOpacity style={{backgroundColor:themeColor,borderColor:'#f1f1f1',borderWidth:1,height:35,paddingVertical:5}}   onPress={()=>this.searchInvoice()}>
                            <MonoText   style={{color:'#fff',fontSize:16,alignSelf:'center'}}>Search</MonoText>
                        </TouchableOpacity>
                    </View>
              </View>
         </View>
         {this.state.createProduct&&
           <View style={{flex:0.2,marginHorizontal:width*0.04 }}>
               <View style={{flex:1,marginBottom:10}}>
                   <MonoText   style={{color:'#000',fontSize:16,marginBottom:5}}>Service class</MonoText>
                   <Autocomplete
                      style={{backgroundColor:'#fafdff',paddingHorizontal:20,height:35,borderWidth:1,borderColor:'#f1f1f1'}}
                      keyboardShouldPersistTaps='always'
                      data={serviceResults }
                      hideResults={this.state.serviceClicked}
                      defaultValue={selecetService}
                      onChangeText={(text) =>{ this.searchService(text)}}
                      placeholder="Search By Service"
                      listContainerStyle={styles.listContainerStyle}
                      listStyle={styles.listStyle}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) =>{
                        return (
                        <TouchableOpacity
                          style={{flex: 1,margin:0,padding:5,width:'100%',}}
                          onPress={() => {this.setState({selecetService: item.description,serviceClicked:true,serviceItem:item })}}>
                          <MonoText   style={{fontSize: 15,color:'#000000'}}>
                            {item.description}
                          </MonoText>
                        </TouchableOpacity>
                      )}
                    }
                    />
              </View>
              <View style={{flex:1}}>
                   <MonoText   style={{color:'#000',fontSize:16,}}>Rate</MonoText>
                   <TextInput style={{backgroundColor:'#fafdff',paddingHorizontal:20,height:35,borderWidth:1,borderColor:'#f1f1f1'}}
                       onChangeText={(text) => this.setState({newRate:text})}
                       placeholder={'Enter Rate'}keyboardType='numeric'
                       value={this.state.newRate}>
                   </TextInput>
              </View>
           </View>
          }
          <View style={{flex:this.state.createProduct?0.65:0.85,}}>
             <ScrollView style={{flex:1}}>
                {this.state.item!=null&&
                  <View  style={[ {  borderWidth: 1,borderColor: 'transparent',borderRadius: 7,marginHorizontal:width*0.05  }]}>
                      <MonoText   style={{}}>{this.state.item.desc} </MonoText>
                      <MonoText   style={{marginTop:2}}>Rate :{this.state.item.rate} </MonoText>
                      {this.state.clickadd==true?<MonoText   style={{marginTop:2}}>Quantity : {this.state.item.quantity} </MonoText> :<MonoText   style={{marginTop:2}}>Available Quantity : {this.state.item.qtyAdded} </MonoText>
                    }
                    <MonoText   style={{marginTop:2}}>Tax Rate :{parseInt(this.state.item.tax/100*this.state.item.rate)}({this.state.item.tax}%) </MonoText>
                 </View>
                }
               <View style={{flex:1,flexDirection:'row',marginHorizontal:width*0.05,marginTop:20}}>
                    <View style={{flex:0.6,flexDirection:'row',justifyContent:'flex-start'}}>
                        <TouchableOpacity onPress={(idx)=>{this.decreaseCart(idx)}} activeOpacity={1}>
                            <View style={{flexDirection:'row',justifyContent:'center',backgroundColor:themeColor,width:30,alignItems:'center'}}>
                                <MonoText   style={{ color:'white',fontSize:22}} >-</MonoText>
                            </View>
                        </TouchableOpacity>
                        <MonoText   style = {{marginLeft:20,fontSize:22}}>{this.state.count}</MonoText>
                        <TouchableOpacity onPress={(idx)=>{this.increaseCart(idx)}} activeOpacity={1} style={{marginLeft:20}} >
                            <View style={{flexDirection:'row',justifyContent:'center',backgroundColor:themeColor,
                                          width:30,alignItems:'center'}}>
                                <MonoText   style={{ color:'white',fontSize:22}} >+</MonoText>
                            </View>
                        </TouchableOpacity>
                   </View>
                   <View style={{flex:0.4,flexDirection:'row',justifyContent:'flex-end'}}>
                      <TouchableOpacity style={{backgroundColor:themeColor,marginRight:4,}}  onPress={() =>{if(this.state.createProduct){this.serviceAdd()}else{this.addGoodss()}} } >
                          <MonoText   style={{color:'#fff',fontSize:16,paddingHorizontal:7,paddingVertical:4}}>Add +</MonoText>
                      </TouchableOpacity>
                      <TouchableOpacity style={{backgroundColor:'#ff0000'}}  onPress={() =>{this.reset()}} >
                          <MonoText   style={{color:'#fff',fontSize:16,paddingHorizontal:7,paddingVertical:4}}>Reset</MonoText>
                      </TouchableOpacity>
                   </View>
               </View>
               <View style={{flex:1,flexDirection:'row',}}>
                    <ScrollView horizontal={true}
                        showsHorizontalScrollIndicator={false}>
                        <View style={{flexDirection:'row',}}>
                          {<FlatList
                              data={this.state.List}
                              extraData={this.state}
                              horizontal={true}
                              nestedScrollEnabled={true}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({item, index})=>(
                              <TouchableOpacity onPress={()=>this.hideadd(item,index)}>
                                  <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center',marginTop: 15,marginLeft:width*0.05,marginRight:this.state.List.length == index+1?width*0.05:0,borderWidth:0.5,paddingHorizontal:10,paddingVertical:10,borderRadius:7,width:width*0.8,backgroundColor:'#fff'}}>
                                        <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start',fontSize:24}}>
                                            <MonoText   style={{paddingBottom:2}}>{item.desc}</MonoText>
                                            <MonoText   style={{paddingVertical:2}}>Rate :  {item.rate} + {parseInt(item.tax/100*item.rate)}({item.tax==''?0:item.tax}%) =  {item.rate+parseInt(item.rate*item.tax/100)}</MonoText>
                                            <MonoText   style={{paddingVertical:2}}>Quantity :  {item.quantity}</MonoText>
                                            <MonoText   style={{alignSelf:'flex-start',}}>Sub Total :  {(item.quantity)*(item.rate+parseInt(item.rate*item.tax/100))}</MonoText>
                                            <View style={{flexDirection:'row',justifyContent:'flex-end',borderWidth:0,width:width*0.75}}>
                                                  <TouchableOpacity
                                                      style={{alignSelf:'flex-end',justifyContent:'flex-end',
                                                            alignItems:'flex-end'}}>
                                                      <Ionicons name='md-trash' size={24} onPress={()=>this.Delete(item,index)} style={{alignSelf:'flex-end',justifyContent:'flex-end',alignItems:'flex-end'}}/>
                                                  </TouchableOpacity>
                                            </View>
                                        </View>
                                  </View>
                              </TouchableOpacity> )}
                              />
                              }
                       </View>
                   </ScrollView>
               </View>
               <View style={{flexDirection:'row',marginTop:15,marginHorizontal:width*0.04 }}>
                    <Dropdown
                        data={this.state.turmcondition}
                        onChangeText={(turmconditions,index)=>{ this.StatusShow(turmconditions,index)}}
                        value={this.state.turmconditions}
                        dropdownOffset={{top:0}}
                        containerStyle={{ borderWidth:0.2,paddingLeft:10,height:35,backgroundColor:'#fafdff',
                                          justifyContent:'center',borderColor:'#f1f1f1',paddingTop:4,width:width*0.8}}
                        rippleCentered={true}
                        inputContainerStyle={{ borderBottomColor: 'transparent',fontSize:20 }}
                        pickerStyle={{  borderRadius:10,marginTop:width*0.12,paddingHorizontal:20,
                                        width:width*0.5,marginLeft:width*0.4,marginRight:width*0.1}}
                    />
                    <TouchableOpacity style={{alignSelf:'flex-end',justifyContent:'flex-end',alignItems:'flex-end',
                                              backgroundColor:'transparent',marginLeft:10}}>
                          <FontAwesome
                              name='list-ul'
                              size={20}
                              color={themeColor}
                              onPress={()=>this.setState({ isOpen: true })}
                              style={{justifyContent:'center',padding:6}}/>
                    </TouchableOpacity>
              </View>
              <View style={{flexDirection:'row',marginTop:15,marginHorizontal:width*0.04}}>
                  <Dropdown
                      data={this.state.coupon}
                      onChangeText={(coupons,index)=>{ this.StatusListShow(coupons,index)}}
                      value={this.state.coupons}
                      dropdownOffset={{top:0}}
                      containerStyle={{ borderWidth:0.4,paddingLeft:10,height:35,
                                        backgroundColor:'#fafdff',justifyContent:'center',
                                        borderColor:'#f1f1f1',paddingTop:4,width:width*0.8}}
                      rippleCentered={true}
                      inputContainerStyle={{ borderBottomColor: 'transparent',fontSize:20 ,}}
                      pickerStyle={{ borderRadius:10,marginTop:width*0.12,paddingHorizontal:20,
                                     width:width*0.5,marginLeft:width*0.4,marginRight:width*0.1}}
                  />
                  <TouchableOpacity
                      style={{alignSelf:'flex-end',justifyContent:'flex-end',
                              alignItems:'flex-end',backgroundColor:'transparent',marginLeft:10}}>
                     <FontAwesome
                          name='info-circle'
                          size={24} color={themeColor}
                          onPress={()=>this.setState({ isOpen2: true })}
                          style={{justifyContent:'center',padding:6}}/>
                  </TouchableOpacity>
              </View>
           </ScrollView>
         </View>
          <Modal
              style={styles.modal3}
              position={'center'}
              ref={'modal3'}
              isOpen={this.state.isOpen}
              onClosed={()=>{this.setState({isOpen:false})}}>
              <TouchableOpacity
                    style={{alignSelf:'flex-end',marginRight:10,paddingTop:10}}
                    onPress={()=>this.setState({ isOpen: false })}>
                    <MonoText>X</MonoText>
              </TouchableOpacity>
              { this.state.status == false ?
                <View>
                <MonoText>empty data.please select data</MonoText>
                </View>:
                    <View style={{paddingHorizontal:15,margin:10}}>
                        <View style={{flexDirection:'row',}}>
                              <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>Title:- </MonoText>
                              <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}> {this.state.turmTitle} </MonoText>
                        </View>
                        <View style={{flexDirection:'row',}}>
                              <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>Version:- </MonoText>
                              <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}> {this.state.turmVersion}</MonoText>
                        </View>
                        <View style={{flexDirection:'row',paddingHorizontal:10}}>
                            <FlatList
                              data={this.state.turmBody.split('||')}
                              keyExtractor={(item) => item.toString()}
                              renderItem={({item, index, separators}) => (
                                 <View style={{flexDirection:'row',paddingRight:5,paddingLeft:2}}>
                                     <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>{index+1}. </MonoText>
                                     <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16,paddingHorizontal:10}}>  {item}</MonoText>
                                </View>
                              )}
                            />
                        </View>
                  </View>}
            </Modal>
            <Modal
                 style={styles.modal3}
                 position={'center'}
                 ref={'modal3'}
                 isOpen={this.state.isOpen2}
                 onClosed={()=>{this.setState({isOpen2:false})}}>
                 <TouchableOpacity
                     style={{alignSelf:'flex-end',marginRight:10,paddingTop:10}}
                     onPress={()=>this.setState({ isOpen2: false })}>
                     <MonoText>X</MonoText>
                 </TouchableOpacity>
                <View style={{paddingHorizontal:20}}>
                     <View style={{flexDirection:'row',}}>
                           <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>H:- </MonoText>
                           <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}> {this.state.couponTitle}</MonoText>
                         </View>
                         <View style={{flexDirection:'row',}}>
                           <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>i: </MonoText>
                           <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}> {this.state.coupondescription}</MonoText>
                         </View>
                         <View style={{flexDirection:'row',}}>
                           <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>%</MonoText>
                           <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>{this.state.couponpercent}</MonoText>
                         </View>
               </View>
           </Modal>

            <Modal
                 style={styles.modal33}
                 isOpen={this.state.isOpen3}
                 onClosed={()=>{this.setState({isOpen3:false})}}
                 >
                 <TouchableOpacity style={{alignSelf:'flex-end',marginRight:10,paddingTop:10}}onPress={()=>this.setState({ isOpen3: false })}>
                  <MonoText>X</MonoText>
                 </TouchableOpacity>
                 {this.state.statuslist == false ?
                   <View>
                   <MonoText>empty data.please select data</MonoText>
                   </View>:
                   <View style={{paddingHorizontal:20}}>
                       <View style={{flexDirection:'row',}}>
                             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>Name </MonoText>
                             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}> Name</MonoText>
                           </View>
                           <View style={{flexDirection:'row',}}>
                             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>MobileNo </MonoText>
                             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>6346573434</MonoText>
                           </View>
                           <View style={{flexDirection:'row',}}>
                             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>Address</MonoText>
                             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>AddressAddressAddress</MonoText>
                           </View>
                  </View>}
              </Modal>

              <View style={{flex:1,borderWidth:0,flexDirection:'row',backgroundColor: '#fafdff',
                            position:'absolute',height:50,bottom:0,left:0,width:width}}>
                  <View style={{flex:0.5,}}>
                      <View style={{flex:1,marginLeft:width*0.05,flexDirection: 'row',paddingVertical:14}}>
                          <FontAwesome name='rupee' size={22} />
                          <MonoText   style={{fontSize:18,marginLeft:3}}>{this.state.amount}</MonoText>
                      </View>
                  </View>
                  <View style={{flex:0.5,justifyContent: 'center',alignItems: 'flex-end'}}>
                      <TouchableOpacity
                            style={{backgroundColor:'#fb8a05',borderRadius:50,marginRight:width*0.05,
                                    paddingVertical: 6,paddingHorizontal:10}}
                            onPress={()=>this.SaveContinue(email,pkContact)}>
                            <MonoText   style={{fontSize:18,color:'#ffffff',}}> Create </MonoText>
                      </TouchableOpacity>
                </View>
            </View>
        </View>
    );
  }
}

const styles=StyleSheet.create({
  container: {
      flex:1,
      margin:0,
      backgroundColor: '#ececec',
      padding:0,
  },
  root: {
      flex: 1,
      paddingTop: 0,
      backgroundColor:'#eee',
      flexDirection: 'column',
      justifyContent: 'flex-start',
  },
  infoText: {
      textAlign: 'center',
      fontSize: 16,
    },
  itemText: {
      fontSize: 15,
      paddingTop: 5,
      paddingBottom: 5,
      margin: 2,
   },
  titleText: {
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 10,
      marginTop: 10,
      textAlign: 'center'
    },
  directorText: {
      color: 'grey',
      fontSize: 12,
      marginBottom: 10,
      textAlign: 'center'
    },
  openingText: {
      textAlign: 'center'
    },
  labelStyle: {
      fontSize: 18,
      paddingLeft: 20,
      flex: 1
    },
  acContainerStyle: {
      right: 0,
      top: 102,
      width: '72%',
      flex: 1,
      position: 'absolute',
      zIndex: 10
    },
  modal: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal33: {
      backgroundColor: '#fff',
      marginLeft: width*0 ,
      marginRight:width*0.05,
      borderRadius:5,
      width:width*0.85
   },
   listContainerStyle:{
       margin:0,
       padding:0,
       backgroundColor: '#fff',
       zIndex: 99,
   },
   listStyle:{
     margin:0,
     paddingLeft:4,
     borderWidth:1,
     borderColor: '#f2f2f2',
     backgroundColor: '#f2f2f2',
     zIndex: 99,
     height:200
   }
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
      emptyCartFunction:()=>dispatch(actions.emptyCart()),


    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(CreateQuote)

// { pkf != null && this.state.add == true &&
//       <ScrollView horizontal={true}
//         showsHorizontalScrollIndicator={false}>
//         <View style={{flexDirection:'row',marginLeft:40}}>
//       {<FlatList
//           data={this.state.RefeData}
//           extraData={this.state}
//           horizontal={true}
//           nestedScrollEnabled={true}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={({item, index})=>(
//             <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center',marginTop: 15,marginLeft:15,borderWidth:1,paddingHorizontal:10,paddingVertical:10,borderRadius:7,width:width*0.8}}>
//               <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start',fontSize:24}}>
//                 <View style={{flexDirection:'row',justifyContent:'space-between',borderWidth:0,width:width*0.75}}>
//                   <MonoText   style={{alignSelf:'flex-start',}}>Name: {item.desc}</MonoText>
//                   <TouchableOpacity style={{alignSelf:'flex-end',justifyContent:'flex-end',alignItems:'flex-end'}}>
//                     <Ionicons name='md-trash' size={24} onPress={()=>this.Delete(item,index)} style={{alignSelf:'flex-end',justifyContent:'flex-end',alignItems:'flex-end'}}/>
//                   </TouchableOpacity>
//
//                 </View>
//                 <MonoText>Rate: {item.rate} + {parseInt(item.tax/100*item.rate)}({item.tax==''?0:item.tax}%) =  {item.rate+parseInt(item.rate*item.tax/100)}</MonoText>
//                   <MonoText>Quantity: {item.quantity}</MonoText>
//                   <MonoText>Sub Total : {(item.quantity)*(item.rate+parseInt(item.rate*item.tax/100))}</MonoText>
//               </View>
//             </View> )}
//           />
//       }
//   </View>
//   </ScrollView>
// }

// { this.state.statuslist ?<View style={{paddingLeft:20}}>
//       <View style={{flexDirection:'row',}}>
//             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>H:- </MonoText>
//             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}> {this.state.couponTitle}</MonoText>
//           </View>
//           <View style={{flexDirection:'row',}}>
//             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>i: </MonoText>
//             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}> {this.state.coupondescription}</MonoText>
//           </View>
//           <View style={{flexDirection:'row',}}>
//             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>%</MonoText>
//             <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>{this.state.couponpercent}</MonoText>
//           </View>
// </View>: null}

// { this.state.status ? <View style={{paddingLeft:20}}>
//         <View style={{flexDirection:'row',}}>
//           <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>Title:- </MonoText>
//           <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}> {this.state.turmTitle} </MonoText>
//         </View>
//         <View style={{flexDirection:'row',}}>
//           <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>Version:- </MonoText>
//           <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}> {this.state.turmVersion}</MonoText>
//         </View>
//         <View style={{flexDirection:'row',paddingLeft:10}}>
//             <FlatList
//                  data={this.state.turmBody.split('||')}
//                  keyExtractor={(item) => item.toString()}
//                 renderItem={({item, index, separators}) => (
//                   <View style={{flexDirection:'row',paddingLeft:10}}>
//                     <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>{index+1}. </MonoText>
//                  <MonoText   style={{paddingTop:6,paddingBottom:2,fontSize:16}}>  {item}</MonoText>
//                    </View>
//            )}
//            />
//         </View>
//   </View>: null}
// height:width*0.85,


// <FlatList
//   data={this.state.List}
//   extraData={this.state}
//   horizontal={true}
//   nestedScrollEnabled={true}
//   keyExtractor={(item, index) => index.toString()}
//   renderItem={({item, index})=>(
//     <View  style={[ {  borderWidth: 1,borderColor: 'transparent',borderRadius: 7,marginHorizontal:ThemeUtils.relativeWidth(5) }]}>
//       <MonoText   style={{}}>{this.state.desc} </MonoText>
//       <MonoText   style={{marginTop:2}}>Rate : {this.state.rate} </MonoText>
//       <MonoText   style={{marginTop:2}}>Available Quantity : {this.state.quantity} </MonoText>
//       <MonoText   style={{marginTop:2}}>Tax Rate : ({this.state.tax}) </MonoText>
//     </View>
//   )}
// />


// {this.state.search ==true&&this.state.item != null &&
//       <View  style={[ {  borderWidth: 1,borderColor: 'transparent',borderRadius: 7,marginHorizontal:ThemeUtils.relativeWidth(5)  }]}>
//         <MonoText   style={{}}>{this.state.item.desc} </MonoText>
//         <MonoText   style={{marginTop:2}}>Rate :{this.state.item.rate} </MonoText>
//         <MonoText   style={{marginTop:2}}>Available Quantity :{this.state.item.qtyAdded} </MonoText>
//         <MonoText   style={{marginTop:2}}>Tax Rate :{parseInt(this.state.item.tax/100*this.state.item.rate)}({this.state.item.tax}%) </MonoText>
//       </View>
// }
// {this.state.clickadd == true && this.state.search == false &&this.state.item!=null&&
//   <View  style={[ {  borderWidth: 1,borderColor: 'transparent',borderRadius: 7,marginHorizontal:ThemeUtils.relativeWidth(5)  }]}>
//     <MonoText   style={{}}>{this.state.item.desc} </MonoText>
//     <MonoText   style={{marginTop:2}}>Rate :{this.state.item.rate} </MonoText>
//     <MonoText   style={{marginTop:2}}>Available Quantity :{this.state.item.qtyAdded} </MonoText>
//     <MonoText   style={{marginTop:2}}>Tax Rate :{parseInt(this.state.item.tax/100*this.state.item.rate)}({this.state.item.tax}%) </MonoText>
//   </View>
//
// }

// <TouchableOpacity style={{backgroundColor:'#61080e'}}  onPress={() =>this.setState({List:[]})} >
//   <MonoText   style={{color:'#fff',fontSize:16,paddingHorizontal:7,paddingVertical:4}}>Reset</MonoText>
// </TouchableOpacity>


// var arr = []
// if(this.state.resetData == null){
//   this.setState({count:0,item:null,List:[],amount:0})
//   return
// }
// for (var i = 0; i < this.state.resetData.reset.length; i++) {
//   arr.push(this.state.resetData.reset[i])
// }
// for (var i = 0; i < arr.length; i++) {
//  var subtotal = (arr[i].quantity)*(arr[i].rate+parseInt(arr[i].rate*arr[i].tax/100))
//  total += subtotal
// }
// this.setState({amount:total})
// this.statusChange(this.state.turmcondition,this.state.selectedTerm,this.StatusShow)
// this.statusChange(this.state.coupon,this.state.selectedCoupon,this.StatusListShow)
