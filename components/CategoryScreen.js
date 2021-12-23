import React,{Component}from 'react';
import {View,TouchableOpacity}from 'react-native';
import {FontAwesome,MaterialIcons} from '@expo/vector-icons';
import {connect} from 'react-redux';
import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes';
import { MonoText } from './StyledText';
class CategoryScreen extends Component{
  constructor(props){
    super(props);
    this.state={
      store:this.props.store
    }
  }
  static navigationOptions=({navigation})=>{
    const { params ={}} = navigation.state
    return{
      title:'Category',
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

  componentDidMount=()=>{
    this.props.navigation.setParams({
      themeColor:this.state.store.themeColor
    })
  }
  render(){
    return(
      <View></View>
    )
  }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(CategoryScreen)
