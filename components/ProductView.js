import React from 'react';
import { StatusBar, ScrollView, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList, Alert, AsyncStorage, ToastAndroid,Platform ,TouchableWithoutFeedback} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import { Dropdown } from 'react-native-material-dropdown-v2';
import { MonoText } from './StyledText';
const { width } = Dimensions.get('window');
const height = width * 0.8

import { connect } from 'react-redux';
import cartItems from '../reducers/cartItems'
import * as actionTypes from '../actions/actionTypes'
import Toast, {DURATION} from 'react-native-easy-toast';
import settings from '../constants/Settings.js';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
const items = [{
    label: '1',
    value: 1,
  },
  {
    label: '2',
    value: 2,
  },
]

export default class ProductView extends React.Component {




  constructor(props) {
    super(props);
    var prod = props.product;

    if (prod.product.unit == 'Litre') {
      unit = 'L'
    }else if (prod.product.unit == 'Millilitre') {
      unit = 'ml'
    }else if (prod.product.unit == 'Gram') {
      unit = 'gm'
    }else if (prod.product.unit == 'Kilogram') {
      unit = 'kg'
    }else if (prod.product.unit == 'Quantity') {
      unit = 'Qty'
    }

    const varientChoices = [prod.product.howMuch + " " + unit]
    var listofPk = []
    var stock = [prod.product.stock]
    listofPk[0] = null
    var varientCount = [0]
    for (var i = 0; i < prod.product_variants.length; i++) {
      listofPk.push(prod.product_variants[i].pk)
      stock.push(prod.product_variants[i].stock)
      if (prod.product_variants[i].unit == 'Litre') {
        varientChoices.push(prod.product_variants[i].unitPerpack + " L")
      }else if (prod.product_variants[i].unit == 'Millilitre') {
        varientChoices.push(prod.product_variants[i].unitPerpack + " ml")
      }else if (prod.product_variants[i].unit == 'Gram') {
        varientChoices.push(prod.product_variants[i].unitPerpack + " gm")
      }else if (prod.product_variants[i].unit == 'Kilogram') {
        varientChoices.push(prod.product_variants[i].unitPerpack + " kg")
      }else if (prod.product_variants[i].unit == 'Quantity') {
          varientChoices.push(prod.product_variants[i].unitPerpack + " Qty")
      }
      varientCount.push(0)
    }


    this.state = {
      select: prod.product.howMuch + " " + unit,
      quantity: 1,
      product : props.product,
      varientChoices : varientChoices,
      inCart : 0,
      pkList:listofPk,
      mrp : prod.product.price,
      stock:stock,
      inStock:stock[0],
      salePrice : prod.product.discountedPrice,
      discount : prod.product.price-prod.product.discountedPrice,
      dp : prod.product.displayPicture,
      maxOrder : prod.product.orderTrashold,
      selectedPk : null,
      selectedIndex : 0,
      varientCount : varientCount,
      selectedQty: 1,
      sku : prod.product.serialNo,
      unit:prod.product.unit,
      unitPerpack:prod.product.howMuch,
    }
  }




    componentWillReceiveProps({cartItems}){
      const varientCount = this.state.varientCount;
      for (var i = 0; i < varientCount.length; i++) {
        varientCount[i] = 0
      }
        var parent = cartItems.filter(function(item){
            if(item.varient == null) {
              return item
            }
        })
        var child = cartItems.filter(function(item){
            if(item.varient != null) {
              return item
            }
        })


        for (var i = 0; i < parent.length; i++) {
          if(parent[i].pk == this.state.product.product.pk){
            varientCount[0] = parent[i].count
          }
        }

        for (var i = 0; i < child.length; i++) {
          if(child[i].pk == this.state.product.product.pk){
              for (var j = 0; j < this.state.product.product_variants.length; j++) {
                if(this.state.product.product_variants[j].sku == child[i].sku){
                  varientCount[j+1]=child[i].count
                }
              }
          }
          }
          this.setState({varientCount:varientCount})
          this.setState({inCart:this.state.varientCount[this.state.selectedIndex]})

    }
  componentDidMount() {

  }


