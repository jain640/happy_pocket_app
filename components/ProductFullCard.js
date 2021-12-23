import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList, Alert, Button, AsyncStorage , ToastAndroid,Platform,TouchableWithoutFeedback} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import { MonoText } from './StyledText';
import * as actionTypes from '../actions/actionTypes'
import Toast, {DURATION} from 'react-native-easy-toast';
const { width } = Dimensions.get('window');
const height = width * 0.8
import settings from '../constants/Settings.js';
const SERVER_URL = settings.url
const themeColor = settings.themeColor
import { Dropdown } from 'react-native-material-dropdown-v2';


export default class ProductFullCard extends React.Component {
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
    var varientCount = [0]
    var stock = [prod.product.stock]
    var listofPk = []
    listofPk[0] = null
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
      }else if (prod.product_variants[i].unit == 'Quantity'){
        varientChoices.push(prod.product_variants[i].unitPerpack + " Qty")
      }


      varientCount.push(0)
    }



    this.state = {
      select: prod.product.howMuch + " " + unit,
      selectVal: prod.product.howMuch + " " + prod.product.unit,
      quantity: 1,
      product : props.product,
      varientChoices : varientChoices,
      inCart : 0,
      pkList:listofPk,
      stock:stock,
      inStock:stock[0],
      mrp : prod.product.price,
      salePrice : prod.product.discountedPrice,
      discount : prod.product.price-prod.product.discountedPrice,
      dp : prod.product.displayPicture,
      maxOrder : prod.product.orderTrashold,
      selectedPk : null,
      selectedIndex : 0,
      varientCount : varientCount,
      sku : prod.product.serialNo,
      index:this.props.index,
      unit:prod.product.unit,
      unitPerpack:prod.product.howMuch

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


    this.setState({inCart:this.state.varientCount[itemIndex]})
    this.setState({inStock:this.state.stock[itemIndex]})

    if (itemIndex == 0) {
      var prod = this.state.product.product;


      this.setState({dp : prod.displayPicture, mrp : prod.price,
      salePrice : prod.discountedPrice,
      discount : prod.price-prod.discountedPrice,selectedPk : null , inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex, sku : prod.serialNo,unit:prod.unit,unitPerpack:prod.howMuch,selectVal:prod.howMuch+' '+prod.unit});
    }else{

      var varient = this.state.product.product_variants[itemIndex-1]

      var prodImage	= varient.prodImage;
      if (prodImage) {
        this.setState({dp : SERVER_URL + prodImage, mrp : varient.price , salePrice : varient.discountedPrice , discount : varient.discountPrice , selectedPk : varient.pk, inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex, sku : varient.sku,unit:varient.unit,unitPerpack:varient.unitPerpack,selectVal:varient.unitPerpack+' '+varient.unit })
      }else{
        this.setState({dp : this.state.product.product.displayPicture, mrp : varient.price , salePrice : varient.discountedPrice , discount : varient.discountPrice , selectedPk : varient.pk, inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex, sku : varient.sku,unit:varient.unit,unitPerpack:varient.unitPerpack,selectVal:varient.unitPerpack+' '+varient.unit })
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
      }else{
        this.setState({dp : this.state.product.product.displayPicture, mrp : varient.price , salePrice : varient.discountedPrice , discount : varient.discountPrice , selectedPk : varient.pk, inCart : this.state.varientCount[itemIndex], selectedIndex : itemIndex, sku : varient.sku,unit:varient.unit,unitPerpack:varient.unitPerpack,selectVal:varient.unitPerpack+' '+varient.unit })
      }
    }
    this.setState({ select: itemValue })
  }

  addToCart = ()=>{
    this.setState({inCart : 1})
    var varientCount = this.state.varientCount;
    var selectCount = varientCount[this.state.selectedIndex]
    varientCount[this.state.selectedIndex]= 1


    this.setState({varientCount : varientCount})
    this.props.onChange({count : varientCount[this.state.selectedIndex] ,varient : this.state.selectedPk , pk : this.state.product.product.pk, salePrice : this.state.salePrice, dp : this.state.dp , name : this.state.product.product.name , mrp : this.state.mrp , discount : this.state.discount, sku : this.state.sku, listing : this.state.product.pk,unitPack:this.state.select,type:actionTypes.ADD_TO_CART,orderTrashold:this.state.maxOrder,customizable:this.state.product.product.customizable,bulkChart:this.state.product.bulkChart})
    this.setState({inCart : 1})

  }

  increaseCart = ()=>{

    if (this.state.inCart == this.state.maxOrder) {
      this.refs.toast.show('You cannot order more than '+ this.state.inCart);
      return;
    }


    this.props.onChange({count : this.state.inCart ,varient : this.state.selectedPk , pk : this.state.product.product.pk, salePrice : this.state.salePrice , dp : this.state.dp , name : this.state.product.product.name , mrp : this.state.mrp , discount : this.state.discount, sku : this.state.sku, listing : this.state.product.pk,unitPack:this.state.select,type:actionTypes.INCREASE_CART,orderTrashold:this.state.maxOrder,customizable:this.state.product.product.customizable,bulkChart:this.state.product.bulkChart})

    var varientCount = this.state.varientCount;
    varientCount[this.state.selectedIndex] = this.state.inCart+1
    this.setState({ inCart: this.state.inCart+1 , varientCount : varientCount })

  }

  decreaseCart = ()=>{
    this.props.onChange({count : this.state.inCart ,varient : this.state.selectedPk , pk : this.state.product.product.pk, salePrice : this.state.salePrice, dp : this.state.dp , name : this.state.product.product.name , mrp : this.state.mrp , discount : this.state.discount, sku : this.state.sku , listing : this.state.product.pk,unitPack:this.state.select,type:actionTypes.DECREASE_CART,orderTrashold:this.state.maxOrder,customizable:this.state.product.product.customizable,bulkChart:this.state.product.bulkChart})

    var varientCount = this.state.varientCount;
    varientCount[this.state.selectedIndex] = this.state.inCart-1
    this.setState({ inCart: this.state.inCart-1,  varientCount : varientCount})

  }


  render() {

    let varientChoices = this.state.varientChoices.map( (s, i) => {
        return <Picker.Item key={i} value={s} label={s} style={{width:0.04,height:25}} />
    });

    let varientChoicesIos = this.state.varientChoices.map( (s, i) => {
       return {label:s,value:s}
    });

    console.log(this.state.select,'sect',thia.state.product.name);

    let units = this.state.select

    let cartActions=( this.state.inCart == 0 ?
        <TouchableOpacity style={{}} onPress={this.addToCart}>
          <MonoText   style={{ color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center',width: width * 0.16, height: 25, paddingVertical: 4, paddingHorizontal: 2, backgroundColor: themeColor }}>+ <FontAwesome name="shopping-cart" size={14} color="#fff" /></MonoText>
      </TouchableOpacity>:(

        <View style={{flex : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', height: 25,paddingTop:3}}>

          <TouchableOpacity onPress={this.decreaseCart}>
            <View style={{width:25, borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
              <MonoText   style={{textAlign: 'center', color:'white'}} >-</MonoText>
            </View>
          </TouchableOpacity>

          <View style={{width:25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, height: 26, paddingTop:2}}>
            <MonoText   style={{textAlign: 'center'}} >{this.state.inCart}</MonoText>
          </View>

          <TouchableOpacity onPress={this.increaseCart}>
            <View style={{width:25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, backgroundColor : themeColor, height: 26, paddingTop:2}}>
              <MonoText   style={{textAlign: 'center', color:'white'}} >+</MonoText>
            </View>
          </TouchableOpacity>


        </View>
      ))


    return (

       <Card containerStyle={[{ width: width,  flex: 1 }]}>
        <View>
          <Toast style={{backgroundColor: 'grey'}} textStyle={{color: '#fff'}} ref="toast" position = 'top'/>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
          <TouchableWithoutFeedback onPress={()=>this.props.navigation.navigate('ProductDetails',{product:this.state.product.pk,userScreen:this.props.userScreen})}>
            <View style={{ width: width * 0.36 }}>
              <Image source={{ uri: this.state.dp }} style={{ width: width * 0.3, height: width * 0.3, alignSelf: 'center' }} />
            </View>
            </TouchableWithoutFeedback>
            <View style={{ width: width * 0.64 }}>
            <TouchableWithoutFeedback onPress={()=>this.props.navigation.navigate('ProductDetails',{product:this.state.product.pk,userScreen:this.props.userScreen})}>
              <View style={{ flex: 1, alignItems: 'flex-start', marginRight: 10 }}>


                <MonoText   style={{ color: '#000', fontWeight: '700', marginTop: 10, textAlign: 'left', fontSize: 15 }}>{this.state.product.product.name} </MonoText>

              </View>
              </TouchableWithoutFeedback>
              <View style={{ flex: 1, alignItems: 'flex-start', marginTop: 10, marginRight: 20 }}>
              <TouchableWithoutFeedback onPress={()=>this.props.navigation.navigate('ProductDetails',{product:this.state.product.pk,userScreen:this.props.userScreen})}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 10 }}>
                  <View style={{ width: width * 0.27, paddingHorizontal: 3, paddingVertical: 2, borderWidth: 1, borderColor: themeColor, borderRadius: 3, marginRight: 10 }}>
                    <MonoText   style={{ textAlign: 'center', color: 'black' }}>Save</MonoText>
                    <MonoText   style={{ textAlign: 'center', color: 'red' }}>&#8377;{this.state.discount}</MonoText>
                  </View>
                  <View >
                    <MonoText   style={{ color: '#a2a2a2', marginTop: 2, fontSize: 14 }}>MRP &#8377;{this.state.mrp}</MonoText>
                    <MonoText   style={{ color: themeColor, marginTop: 1, fontSize: 14 }}>Happy Price &#8377;{this.state.salePrice}</MonoText>
                  </View>
                </View>
                </TouchableWithoutFeedback>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10 }}>
                  <View style={{ borderWidth: 1, borderColor: themeColor, marginRight: 10, }}>
                    { this.state.varientChoices.length <=1 &&
                      <MonoText   style={{ color: '#000',  fontSize: 16,width: width * 0.27 ,height:25,textAlign:'center' }}>{this.state.select}</MonoText>
                    }
                    { (this.state.varientChoices.length >1&& Platform.OS === 'ios') &&
                        <Dropdown




                         data={varientChoicesIos}
                         onChangeText={(itemValue, itemIndex)=>this.dropDownChangedIos(itemValue, itemIndex-1)}
                         containerStyle={{
                           height:25

                         }}
                         inputContainerStyle={{
                           height:25,paddingLeft:6,padding:4, width: width * 0.27,  paddingTop:-10, borderWidth: 0,fontSize:16,backgroundColor:'#ffffff'
                         }}
                         value={this.state.select}
                        pickerStyle={{borderWidth:0,  borderRadius:10, paddingLeft:10,width:width * 0.27 ,marginLeft:width * 0.05,marginTop:width * 0.03}}
                       />
                      }


                  { (this.state.varientChoices.length >1&& Platform.OS === 'android')  &&
                  <Picker
                    selectedValue={this.state.select}
                    mode="dropdown"
                    style={{ flex:1,height:25, width: width * 0.27 }}
                    onValueChange={(itemValue, itemIndex)=>this.dropDownChanged(itemValue, itemIndex)}>
                    {varientChoices}
                  </Picker>

                  }

                  </View>
                  <View>
                  { this.state.inStock < 1 &&
                    <MonoText   style={{ color: '#fff', fontSize: 13, fontWeight: '300',marginTop:10, textAlign: 'center',  borderWidth: 0, paddingVertical: 4, paddingHorizontal: 5, backgroundColor: 'red' }}>SOLD OUT</MonoText>
                  }
                  { this.state.inStock >= 1 &&
                  cartActions
                  }



                  </View>
                </View>
              </View>
            </View>
          </View>
         </View>
        </Card>

    );
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
  }
})

const pickerVarientStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    height: 25, width: width * 0.30 ,
    paddingLeft:3,
    color: '#000',
    borderWidth: 1,
    borderColor:'red'// to ensure the text is never behind the icon
  },
});
