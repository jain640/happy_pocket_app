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
  Dimensions, Alert,StatusBar,FlatList, AppState, BackHandler , AsyncStorage,ActivityIndicator,ToastAndroid,RefreshControl,TouchableWithoutFeedback,NativeModules,LayoutAnimation
} from 'react-native';
import  Constants  from 'expo-constants';
import { withNavigationFocus,DrawerActions ,DrawerNavigator} from 'react-navigation';
import TextLoader from '../components/TextLoader';
import settings from '../constants/Settings.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { FontAwesome,Entypo,MaterialIcons } from '@expo/vector-icons';
import Loader from '../components/Loader'
const Entities = require('html-entities').XmlEntities;
import { MonoText } from '../components/StyledText';
const entities = new Entities();
const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);
const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url

class AddProductInitialScreen extends React.Component {

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
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0,
      },
      headerTitleStyle: {
        flex: 1,
        marginRight:60,
        fontSize:18,
        textAlign:'center',
        alignSelf: 'center',
      },
      title: 'Add Product',
      headerTintColor: '#fff',
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      store:props.store,
      categories:[],
      subCategory:[],
      categorySelect:false,
      childSelect:false,
      selectedCategory:null,
      selectedSubCategory:null,
      childCategory:[],
      loadingVisible:false,
      myStore:props.myStore
    }
  }

  getCategory=()=>{
    fetch(SERVER_URL + '/api/POS/categoryListApp/?store='+this.state.myStore.pk)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ categories: responseJson })
      })
      .catch((error) => {
        return
      });
  }

  componentDidMount(){
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
    })
    this.getCategory()
  }

  openCategory = (item,idx)=>{
    LayoutAnimation.easeInEaseOut();
    if(item.child.length==0){
      this.props.navigation.navigate('ProductCreateScreen',{category:item,subcategory:null,selected:item,level:1,initial:true})
      return
    }
    this.setState({selectedCategory:item,subCategory:item.child,categorySelect:true})
  }

  openSubCategory = (item,idx)=>{
    LayoutAnimation.easeInEaseOut();
    if(item.subChild.length==0){
      this.props.navigation.navigate('ProductCreateScreen',{category:this.state.selectedCategory,subcategory:item,selected:item,level:2,initial:true})
      return
    }
    this.setState({selectedSubCategory:item,childCategory:item.subChild,childSelect:true})
  }

  closeCategory = ()=>{
    LayoutAnimation.easeInEaseOut();
    this.setState({selectedCategory:null,subCategory:[],categorySelect:false,childSelect:false,selectedSubCategory:null,childCategory:[],})
  }

  closeSubCategory = ()=>{
    LayoutAnimation.easeInEaseOut();
    this.setState({selectedSubCategory:null,childCategory:[],childSelect:false})
  }


  render() {
    var themeColor = this.state.themeColor
    var {loadingVisible} = this.state
    return (
        <ScrollView style={{flex:1}}>
        {this.state.categorySelect&&
          <TouchableOpacity style={{paddingVertical:15,paddingHorizontal:15,flexDirection:'row',borderBottomWidth:1,borderColor:'#f2f2f2'}} onPress={()=>this.closeCategory()}>
            <MonoText   style={{fontSize:18,fontWeight:'700',color:'#000'}}>{entities.decode(this.state.selectedCategory.name)}</MonoText>
            <View style={{flex:1,alignItems:'flex-end'}}>
              <FontAwesome name="angle-right" size={20} color='#000'  />
            </View>
          </TouchableOpacity>
        }
        {!this.state.categorySelect&&
          <View style={{flex:1,marginHorizontal:15,}}>
            <MonoText   style={{fontSize:18,fontWeight:'700',color:'#000',marginVertical:15,}}>Select Category</MonoText>
            <FlatList
              data={this.state.categories}
              extraData={this.state}
              keyExtractor={(item, index) => {
                return index.toString();
              }}
              renderItem={({item, index}) => (
                <View>
                  <TouchableOpacity onPress={()=>{this.openCategory(item,index)}} style={{alignItems:'center',justifyContent:'center',flexDirection:'row',borderTopWidth:1,borderColor:'#f2f2f2',height:50}}>
                  <MonoText   style={{fontSize:15,color:'#000'}}>{entities.decode(item.name)}</MonoText>
                  {item.child.length>0&&
                  <View style={{flex:1,alignItems:'flex-end'}}>
                    <FontAwesome name="angle-right" size={20} color='#000'  />
                  </View>
                  }
                  </TouchableOpacity>
                </View>
              )}
             />
          </View>
         }
         {this.state.categorySelect&&!this.state.childSelect&&
          <View style={{flex:1,marginHorizontal:15,}}>
            <MonoText   style={{fontSize:18,fontWeight:'700',color:'#000',marginVertical:15,}}>Select Subcategory</MonoText>
            <FlatList
              data={this.state.subCategory}
              keyExtractor={(item, index) => {
                return index.toString();
              }}
              renderItem={({item, index}) => (
                <TouchableOpacity onPress={()=>{this.openSubCategory(item,index)}} style={{alignItems:'center',justifyContent:'center',flexDirection:'row',borderTopWidth:1,borderColor:'#f2f2f2',height:50}}>
                  <MonoText   style={{fontSize:15,color:'#000'}}>{entities.decode(item.name)}</MonoText>
                  {item.subChild.length>0&&
                  <View style={{flex:1,alignItems:'flex-end'}}>
                    <FontAwesome name="angle-right" size={20} color='#000'  />
                  </View>
                  }
                </TouchableOpacity>
              )}
             />
          </View>
         }
         {this.state.categorySelect&&this.state.childSelect&&
           <TouchableOpacity style={{paddingVertical:15,paddingHorizontal:15,flexDirection:'row',borderBottomWidth:1,borderColor:'#f2f2f2'}} onPress={()=>this.closeSubCategory()}>
             <MonoText   style={{fontSize:18,fontWeight:'700',color:'#000'}}>{entities.decode(this.state.selectedSubCategory.name)}</MonoText>
             <View style={{flex:1,alignItems:'flex-end'}}>
               <FontAwesome name="angle-right" size={20} color='#000'  />
             </View>
           </TouchableOpacity>
         }
         {this.state.categorySelect&&this.state.childSelect&&
          <View style={{flex:1,marginHorizontal:15,}}>
            <FlatList
              data={this.state.childCategory}
              keyExtractor={(item, index) => {
                return index.toString();
              }}
              renderItem={({item, index}) => (
                <TouchableOpacity onPress={()=>this.props.navigation.navigate('ProductCreateScreen',{category:this.state.selectedCategory,subcategory:this.state.selectedSubCategory,selected:item,level:3,initial:true})} style={{paddingVertical:10,flexDirection:'row',borderTopWidth:1,borderColor:'#f2f2f2',height:50}}>
                  <MonoText   style={{fontSize:15,color:'#000'}}>{entities.decode(item.name)}</MonoText>
                </TouchableOpacity>
              )}
             />
          </View>
         }
        </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(AddProductInitialScreen);