  dropDownChanged = (itemValue, itemIndex) => {
    this.setState({inStock:this.state.stock[itemIndex]})

    if (itemIndex == 0) {
      var prod = this.state.product.product;
      this.setState({dp : prod.displayPicture, mrp : prod.price,
      salePrice : prod.discountedPrice,
      discount : prod.price-prod.discountedPrice,selectedPk : null , inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex , sku : prod.serialNo,unit:prod.unit,unitPerpack:prod.howMuch});
    }else{
      var varient = this.state.product.product_variants[itemIndex-1]
      var prodImage	= varient.prodImage;
      if (prodImage) {
        this.setState({dp : SERVER_URL + prodImage, mrp : varient.price , salePrice : varient.discountedPrice , discount : varient.price - varient.discountedPrice , selectedPk : varient.pk, inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex , sku : varient.sku,unit:varient.unit,unitPerpack:varient.unitPerpack,})
      }
    }
    this.setState({ select: itemValue })
  }
  dropDownChangedIos = (itemValue, itemIndex) => {
    if(itemIndex == -1){
      itemIndex = 0
    }
    if (itemIndex == 0 ) {
      var prod = this.state.product.product;
      this.setState({dp : prod.displayPicture, mrp : prod.price,
      salePrice : prod.discountedPrice,
      discount : prod.price-prod.discountedPrice,selectedPk : null , inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex , sku : prod.serialNo,unit:prod.unit,unitPerpack:prod.howMuch});
    }else{
      var varient = this.state.product.product_variants[itemIndex-1]
      var prodImage	= varient.prodImage;
      if (prodImage) {
        this.setState({dp : SERVER_URL + prodImage, mrp : varient.price , salePrice : varient.discountedPrice , discount : varient.price - varient.discountedPrice , selectedPk : varient.pk, inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex , sku : varient.sku,unit:varient.unit,unitPerpack:varient.unitPerpack,})
      }
    }
    this.setState({ select: itemValue })
  }

  addToCart = ()=>{
    var varientCount = this.state.varientCount;
    varientCount[this.state.selectedIndex] = parseInt(this.state.selectedQty)

    this.props.onChange({count : parseInt(this.state.selectedQty) ,varient : this.state.selectedPk , pk : this.state.product.product.pk, salePrice : this.state.salePrice , dp : this.state.dp , name : this.state.product.product.name , mrp : this.state.mrp , discount : this.state.discount , sku : this.state.sku,listing : this.state.product.pk,unitPack:this.state.select,type:actionTypes.ADD_TO_CART,customizable:this.state.product.product.customizable,bulkChart:this.state.product.bulkChart})

    this.setState({ inCart: parseInt(this.state.selectedQty), varientCount : varientCount,orderTrashold:this.state.maxOrder })
  }

  increaseCart = ()=>{

    if (this.state.inCart == this.state.maxOrder) {
      this.refs.toast.show('You cannot order more than '+ this.state.inCart);
      return;
    }


    this.props.onChange({count : this.state.inCart ,varient : this.state.selectedPk , pk : this.state.product.product.pk, salePrice : this.state.salePrice, dp : this.state.dp , name : this.state.product.product.name , mrp : this.state.mrp , discount : this.state.discount , sku : this.state.sku,listing : this.state.product.pk,unitPack:this.state.select,type:actionTypes.INCREASE_CART,orderTrashold:this.state.maxOrder,customizable:this.state.product.product.customizable,bulkChart:this.state.product.bulkChart})

    var varientCount = this.state.varientCount;
    varientCount[this.state.selectedIndex] = this.state.inCart +1
    this.setState({ inCart: this.state.inCart +1, varientCount : varientCount })
  }

