import React,{Component} from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Picker,
  Text,TextInput,Alert,Dimensions,AsyncStorage,Keyboard,
  TouchableOpacity,LayoutAnimation,KeyboardAvoidingView,
  View,Button,ImageBackground,FlatList,ToastAndroid,
} from 'react-native';
import { Card,SearchBar} from 'react-native-elements';
import Constants from 'expo-constants';
import { Ionicons ,FontAwesome,SimpleLineIcons} from '@expo/vector-icons';
import { Dropdown } from 'react-native-material-dropdown-v2';
import * as DocumentPicker from 'expo-document-picker';
import * as Permissions from 'expo-permissions';
import Modal from "react-native-modal";
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import settings from '../constants/Settings';
import { Camera } from 'expo-camera';
import * as  ImagePicker  from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';

const IS_IOS = Platform.OS === 'ios';
const { width } = Dimensions.get('window');
const SERVER_URL = settings.url
const themeColor = settings.themeColor



const businessTypeList = ['Wholesalers','Manufacturer','Online Trader','Importer','Exporter','Retailer','Corporator','Distributor','Supplier']
// const industryList = ['Fashion','Mobile & Tablets','Fabric & Accessories','Electronics & Appliances']

 class NewStore extends Component {
  constructor (props) {
    super(props);
      this.state ={
        selectedImg:null,
        imageModal:false,
        attachOpen:false,
        image:[],
        image1:[],
        bannerImage:[],
        photoshoot:false,
        photoshoot1:false,
        storenametext:'',
        moderators:'',
        mobilenumber:'',
        email:'',
        address:'',
        pincode:'',
        gstintext:'',
        logoURL:'',
        bannerImageURL:'',
        Moderators:[],
        city:'',
        country:'',
        state:'',
        store:props.store,
        isLogo: false,
        isBanner: false,
        isGSTCERT:false,
        logoSelected: false,
        bannerSelected: false,
        gstFile:'',
        keyboardOffset:0,
        keyboardOpen:false,
        description:'',
        establishmentYear:'',
        minimumOrdervalue:'',
        businessType:businessTypeList[0],
        industryType:'',
        businessTypeList:businessTypeList,
        industryList:[],
        selectedIndustryIndex:0
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


    // showKeyboard =()=>{
    //     this.setState({keyboardOpen : false})
    //     this.setState({scrollHeight:this.state.scrollHeight+500})
    //     setTimeout(()=> {
    //         if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
    //           return
    //         }
    //         this.refs._scrollView.scrollToEnd({animated: true});
    //       }, 500);
    // }
    //
    // hideKeyboard =(e)=>{
    //     this.setState({keyboardOpen : true})
    //     this.setState({keyboardHeight: e.endCoordinates.height+30});
    //     try {
    //       this.setState({scrollHeight:this.state.scrollHeight-500})
    //     }catch(e){}
    //      finally{}
    //     setTimeout(()=> {
    //       if (this.refs == undefined || this.refs._scrollView == undefined || this.refs._scrollView.scrollToEnd == undefined) {
    //         return
    //       }
    //       this.refs._scrollView.scrollToEnd({animated: true});
    //     }, 500);
    // }

    static navigationOptions=({navigation})=>{
      const { params ={} }=navigation.state
      return{
        title:'Create New Store',
        headerLeft:(
          <View style={{justifyContent:'flex-start'}}>
              <TouchableOpacity onPress={()=>{navigation.openDrawer();}} style={{paddingHorizontal:15}}>
                <SimpleLineIcons name={'menu'} size={23} color={'#fff'}/>
              </TouchableOpacity>
          </View>
        ),
        headerStyle:{
            backgroundColor:params.themeColor,
            marginTop:Platform.OS==='android'?Constants.statusBarHeight:0

        },
        headerTitleStyle: {
          flex:0.8,
          alignSelf:'center',
          textAlign:'center',
        },
        headerTintColor: '#fff',
      }
    }

    componentDidMount=async()=>{
      this.props.navigation.setParams({
        themeColor:this.state.store.themeColor
      })
      this.getParentCats()
    }

    modalAttach =async (event) => {
        if(event == 'gallery') return this._pickImage();
        if(event == 'camera'){
            this.handlePhoto()
        }
    };

    _pickImage = async () => {
        this.setState({photoshoot:false});
        let result = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: ImagePicker.MediaTypeOptions.Images,
           allowsMultipleSelection: true
        });
        this.attachShow(false)
        let filename = result.uri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        var type = match ? `image/${match[1]}` : `image`;
        const photo = {
           uri: result.uri,
           type: type,
           name:filename,
        };
        if(this.state.logoSelected){
          this.setState({ image: photo,isLogo:true,});
          this.setState({logoURL:photo.uri,logoSelected:false});
        }
        if(this.state.bannerSelected){
          this.setState({ bannerImage: photo,isBanner:true,});
          this.setState({bannerImageURL:photo.uri,bannerSelected:false});
        }
   };

   _filePicker = async () => {
     try{

       let res = await DocumentPicker.getDocumentAsync({
         type: '*/*',
       });

       let filename = res.uri.split('/').pop();
       let match = /\.(\w+)$/.exec(filename);
       let type = match ? `application/${match[1]}` : `pdf`;

       const file = {
           uri: res.uri,
           type: type,
           name:filename,
       };

       this.setState({ gstFile: file,isGSTCERT:true});
     }catch (err) {
     }

   }


   handlePhoto = async () => {
        this.setState({photoshoot:false});
        let picture = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});
        this.attachShow(false)
        if(picture.cancelled == true){
            return
        }
        let filename = picture.uri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        const photo = {
            uri: picture.uri,
            type: type,
            name:filename,
        };
        if(this.state.logoSelected){
          this.setState({ image: photo,isLogo:true,});
          this.setState({logoURL:photo.uri,logoSelected:false});
        }
        if(this.state.bannerSelected){
          this.setState({ bannerImage: photo,isBanner:true,});
          this.setState({bannerImageURL:photo.uri,bannerSelected:false});
        }
        console.log(this.state.logoSelected,this.state.bannerSelected,this.state.isLogo,this.state.isBanner,'sdsddas');
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

      Moderators=async(moderators)=>{
            this.setState({moderators:moderators})
            var csrf = await AsyncStorage.getItem('csrf');
            const sessionid = await AsyncStorage.getItem('sessionid');
            fetch(SERVER_URL+'/api/HR/userSearch/?first_name__contains='+this.state.moderators,{
              method:'GET',
              headers:{
                "Cookie" :"csrftoken="+csrf+";sessionid=" + sessionid +";",
                'Content-Type': 'multipart/form-data;',
                'X-CSRFToken':csrf,
                'Referer': SERVER_URL,
              }
            }).then((response)=>{
              return response.json()
            }).then((responseJson)=>{
              this.setState({Moderators:responseJson})
            }).catch((error) => {
            })
        }

      moderate=(i)=>{
          this.setState({moderators:i.first_name+' '+i.last_name})
          this.state.moderators=i.first_name+' '+i.last_name
          this.state.moderatorspk=i.pk
          if(this.state.moderators==i.first_name+' '+i.last_name){
            this.setState({Moderators:[]})
          }
        }



      Pincode=(pincode)=>{
          if(pincode.length==6){
          fetch(SERVER_URL+'/api/POS/genericPincode/?pincode__contains='+pincode)
          .then((response)=>{
            return response.json()
          }).then((responseJson)=>{
            console.log(responseJson,'llllll');
            this.setState({pincode:pincode})
            this.setState({city:responseJson[0].city})
            this.setState({state:responseJson[0].state})
            this.setState({country:responseJson[0].country})
          }).catch((error) => {
          })
        }else{
          this.setState({pincode:pincode})
        }
        }



  getParentCats = async ()=>{

          fetch(SERVER_URL + '/api/POS/getcategoriesOptions/')
            .then((response) => response.json())
            .then((responseJson) => {
              console.log(responseJson, 'catlist');
              this.setState({industryType:responseJson[0].name, industryList:responseJson,})
            })
            .catch(() => {
              this.setState({ loader:false})
              return
            });
        }

      Next=()=>{
        // console.log(this.state.industryList[this.state.selectedIndustryIndex].pk,this.state.industryType,'kkkkkkkkkk');
        // return
          if(this.state.storenametext.length==0){
            this.refs.toast.show('Please enter business name.');
            return;
          }
          if(this.state.description.length<150){
            this.refs.toast.show('Please enter about your business(minimum 50 words).');
            return;
          }
          if(this.state.businessType.length==0){
            this.refs.toast.show('Please select business type.');
            return;
          }
          if(this.state.industryType.length==0){
            this.refs.toast.show('Please select industry type.');
            return;
          }
          if(this.state.establishmentYear.length==0){
            this.refs.toast.show('Please enter establishment year.');
            return;
          }
          if(this.state.minimumOrdervalue.length==0){
            this.refs.toast.show('Please enter minimum order value.');
            return;
          }
          if(this.state.mobilenumber.length>10){
            this.refs.toast.show('Please enter 10 digit mobile number.');
            return;
          }
          if(this.state.mobilenumber.length<10){
            this.refs.toast.show('Please enter  10 digit mobile number.');
            return;
          }
          if(this.state.email.length==0){
            this.refs.toast.show('Please enter email.');
            return;
          }
          if(this.state.email.length>0){
            var emailResponse = this.validate(this.state.email);
            if(!emailResponse){
              this.refs.toast.show('Please correct email.');
              return;
            }
          }
          if(this.state.address.length==0){
            this.refs.toast.show('Please enter address.');
            return;
          }
          if(this.state.pincode.length<6){
            this.refs.toast.show('Please enter 6 digit pincode number.');
            return;
          }
          if(this.state.gstintext.length==0){
            this.refs.toast.show('Please enter GST Number.');
            return;
          }

          if(this.state.image==[]){
            this.refs.toast.show('Please select logo.');
            return;
          }
          if(this.state.bannerImage==[]){
            this.refs.toast.show('Please select banner image.');
            return;
          }
          this.props.navigation.navigate('NewStoreBank',{user:{
                                storenametext:this.state.storenametext,
                                mobilenumber:this.state.mobilenumber,
                                email:this.state.email,
                                address:this.state.address,
                                description:this.state.description,
                                pincode:this.state.pincode,
                                gstintext:this.state.gstintext,
                                image:this.state.image,
                                banner:this.state.bannerImage,
                                city:this.state.city,
                                state:this.state.state,
                                industryType:this.state.industryType,
                                businessType:this.state.businessType,
                                minimumOrdervalue:this.state.minimumOrdervalue,
                                establishmentYear:this.state.establishmentYear,
                                country:this.state.country,
                                industryTypePk:this.state.industryList[this.state.selectedIndustryIndex].pk}});
        }


    resetForm=()=>{
          this.setState({storenametext:'',isLogo: false,isBanner: false,isGSTCERT:false,bannerSelected:false,logoSelected:false,gstFile:'',city:'',country:'',state:'',address:'',pincode:'',
            gstintext:'',mobilenumber:'',photoshoot:false,photoshoot1:false,photoshoot3:false,selectedImg:null,imageModal:false,attachOpen:false,image:[],image1:[],bannerImage:[],businessType:'',industryType:''});
        }


    validate = (text) => {
          console.log(text);
          let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          if (reg.test(text) === false) {
            console.log("Email is Not Correct");
            return false;
          }
          else {
            return true;
          }
        }

    render(){
      let businessTypeList = this.state.businessTypeList.map( (s, i) => {
        return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
      });
      let industryList = this.state.industryList.map( (s, i) => {
        return <Picker.Item key={i} value={s.name} label={s.name}  ></Picker.Item>
      });
      var themeColor = this.state.store.themeColor
        return(
          <View style={[styles.container,{backgroundColor:'#fff'}]}>
            <Toast style={{backgroundColor: 'red',height:50}} textStyle={{color: '#fff',fontSize:15,fontWeight:'500'}} ref="toast" position = 'top'/>
              <ScrollView contentContainerStyle={{paddingBottom: 60}}>
                <View style={{marginBottom:60}}>
                     <View style={{marginHorizontal:15,marginVertical:10}}>
                     <View style={{flexDirection:'row',marginBottom:5}}>
                        <MonoText   style={{fontSize:16,fontWeight:'700'}}>Business Name</MonoText>
                         <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                      </View>
                        <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                            onChangeText={(storenametext) => this.setState({storenametext})}
                            value={this.state.storenametext}>
                        </TextInput>
                    </View>

                    <View style={{marginHorizontal:15,marginVertical:10}}>
                    <View style={{flexDirection:'row',marginBottom:5}}>
                       <MonoText   style={{fontSize:16,fontWeight:'700'}}>About Your Business</MonoText>
                       <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                     </View>
                       <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,textAlignVertical:'top'}}
                           onChangeText={(description) => this.setState({description})}
                           multiline={true}
                           numberOfLines={5}
                           value={this.state.description}>
                       </TextInput>
                   </View>

                   <View style={{marginHorizontal:15,marginVertical:10}}>
                     <View style={{flexDirection:'row',marginBottom:5}}>
                        <MonoText   style={{fontSize:16,fontWeight:'700'}}>Business Type</MonoText>
                         <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                      </View>
                      <View style={{width: "100%",height:40,marginVertical:5,borderWidth:1,borderColor:'#f2f2f2',paddingVertical:7,backgroundColor:'#fff' }}>
                        <Picker
                          selectedValue={this.state.businessType}
                          mode="dropdown"
                          style={{ width: "100%",height:30 ,}}
                          itemStyle={{marginVertical:0,paddingVertical:0}}
                          onValueChange={(itemValue, itemIndex)=>this.setState({businessType:itemValue})}>
                          {businessTypeList}
                        </Picker>
                      </View>
                  </View>
                  <View style={{marginHorizontal:15,marginVertical:10}}>
                  <View style={{flexDirection:'row',marginBottom:5}}>
                     <MonoText   style={{fontSize:16,fontWeight:'700'}}>Industry</MonoText>
                      <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                   </View>
                     <View style={{width: "100%",height:40,marginVertical:5 ,borderWidth:1,borderColor:'#f2f2f2',paddingVertical:7,backgroundColor:'#fff' }}>
                       <Picker
                         selectedValue={this.state.industryType}
                         mode="dropdown"
                         style={{ width: "100%",height:30 ,}}
                         itemStyle={{marginVertical:0,paddingVertical:0}}
                         onValueChange={(itemValue, itemIndex)=>this.setState({industryType:itemValue,selectedIndustryIndex:itemIndex})}>
                         {industryList}
                       </Picker>
                     </View>
                 </View>

                   <View style={{marginHorizontal:15,marginVertical:10}}>
                   <View style={{flexDirection:'row',marginBottom:5}}>
                      <MonoText   style={{fontSize:16,fontWeight:'700'}}>Establishment Year</MonoText>
                      <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                    </View>
                      <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                          onChangeText={(establishmentYear) => this.setState({establishmentYear})}
                          keyboardType='numeric'
                          value={this.state.establishmentYear}>
                      </TextInput>
                  </View>

                  <View style={{marginHorizontal:15,marginVertical:10}}>
                  <View style={{flexDirection:'row',marginBottom:5}}>
                     <MonoText   style={{fontSize:16,fontWeight:'700'}}>Minimum Order Value</MonoText>
                      <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                   </View>
                     <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                          keyboardType='numeric'
                         onChangeText={(minimumOrdervalue) => this.setState({minimumOrdervalue})}
                         value={this.state.minimumOrdervalue}>
                     </TextInput>
                 </View>


                   <View style={{marginHorizontal:15,marginBottom:10}}>
                   <View style={{flexDirection:'row',marginBottom:5}}>
                      <MonoText   style={{fontSize:16,fontWeight:'700'}}>Mobile</MonoText>
                      <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                    </View>
                       <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                            keyboardType='numeric'
                            onChangeText={(mobilenumber) => this.setState({mobilenumber})}
                            value={this.state.mobilenumber}>
                       </TextInput>
                  </View>
                  <View style={{marginHorizontal:15,marginBottom:10}}>
                  <View style={{flexDirection:'row',marginBottom:5}}>
                     <MonoText   style={{fontSize:16,fontWeight:'700'}}>Email</MonoText>
                      <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                   </View>
                      <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                           keyboardType='email-address'
                           onChangeText={(email) => this.setState({email})}
                           value={this.state.email}>
                      </TextInput>
                 </View>
                 <View style={{marginHorizontal:15,marginBottom:10}}>
                   <View style={{flexDirection:'row',marginBottom:5}}>
                      <MonoText   style={{fontSize:16,fontWeight:'700'}}>Address</MonoText>
                      <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                    </View>
                      <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,textAlignVertical:'top'}}
                            onChangeText={(address) => this.setState({address})}
                            multiline={true}
                            numberOfLines={3}
                            value={this.state.address}>
                      </TextInput>
                  </View>
                  <View style={{marginHorizontal:15,marginBottom:10}}>
                    <View style={{flexDirection:'row',marginBottom:5}}>
                       <MonoText   style={{fontSize:16,fontWeight:'700'}}>Pincode</MonoText>
                        <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                     </View>
                       <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                            keyboardType='numeric'
                            onChangeText={(pincode) => this.Pincode(pincode)}
                            value={this.state.pincode}>
                      </TextInput>
                  </View>
                  <View style={{marginHorizontal:15,marginBottom:10}}>
                    <View style={{flexDirection:'row',marginBottom:5}}>
                         <MonoText   style={{fontSize:16,fontWeight:'700'}}>GSTIN</MonoText>
                          <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                     </View>
                       <TextInput style={{backgroundColor:'#fff',marginTop:5,paddingHorizontal:15,paddingVertical:5,fontSize:15,borderWidth:1,borderColor:'#f2f2f2',borderRadius:0}}
                            onChangeText={(gstintext) => this.setState({gstintext})}
                            value={this.state.gstintext}>
                        </TextInput>
                  </View>

                  <View style={{justifyContent:'flex-start',flexDirection:'row',marginHorizontal:15,marginBottom:15}}>
                      <View style={{flex:1,borderRadius:0,justifyContent:'center'}}>
                        <TouchableOpacity style={{backgroundColor:'#ffffff',borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,width:width*0.3}} onPress={()=>{this.setState({photoshoot:true,logoSelected:true})}}>
                        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                          <MonoText   style={{paddingVertical:6,fontSize:16,textAlign:'center',color:'#000',fontWeight:'bold',}}>Logo</MonoText>
                           <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                         </View>
                        </TouchableOpacity>
                      </View>
                      {this.state.isLogo &&
                        <View style={{paddingLeft:2,paddingHorizontal:0,flex:1,borderRadius:0,}}>
                            <Card containerStyle={{borderWidth: 0, borderColor: '#67d142', borderRadius: 7,margin:0,padding: 0,width:width*0.45,height:width*0.27,}}>
                                <Image style={{ width:'100%',height:'100%',zIndex: 1,borderRadius:0,opacity:1,zIndex:1}} source={{uri:this.state.logoURL}}/>
                            </Card>
                        </View>
                      }
                  </View>

                  <View style={{justifyContent:'flex-start',flexDirection:'row',marginHorizontal:15,marginBottom:15}}>
                      <View style={{flex:1,borderRadius:0,justifyContent:'center'}}>
                        <TouchableOpacity style={{backgroundColor:'#ffffff',borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,width:width*0.3}} onPress={()=>{this.setState({photoshoot:true,bannerSelected:true})}}>
                        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                          <MonoText   style={{paddingVertical:6,fontSize:16,textAlign:'center',color:'#000',fontWeight:'bold',}}>Baner Image</MonoText>
                           <MonoText   style={{color:'red',fontWeight:'700',marginTop:2,marginLeft:2}}>*</MonoText>
                         </View>
                        </TouchableOpacity>
                      </View>
                      {this.state.isBanner &&
                        <View style={{paddingLeft:2,paddingHorizontal:0,flex:1,borderRadius:0,}}>
                            <Card containerStyle={{borderWidth: 0, borderColor: '#67d142', borderRadius: 7,margin:0,padding: 0,width:width*0.45,height:width*0.27,}}>
                                <Image style={{ width:'100%',height:'100%',zIndex: 1,borderRadius:0,opacity:1,zIndex:1}} source={{uri:this.state.bannerImageURL}}/>
                            </Card>
                        </View>
                      }
                  </View>


               </View>

             </ScrollView>
                {!this.state.keyboardOpen&&
                <View style={{position:'absolute',bottom:0,left:0,right:0,height:40}}>
                  <View style={{flex:1,flexDirection:'row',}}>
                    <TouchableOpacity style={{flex:1,alignItems:'center',backgroundColor:'#fff',justifyContent:'center',borderWidth:1,borderColor:themeColor}} onPress={()=>{this.resetForm()}}>
                     <MonoText   style={{fontSize:18,fontWeight:'700',color:themeColor}}>Reset</MonoText>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:themeColor,}} onPress={()=>{this.Next()}}>
                     <MonoText   style={{fontSize:18,fontWeight:'700',color:'#fff'}}>Next</MonoText>
                    </TouchableOpacity>
                  </View>
                </View>
              }
              <Modal
                    isVisible={this.state.photoshoot}
                    hasBackdrop={true}
                    style={[styles.modalView1,{position:'absolute',bottom:-20,left:0,}]}
                    onBackdropPress={()=>{this.setState({photoshoot:false});}} >
                    <View style={{paddingVertical:width*0.01,}}>
                        <View style={{flexDirection:'row',height:width*0.25,justifyContent:'space-between',
                                      borderWidth:0,backgroundColor:'transparent',borderRadius:0,paddingTop:width*0.05}}>
                              <TouchableOpacity
                                      style={{alignItems:'center',justifyContent:'center',backgroundColor:'#fff',paddingHorizontal:4,
                                              paddingVertical:6,borderWidth:0,borderRadius:0}}
                                      onPress={()=>{this.modalAttach('gallery')}}>
                                      <FontAwesome
                                          name="folder"
                                          size={width*0.16}
                                          style={{marginRight:5,color:themeColor,
                                                  textAlign: 'center',marginLeft:width*0.1}} />
                                          <MonoText   style={{fontSize:16,color:themeColor,textAlign:'center',marginLeft:width*0.1}}>Gallary</MonoText>
                              </TouchableOpacity>
                              <TouchableOpacity
                                      style={{flexDirection: 'column',alignItems: 'center',
                                              justifyContent: 'center',backgroundColor:'#fff',
                                              paddingHorizontal:4,paddingVertical:6,borderWidth:0,borderRadius:0,}}
                                      onPress={()=>{this.modalAttach('camera')}}>
                                      <FontAwesome
                                          name="camera"
                                          size={width*0.14}
                                          style={{marginRight:5,color:themeColor,textAlign: 'center',
                                                  marginRight:width*0.1}}
                                          />
                                      <MonoText   style={{fontSize:16,color:themeColor,textAlign:'center',marginRight:width*0.1}}>camera</MonoText>
                              </TouchableOpacity>
                        </View>
                   </View>
            </Modal>
      </View>
    );
  }
}

