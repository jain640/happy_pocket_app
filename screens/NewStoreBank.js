import React,{Component} from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,TextInput,Alert,Dimensions,AsyncStorage,Keyboard,
  TouchableOpacity,LayoutAnimation,KeyboardAvoidingView,
  View,Button,ImageBackground,FlatList,ToastAndroid,Picker
} from 'react-native';
import { Card,SearchBar} from 'react-native-elements';
import Constants from 'expo-constants';
import { Ionicons ,FontAwesome} from '@expo/vector-icons';
import { Dropdown } from 'react-native-material-dropdown-v2';
import * as DocumentPicker from 'expo-document-picker';
import * as Permissions from 'expo-permissions';
import Modal from 'react-native-modalbox';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import settings from '../constants/Settings';
import Loader from '../components/Loader'
const IS_IOS = Platform.OS === 'ios';
const { width } = Dimensions.get('window');
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';

const bankType = [ 'saving','current']




class NewStoreBank extends Component {
    constructor (props) {
        super(props);
        const predata = this.props.navigation.getParam('user',null);
        console.log(predata,'predata');
        this.state ={
            store:this.props.store,
            themeColor:this.props.store.themeColor,
            bankaccno:'',
            ifsctext:'',
            bankname:props.bankList[0],
            accountType:bankType[0],
            storenametext:predata.storenametext,
            mobilenumber:predata.mobilenumber.toString(),
            pincode:predata.pincode.toString(),
            image:predata.image,
            banner:predata.banner,
            gstintext:predata.gstintext,
            email:predata.email,
            address:predata.address,
            state:predata.state,
            city:predata.city,
            country:predata.country,
            description:predata.description,
            industryType:predata.industryType,
            businessType:predata.businessType,
            minimumOrdervalue:predata.minimumOrdervalue,
            establishmentYear:predata.establishmentYear,
            industryTypePk:predata.industryTypePk,
            keyboardOpen:false,
            keyboardOffset:0,
            bankList:props.bankList,
            accountTypes:['current','saving'],
            loadingVisible:false,
            accountHolderName:'',
            saveButtonDisable:false,
        }
        Keyboard.addListener('keyboardDidHide',this.keyboardDidHide)
        Keyboard.addListener( 'keyboardDidShow', this.keyboardDidShow)
    };

    keyboardDidShow=(event)=> {
          this.setState({
              keyboardOffset: event.endCoordinates.height+27,
              keyboardOpen:true,
          })
      }

      keyboardDidHide=()=> {
          this.setState({
              keyboardOffset: 27,
              keyboardOpen:false,
          })
    }

     static navigationOptions=({navigation})=>{
        const { params ={} }=navigation.state
        return{
          title:'Create New Store',
          headerLeft:(
            <View style={{justifyContent:'flex-start',paddingLeft:15,}}>
                <TouchableOpacity onPress={()=>{navigation.openDrawer();}}>
                  <FontAwesome name={'bars'} size={22} color={'#fff'}/>
                </TouchableOpacity>
            </View>
          ),
          headerStyle:{
              backgroundColor:params.themeColor,
              marginTop:Platform.OS==='android'?Constants.statusBarHeight:0
          },
          headerTintColor: '#fff',
        }
     }

     componentDidMount=async()=>{
        this.props.navigation.setParams({
          themeColor:this.state.store.themeColor
        })
    }

