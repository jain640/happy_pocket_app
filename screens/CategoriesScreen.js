import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Slider,
  Dimensions,
  TextInput, FlatList,ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MonoText } from '../components/StyledText';
import  Constants  from 'expo-constants';
import GridLayout from 'react-native-layout-grid';

import Categorycard from '../components/Categorycard.js';
import settings from '../constants/Settings.js';
const { width } = Dimensions.get('window');
const height = width * 0.8
const SERVER_URL = settings.url
import Toast, {DURATION} from 'react-native-easy-toast';
import { connect } from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import NetInfo from '@react-native-community/netinfo';

class CategoriesScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      title: params.title,

      headerRight: (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', }}>
          <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => params.searchoption()}  >
          <MonoText><FontAwesome name="search" size={22} color="#fff" /> </MonoText>
           </TouchableOpacity  >

        </View>
      ),
      headerStyle: {
        backgroundColor: params.themeColor,
        marginTop:Platform.OS==='android'?Constants.statusBarHeight:0,
      },
      headerTintColor: '#fff',
    }
  };


  constructor(props){
    super(props);
    this.state = {
      categories : false,
      store:this.props.store,
      loader:false
    }







  }
  componentDidMount() {
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor,
      searchoption: this.search,
      title:this.state.store.company,
    });
    this.setState({unsubscribe:NetInfo.addEventListener(state =>{
       this.handleConnectivityChange(state);
     })})

  }

  handleConnectivityChange=(state)=>{
    if(state.isConnected){
      console.log('loadedddddd');
       this.setState({connectionStatus : true,loader:true})
       fetch(SERVER_URL + '/api/POS/categorysortlist/?store='+this.state.store.pk)
         .then((response) => response.json())
         this.setState({loader:true})
         .then((responseJson) => {
           this.setState({ categories: responseJson })
         })
         .catch((error) => {
           this.setState({loader:true})
           return
         });
    }else{
      this.setState({connectionStatus : false})
      this.showNoInternet()
    }
  }

  showNoInternet=()=>{
    if(this.refs.toast!=undefined){
      this.refs.toast.show('No Internet Connection')
    }
  }

  componentWillUnmount=()=>{
    var unsubscribe = this.state.unsubscribe;
    unsubscribe()
  }

  search = () => {
    this.props.navigation.navigate('SearchBar', {
      color: this.props.navigation.getParam('color','#000')
    })
  }

  render() {




     return (
       <View style={[styles.container,{width: width}]}>
       <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
       {this.state.loader&&
         <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <ActivityIndicator size="large" color={this.state.store.themeColor} />
         </View>
       }
       {!this.state.loader&&
         <View style={{flex:1}}>
           <FlatList
           data={this.state.categories}
           keyExtractor={(item, index) => {
             return index.toString();
           }}
           renderItem={({item, index, separators}) => (
             <Categorycard category={item} navigation={this.props.navigation}></Categorycard>
           )}
           />
         </View>
     }
       </View>
     );
   }
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },




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

  export default connect(mapStateToProps, mapDispatchToProps)(CategoriesScreen);