  decreaseCart = ()=>{
    this.props.onChange({count : this.state.inCart ,varient : this.state.selectedPk , pk : this.state.product.product.pk, salePrice : this.state.salePrice, dp : this.state.dp , name : this.state.product.product.name , mrp : this.state.mrp , discount : this.state.discount, sku : this.state.sku ,listing : this.state.product.pk,unitPack:this.state.select,type:actionTypes.DECREASE_CART,orderTrashold:this.state.maxOrder,customizable:this.state.product.product.customizable,bulkChart:this.state.product.bulkChart})

    var varientCount = this.state.varientCount;
    varientCount[this.state.selectedIndex] = this.state.inCart -1
    this.setState({ inCart: this.state.inCart -1 ,  varientCount : varientCount})
  }

  render() {
    const {inCart} = this.state;
    let varientChoices = this.state.varientChoices.map( (s, i) => {
        return <Picker.Item key={i} value={s} label={s} style={{width:width*0.4}} />
    });



    let varientChoicesIos = this.state.varientChoices.map( (s, i) => {
       return {label:s,value:s}
    });



    let cartActions=( this.state.inCart == 0 ?  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ borderWidth: 1, borderColor: themeColor, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, }}>
            <MonoText   style={{ color: '#fff', fontSize: 12, width: width * 0.1, height: 25, paddingVertical: 4, paddingLeft: 3, backgroundColor: themeColor, borderTopLeftRadius: 2, borderBottomLeftRadius: 2 }}>Qty</MonoText>
          </View>
          { Platform.OS === 'ios' &&


          <Dropdown
           data={items}
           onChangeText={(itemValue, itemIndex) => this.setState({ selectedQty: itemValue })}
           containerStyle={{height: 27,width: width * 0.26,borderTopRightRadius: 4,
           borderBottomRightRadius: 4,borderColor: themeColor,borderWidth: 1,}}
           inputContainerStyle={{paddingLeft:6,padding:4,   paddingTop:-10,fontSize: 12, height: 27, width: width * 0.26,borderWidth: 0,borderColor: themeColor,borderTopRightRadius: 4,
           borderBottomRightRadius: 4,
           color: '#000', }}
           value={this.state.selectedQty}
          pickerStyle={{borderWidth:0,  borderRadius:10, paddingLeft:10,width:width * 0.27 ,marginLeft:width * 0.05,marginTop:width * 0.03}}
         />

          }
          { Platform.OS === 'android' &&
          <View style={{ borderWidth: 1, borderColor: themeColor}}>

            <Picker
              selectedValue={this.state.selectedQty}
              mode="dropdown"
              style={{ height: 25, width: width * 0.26, }}
              onValueChange={(itemValue, itemIndex) => this.setState({ selectedQty: itemValue })}>
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
            </Picker>
          </View>
        }
          <View style={{ width: width * 0.16, marginLeft: width * 0.02, borderWidth: 1, borderColor: themeColor, }}>
            <TouchableOpacity style={{}} onPress={this.addToCart}>
              <MonoText   style={{ color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center', height: 25, paddingVertical: 4, paddingHorizontal: 2, backgroundColor: themeColor }}>+ <FontAwesome name="shopping-cart" size={14} color="#fff" /></MonoText>
            </TouchableOpacity>
          </View>

        </View> :(

        <View style={{flex : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', height: 25,paddingTop:3}}>

          <TouchableOpacity onPress={this.decreaseCart}>
            <View style={{width:50, borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
              <MonoText   style={{textAlign: 'center', color:'white'}} >-</MonoText>
            </View>
          </TouchableOpacity>

          <View style={{width:95, textAlign: 'center', borderWidth: 1, borderColor: themeColor, height: 26, paddingTop:2}}>
            <MonoText   style={{textAlign: 'center'}} >{this.state.inCart}</MonoText>
          </View>

          <TouchableOpacity onPress={this.increaseCart}>
            <View style={{width:50, textAlign: 'center', borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
              <MonoText   style={{textAlign: 'center', color:'white'}} >+</MonoText>
            </View>
          </TouchableOpacity>
        </View>
      ))


    return (

      <Card containerStyle={[styles.shadow, { borderWidth: 1, borderColor: '#fff', borderRadius: 7, width: width * 0.6, marginTop: 10, marginBottom: 5, paddingTop: 5 }]}>
        <View >
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
          <TouchableWithoutFeedback onPress={()=>this.props.navigation.navigate('ProductDetails',{product:this.state.product.pk,userScreen:this.props.userScreen})}>
          <View style={{ height: 40 }}>
            <MonoText   style={{ color: "#000", alignSelf: 'center', fontWeight: '700', fontSize: 15 }} numberOfLines={2} >{this.state.product.product.name} {this.state.select}</MonoText>
          </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={()=>this.props.navigation.navigate('ProductDetails',{product:this.state.product.pk,userScreen:this.props.userScreen})}>
          <View>
            <Image source={{ uri: this.state.dp }} style={{ width: width * 0.4, height: width * 0.4, alignSelf: 'center' }} />
          </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={()=>this.props.navigation.navigate('ProductDetails',{product:this.state.product.pk,userScreen:this.props.userScreen})}>
          <View style={{ marginTop: 10, padding: 0, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: width * 0.8, flex: 1 }}>
              <MonoText   style={{ textAlign: 'left', color: '#a2a2a2' }}>MRP &#8377;{this.state.mrp}</MonoText>
              <MonoText   style={{ textAlign: 'left', color: themeColor }}>Happy Price &#8377;{this.state.salePrice}</MonoText>
            </View>
            <View style={{ padding: 5, paddingLeft: 10, paddingRight: 10, borderWidth: 1, borderColor: themeColor, borderRadius: 3, }}>
              <MonoText   style={{ textAlign: 'center', color: 'black' }}>Save</MonoText>
              <MonoText   style={{ textAlign: 'center', color: 'red' }}>&#8377;{this.state.discount}</MonoText>
            </View>
          </View>
          </TouchableWithoutFeedback>
          <View style={{ marginTop: 10, padding: 0, height: 35, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ borderWidth: 1, borderColor: themeColor, width: width * 0.55 }}>
            { Platform.OS === 'ios' &&
            <Dropdown

             data={varientChoicesIos}
             onChangeText={(itemValue, itemIndex)=>this.dropDownChangedIos(itemValue, itemIndex-1)}
             containerStyle={{height: 27, width: width * 0.55,}}
             inputContainerStyle={{paddingLeft:6,padding:4,   paddingTop:-10,fontSize: 12, height: 27, width: width * 0.55,borderWidth: 0,borderColor: themeColor,borderTopRightRadius: 4,
             borderBottomRightRadius: 4,
             color: '#000',}}
             value={this.state.select}
            pickerStyle={{borderWidth:0,  borderRadius:10, paddingLeft:10,width:width * 0.27 ,marginLeft:width * 0.05,marginTop:width * 0.03}}
           />

            }
            { Platform.OS === 'android' &&

              <Picker
                selectedValue={this.state.select}
                mode="dropdown"
                style={{ height: 25, width: width * 0.55,opacity:1 }}
                onValueChange={(itemValue, itemIndex)=>this.dropDownChanged(itemValue, itemIndex)}>
                {varientChoices}
              </Picker>
            }
            </View>
          </View>
          <View style={{ marginTop: 10, height: 25 }}>
          { this.state.inStock < 1 &&
            <MonoText   style={{ color: '#fff', fontSize: 13, fontWeight: '300',marginTop:0, textAlign: 'center',  borderWidth: 0, paddingVertical: 4, paddingHorizontal: 3, backgroundColor: 'red' }}>SOLD OUT</MonoText>
          }
          { this.state.inStock >= 1 &&
          cartActions
          }

          </View>

        </View>
      </Card>
    );


    return null;
  }
}


const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollContainer: {

  }
})

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    height: 27, width: width * 0.26,
    padding:0,
    marginTop:-1,
    paddingLeft:2,
    borderWidth: 1,
    borderColor: themeColor,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    color: '#000', // to ensure the text is never behind the icon
  },
});
const pickerVarientStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    height: 27, width: width * 0.55,
    paddingLeft:3,
    color: '#000', // to ensure the text is never behind the icon
  },
});