    save=async()=>{
      this.setState({loadingVisible:true,saveButtonDisable:true});
        if(this.state.accountHolderName.length==0){
          this.setState({saveButtonDisable:false});
          this.refs.toast.show('Please enter account holder name.');
          return;
        }
        if(this.state.bankaccno.length>5){
          this.setState({loadingVisible:false,saveButtonDisable:false});
          this.refs.toast.show('Please enter correct bank account number(minimum 5 digits)');
          return;
        }
        if(this.state.ifsctext.length==0){
          this.setState({loadingVisible:false,saveButtonDisable:false});
          this.refs.toast.show('Please enter ifsc number');
          return;
        }

        var csrf = await AsyncStorage.getItem('csrf');
        var pk =  await AsyncStorage.getItem('userpk');
        const sessionid = await AsyncStorage.getItem('sessionid');
        if(csrf!=null&&sessionid!=null){
        var formdata = new FormData();
            formdata.append("name",this.state.storenametext);
            formdata.append("mobile",this.state.mobilenumber);
            formdata.append("email",this.state.email);
            formdata.append("address",this.state.address);
            formdata.append("pincode",this.state.pincode);
            formdata.append("gstin",this.state.gstintext);
            formdata.append("state",this.state.state);
            formdata.append("city",this.state.city);
            formdata.append("country",this.state.country);
            formdata.append("pos",false);
            formdata.append("cod",false);
            formdata.append("rating",false);
            formdata.append("filter",false);
            formdata.append("categoryBrowser",false);
            formdata.append("payPal",false);
            formdata.append("paytm",false);
            formdata.append("payU",false);
            formdata.append("ccAvenue",false);
            formdata.append("googlePay",false);
            formdata.append("accountHolderName",this.state.accountHolderName);
            formdata.append("bankaccountNumber",this.state.bankaccno);
            formdata.append("ifsc",this.state.ifsctext);
            formdata.append("bankName",this.state.bankname);
            formdata.append("bankType",this.state.accountType);
            formdata.append("logo",this.state.image);
            formdata.append("banner",this.state.banner);
            formdata.append("description",this.state.description);
            formdata.append("industryType",this.state.industryType);
            formdata.append("industryTypePk",this.state.industryTypePk);
            formdata.append("vendor_typ",this.state.businessType);
            formdata.append("minimumOrdervalue",this.state.minimumOrdervalue);
            formdata.append("establishmentYear",this.state.establishmentYear+'');
            formdata.append("owner",pk);

            console.log(formdata,'formdata');
            fetch(SERVER_URL+'/api/POS/store/',{
              method: 'POST',
              headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                "Cookie" :"csrftoken=" +csrf+";sessionid=" + sessionid+";",
                'X-CSRFToken':csrf,
                'Referer': SERVER_URL,
              },
              body: formdata,
            }).then((response)=>{
              console.log(response.status,'errrrrrrrr');
                if(response.status==201||response.status==200){
                  // this.props.navigation.navigate('SellerZone')
                  return response.json()
                }else{
                  return undefined
                }
            }).then((responseJson)=>{
              console.log(responseJson,'tereyyyyyyy');
              this.setState({loadingVisible:false,saveButtonDisable:false});
              if(responseJson==undefined){
                return
              }
              this.props.setMyStoreFunction(responseJson,'owner')
              this.props.navigation.navigate('SellerZone')
            }).catch((error) => {
              this.setState({loadingVisible:false,saveButtonDisable:false});
            })
        }
    }
    render(){
      var themeColor = this.props.store.themeColor
      let {loadingVisible} = this.state;

      let bankListPicker = this.state.bankList.map( (s, i) => {
        return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
      });
      let bankTypePicker = bankType.map( (s, i) => {
          return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
      });
        const predata = this.props.navigation.getParam('user',null);
        return(
          <View style={[styles.container,{}]}>
              <Toast style={{backgroundColor: 'red',height:50}} textStyle={{color: '#fff',fontSize:15,fontWeight:'500'}} ref="toast" position = 'top'/>
              <Loader
              modalVisible = {loadingVisible}
              animationType="fade"
              />
              <ScrollView contentContainerStyle={{paddingBottom: this.state.keyboardOffset}} >
              <View style={{marginBottom:50}}>
                <View style={{marginHorizontal:15,marginVertical:15}}>
                    <View style={{flexDirection:'row',marginBottom:5}}>
                       <MonoText   style={{fontSize:16,fontWeight:'700'}}>Account Holder Name</MonoText>
                       <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                     </View>
                     <TextInput style={{backgroundColor:'#fff',marginTop:10,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                         onChangeText={(accountHolderName) => this.setState({accountHolderName})}
                         value={this.state.accountHolderName}>
                     </TextInput>
                </View>
                <View style={{marginHorizontal:15,marginBottom:15}}>
                    <View style={{flexDirection:'row',marginBottom:5}}>
                       <MonoText   style={{fontSize:16,fontWeight:'700'}}>Bank Account Number</MonoText>
                       <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                     </View>
                     <TextInput style={{backgroundColor:'#fff',marginTop:10,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                         keyboardType='numeric'
                         onChangeText={(bankaccno) => this.setState({bankaccno})}
                         value={this.state.bankaccno}>
                     </TextInput>
                </View>
                <View style={{marginHorizontal:15,marginBottom:15}}>
                    <View style={{flexDirection:'row',marginBottom:5}}>
                       <MonoText   style={{fontSize:16,fontWeight:'700'}}>IFSC</MonoText>
                        <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                     </View>
                     <TextInput style={{backgroundColor:'#fff',marginTop:10,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                         onChangeText={(ifsctext) => this.setState({ifsctext})}
                         value={this.state.ifsctext}>
                     </TextInput>
                </View>

                   <View style={{marginHorizontal:15,marginBottom:15}}>
                        <MonoText   style={{fontSize:16,fontWeight:'700'}}>Bank Name</MonoText>
                        <View style={{backgroundColor:'#fff',marginTop:10,fontSize:18,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}>
                          <Picker
                            selectedValue={this.state.bankname}
                            mode="dropdown"
                            style={{ flex:1,height:40, width:'100%'}}
                            onValueChange={(itemValue, itemIndex)=>this.setState({bankname:itemValue})}>
                            {bankListPicker}
                          </Picker>
                        </View>
                   </View>
                   <View style={{marginHorizontal:15,marginBottom:15}}>
                        <MonoText   style={{fontSize:16,fontWeight:'700'}}>Bank Type</MonoText>
                        <View style={{backgroundColor:'#fff',marginTop:10,fontSize:18,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}>
                          <Picker
                            selectedValue={this.state.accountType}
                            mode="dropdown"
                            style={{ flex:1,height:40, width:'100%',}}
                            onValueChange={(itemValue, itemIndex)=>this.setState({accountType:itemValue})}>
                            {bankTypePicker}
                          </Picker>
                       </View>
                   </View>

              </View>
            </ScrollView>
            {!this.state.keyboardOpen&&
            <View style={{position:'absolute',bottom:0,left:0,right:0,height:40}}>
              <View style={{flex:1,flexDirection:'row',}}>
                <TouchableOpacity style={{flex:1,alignItems:'center',backgroundColor:'#fff',justifyContent:'center',borderWidth:1,borderColor:themeColor}} onPress={()=>{this.props.navigation.navigate('NewStore')}}>
                 <MonoText   style={{fontSize:18,fontWeight:'700',color:themeColor}}>Back</MonoText>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:themeColor,}} onPress={()=>{this.save()}} disabled={this.state.saveButtonDisable}>
                 <MonoText   style={{fontSize:18,fontWeight:'700',color:'#fff'}}>Next</MonoText>
                </TouchableOpacity>
              </View>
            </View>
          }
      </View>
    );
  }
}

const styles=StyleSheet.create({
  container: {
        flex:1,
        flexDirection:'column',
        margin:0,
        backgroundColor: 'transparent',
        padding:0,
  },
  root: {
        flex: 1,
        paddingTop: 0,
        backgroundColor:'#eee',
        flexDirection: 'column',
        justifyContent: 'flex-start',
  },
  AutoSuggest: {
       width: 300,
       paddingLeft: 10,
       fontSize: 12,
       backgroundColor: 'lightgrey',
       height: 40,
   },
  });
  const mapStateToProps =(state) => {
    return {
      counter: state.cartItems.counter,
      cart : state.cartItems.cartItem,
      store:state.cartItems.store,
      bankList:state.cartItems.bankList
    }
  }

  const mapDispatchToProps = (dispatch) => {
    return {
      addTocartFunction:  (args) => dispatch(actions.addToCart(args)),
      decreaseFromCartFunction:  (args) => dispatch(actions.decreaseFromCart(args)),
      increaseCartFunction:  (args) => dispatch(actions.increaseCart(args)),
      setInitialFunction:  (cart,counter,totalAmount) => dispatch(actions.setInitial(cart,counter,totalAmount)),
      setMyStoreFunction:(myStore,storeRole)=>dispatch(actions.setMyStore(myStore,storeRole)),
      emptyCartFunction:()=>dispatch(actions.emptyCart()),
    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(NewStoreBank)



  // <View style={{marginHorizontal:15,marginVertical:15}}>
  //    <MonoText   style={{paddingBottom:2,fontSize:width*0.06,textDecorationLine:'underline'}}>Bank Details:</MonoText>
  //    <View style={{flexDirection:'column',}}>
  //    <MonoText   style={{paddingTop:10,paddingBottom:5,fontSize:16}}>Bank Name</MonoText>
  //    <Dropdown
  //        data={_bankList}
  //        onChangeText={(bank,index)=>{ this.setState({bankname:bank})}}
  //        value={this.state.bankname}
  //        dropdownOffset={{top:0}}
  //        containerStyle={{margin:0,padding:0, borderWidth:0.2,paddingLeft:10,height:45,backgroundColor:'#fafdff',
  //                          justifyContent:'center',borderColor:'#f1f1f1',paddingTop:4,width: '100%'}}
  //        rippleCentered={true}
  //        inputContainerStyle={{ borderBottomColor: 'transparent',fontSize:16 }}
  //        pickerStyle={{  borderRadius:10,marginTop:width*0.12,paddingHorizontal:20,
  //                        width:width*0.7,marginLeft:width*0.4,marginRight:width*0.1}}
  //    />
  //    </View>
  //
  //    <View style={{flexDirection:'column',}}>
  //        <MonoText   style={{paddingTop:10,paddingBottom:5,fontSize:16}}>Account Type</MonoText>
  //        <Dropdown
  //            data={_accountType}
  //            onChangeText={(accountType,index)=>{ this.setState({accountType:accountType})}}
  //            value={this.state.accountType}
  //            dropdownOffset={{top:0}}
  //            containerStyle={{ borderWidth:0.2,paddingLeft:10,height:45,backgroundColor:'#fafdff',
  //                              justifyContent:'center',borderColor:'#f1f1f1',paddingTop:4,width: '100%'}}
  //            rippleCentered={true}
  //            inputContainerStyle={{ borderBottomColor: 'transparent',fontSize:20 }}
  //            pickerStyle={{  borderRadius:10,marginTop:width*0.12,paddingHorizontal:20,
  //                            width:width*0.7,marginLeft:width*0.4,marginRight:width*0.1}}
  //        />
  //   </View>
  //
  //
  //      <View style={{flexDirection:'column',}}>
  //           <MonoText   style={{paddingTop:10,paddingBottom:5,fontSize:16}}>Account Number</MonoText>
  //           <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
  //                              fontSize:width*0.037,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0}}
  //               keyboardType='numeric'
  //               onChangeText={(bankaccno) => this.setState({bankaccno})}
  //               value={this.state.bankaccno}>
  //           </TextInput>
  //      </View>
  //      <View style={{flexDirection:'column',}}>
  //           <MonoText   style={{paddingTop:10,paddingBottom:5, fontSize:16}}>IFSC</MonoText>
  //           <TextInput style={{backgroundColor:'#ffffff',paddingHorizontal:20,paddingVertical:width*0.015,
  //                              fontSize:width*0.037,borderWidth:0.2,borderColor:'#f1f1f1',borderRadius:0}}
  //               onChangeText={(ifsctext) => this.setState({ifsctext})}
  //               value={this.state.ifsctext}>
  //           </TextInput>
  //      </View>