const styles=StyleSheet.create({
    container: {
        flex:1,
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
   modalView1:{
     backgroundColor: '#fff',
     marginHorizontal: 0 ,
     borderTopLeftRadius:5,
     borderTopRightRadius:5,
     justifyContent: 'flex-end',
     width:width
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

  export default connect(mapStateToProps, mapDispatchToProps)(NewStore)



  // <View style={{justifyContent:'flex-start',flexDirection:'row',marginHorizontal:15,marginBottom:15}}>
  //     <View style={{flex:1,borderRadius:0,justifyContent:'center'}}>
  //       <TouchableOpacity style={{backgroundColor:'#ffffff',borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,width:width*0.3}} onPress={()=>{this.setState({photoshoot:true})}}>
  //           <MonoText   style={{paddingVertical:6,fontSize:16,textAlign:'center',color:'#000',fontWeight:'bold',}}>Logo</MonoText>
  //       </TouchableOpacity>
  //     </View>
  //     {this.state.isLogo &&
  //       <View style={{paddingLeft:2,paddingHorizontal:0,flex:1,borderRadius:0,}}>
  //           <Card containerStyle={{borderWidth: 0, borderColor: '#67d142', borderRadius: 7,margin:0,padding: 0,width:width*0.45,height:width*0.27,}}>
  //               <Image style={{ width:'100%',height:'100%',zIndex: 1,borderRadius:0,opacity:1,zIndex:1}} source={{uri:this.state.image.uri}}/>
  //           </Card>
  //       </View>
  //     }
  // </View>
  // <View style={{justifyContent:'flex-start',flexDirection:'row',marginHorizontal:15,marginBottom:15}}>
  //     <View style={{flex:1,borderRadius:0,justifyContent:'center'}}>
  //       <TouchableOpacity style={{backgroundColor:'#ffffff',borderWidth:1,borderColor:'#f2f2f2',borderRadius:0,width:width*0.3}} onPress={()=>{this.setState({photoshoot3:true})}}>
  //           <MonoText   style={{paddingVertical:6,fontSize:16,textAlign:'center',color:'#000',fontWeight:'bold',}}>Banner Image</MonoText>
  //       </TouchableOpacity>
  //     </View>
  //     {this.state.isBanner &&
  //       <View style={{paddingLeft:2,paddingHorizontal:0,flex:1,borderRadius:0,}}>
  //           <Card containerStyle={{borderWidth: 0, borderColor: '#67d142', borderRadius: 7,margin:0,padding: 0,width:width*0.45,height:width*0.27,}}>
  //               <Image style={{ width:'100%',height:'100%',zIndex: 1,borderRadius:0,opacity:1,zIndex:1}} source={{uri:this.state.bannerImage.uri}}/>
  //           </Card>
  //       </View>
  //     }
  // </View>
//   <View style={{justifyContent:'flex-start',marginHorizontal:15,marginBottom:20,flexDirection:'row'}}>
//       <View style={{flex:1,borderRadius:0,justifyContent:'center'}}>
//       <TouchableOpacity onPress={()=>{this._filePicker()}} style={{backgroundColor:'#ffffff',borderWidth:1, borderColor:'#f2f2f2',borderRadius:0,width:width*0.3}}>
//           <MonoText   style={{paddingVertical:8,fontSize:14,textAlign:'center',color:'#000',fontWeight:'bold',}}>GST Certificate</MonoText>
//       </TouchableOpacity>
//       </View>
//       {this.state.isGSTCERT &&
//         <View style={{paddingLeft:2,paddingHorizontal:0,flex:1,borderRadius:0,justifyContent:'center'}}>
//           <MonoText   style={{color:'#000'}}>{this.state.gstFile.name.split('-').pop()}</MonoText>
//         </View>
//       }
//   </View>
// </View>


// &&this.state.gstFile!=''&&this.state.bannerImage!=[]

// gstFile:this.state.gstFile,
// bannerImage:this.state.bannerImage,
