import React from 'react';
import { StatusBar, ScrollView, View, Text, Image, Dimensions, StyleSheet, Picker, ActivityIndicator, TouchableOpacity, FlatList, Alert, AsyncStorage, ToastAndroid, Platform, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Card } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import { Dropdown } from 'react-native-material-dropdown-v2';
const { width } = Dimensions.get('window');
const height = width * 0.8

import { connect } from 'react-redux';
import cartItems from '../reducers/cartItems';
import { MonoText } from './StyledText';
import NetInfo from '@react-native-community/netinfo';
// import * as actions from '../actions/index';
import * as actionTypes from '../actions/actionTypes'
import Toast, { DURATION } from 'react-native-easy-toast';
import settings from '../constants/Settings.js';
const SERVER_URL = settings.url
const storeType = settings.storeType
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

export default class SimpleList extends React.Component {
  constructor(props) {
    super(props);
    var prod = props.product;
    var cartLoaderShow = props.cartLoaderShow
    var customUnit = ''
    const varientChoices = []
    const varientChoicesName = []
    const varientChoicesText = []
    var listofPk = []
    var stock = []
    listofPk[0] = null
    var varientCount = []
    var varientCart = []
    var varientMinOrderQty = []
    var varientMaxOrderQty = []
    var image = prod.image
    var value2 = []
    var value2List = []
    var gstType = props.product.gstType
    var taxRate = 0.00
    if (isFinite(String(props.product.taxRate))) {
      taxRate = Number(props.product.taxRate).toFixed(2)
    }
    function getUnit(type, value) {
      if (value != null) {
        var newValue = value
        if (type == 'Litre') {
          unit = 'L'
        } else if (type == 'Millilitre') {
          if (newValue >= 1000) {
            unit = 'L'
            newValue = newValue / 1000
            if (newValue % 1 != 0) {
              newValue = (newValue / 1000).toFixed(1)
            }
          } else {
            unit = 'ml'
          }
        } else if (type == 'Gram') {
          if (newValue >= 1000) {
            unit = 'kg'
            newValue = newValue / 1000
            if (newValue % 1 != 0) {
              newValue = (newValue / 1000).toFixed(1)
            }
          } else {
            unit = 'gm'
          }
        } else if (type == 'Kilogram') {
          unit = 'kg'
        } else if (type == 'Quantity') {
          unit = 'Qty'
        } else {
          unit = type
        }
        return newValue + ' ' + unit
      } else {
        if (type == 'Litre') {
          unit = 'L'
        } else if (type == 'Millilitre') {
          unit = 'ml'
        } else if (type == 'Gram') {
          unit = 'gm'
        } else if (type == 'Kilogram') {
          unit = 'kg'
        } else if (type == 'Quantity') {
          unit = 'Qty'
        } else {
          unit = type
        }
        return unit
      }

    }
    prod.variant.sort((a, b) => {
      var first = Number(a.price) - Number(a.sellingPrice)
      var second = Number(b.price) - Number(b.sellingPrice)
      if (a.stock == null || a.stock == 0) {
        first = 0
      }
      if (b.stock == null || b.stock == 0) {
        second = 0
      }
      return second - first
    })

    // prod.variant.forEach((i)=>{
    //   if(i.pk==257){
    //   }
    // })
    // var variantStock = []
    // prod.variant.forEach((i,index)=>{
    //   if(i.stock==null||i.stock==0){
    //     variantStock.push(index)
    //   }
    // })
    // var stockProducts = []
    // variantStock.forEach((i)=>{
    //   prod.variant.splice(i,1)
    //   stockProducts.push(prod.variant.splice(i,1))
    // })
    // stockProducts.forEach((i)=>{
    //   prod.variant.push(i)
    // })
    var salePrices = []

    for (var i = 0; i < prod.variant.length; i++) {
      var salePrice = prod.variant[i].sellingPrice
      if (taxRate != null && gstType == 'gst_extra') {
        salePrice = salePrice + (salePrice * taxRate) / 100
      } else {
        salePrice = salePrice
      }
      salePrices.push(salePrice)
      listofPk.push(prod.variant[i].pk)
      stock.push(prod.variant[i].stock)
      varientMinOrderQty.push(prod.variant[i].minQtyOrder)
      varientMaxOrderQty.push(prod.variant[i].maxQtyOrder)
      varientChoices.push(prod.variant[i].displayName)
      value2List.push(prod.variant[i].value2)
      if (prod.variant[i].displayName != null) {
        if (prod.variant[i].value != null) {
          var unit =
            varientChoicesText.push(getUnit(prod.variant[i].unitType, prod.variant[i].value))
        } else {
          varientChoicesText.push(getUnit(prod.variant[i].unitType, null))
        }
      } else {
        varientChoicesText.push(getUnit(prod.variant[i].unitType, prod.variant[i].value))
      }
      if (prod.variant[i].displayName != null) {
        var showText = prod.variant[i].displayName.replace(prod.name, '')
      } else {
        var showText = ''
      }
      if (prod.variant[i].unitType == 'Size and Color' || prod.variant[i].unitType == 'Qauntity and Color') {
        var text = prod.variant[i].value
        var color = prod.variant[i].value2
        if (value2.includes(text)) {
          var id = value2.indexOf(text)
          if (color != null) {
            varientChoicesName[id].value2.push({ color: color, index: i })
            varientChoicesName.push(null)
          }
        } else {
          if (color == null) {
            var arr = []
          } else {
            var arr = [{ color: color, index: i }]
          }
          varientChoicesName.push({ unit: 'Size', showText: showText, label: text, color: color, value: i, value2: arr })
          value2.push(text)
        }
        customUnit = 'Size and Color'
      } else {
        varientChoicesName.push({ unit: prod.variant[i].unitType, showText: showText, label: prod.variant[i].displayName.replace(prod.name, ''), color: '#000000', value: i, value2: null })
        customUnit = prod.variant[i].unitType
      }

      varientCount.push(0)
      varientCart.push(null)
      if (i == 0 && prod.variant[i].images.length > 0) {
        var image = prod.variant[i].images[0].attachment
      }
    }

    if (prod.variant[0] == undefined) {
      var select = null
      var selectName = null
      var salePrice = null
      var discount = null
      var mrp = null
      var maxOrder = null
      var minOrder = null
      var sku = null
      var unit = null
      var unitPerpack = null
    } else {
      var select = prod.name
      if (prod.variant[0].value != null) {
        var selectName = prod.variant[0].value + ' ' + prod.variant[0].unitType
      } else {
        var selectName = prod.variant[0].unitType
      }
      var salePrice = prod.variant[0].sellingPrice
      if (taxRate != null && gstType == 'gst_extra') {
        salePrice = salePrice + (salePrice * taxRate) / 100
      } else {
        salePrice = salePrice
      }
      var discount = (prod.variant[0].price - salePrice)
      var mrp = prod.variant[0].price
      var maxOrder = prod.variant[0].maxQtyOrder
      var minOrder = prod.variant[0].minQtyOrder
      var sku = prod.variant[0].sku
      var unit = prod.variant[0].unitType
      var unitPerpack = prod.variant[0].displayName
    }


    this.state = {
      select: select,
      selectName: selectName,
      quantity: 1,
      product: props.product,
      variants: prod.variant,
      varientChoices: varientChoices,
      inCart: 0,
      pkList: listofPk,
      mrp: mrp,
      stock: stock,
      inStock: stock[0],
      salePrice: salePrice,
      discount: discount,
      dp: SERVER_URL + image,
      maxOrder: maxOrder,
      minOrder: minOrder,
      selectedPk: null,
      selectedIndex: 0,
      varientCount: varientCount,
      varientCart: varientCart,
      selectedQty: 1,
      sku: sku,
      unit: unit,
      unitPerpack: unitPerpack,
      store: props.store,
      selectedStore: props.selectedStore,
      varientChoicesName: varientChoicesName,
      varientChoicesText: varientChoicesText,
      user: null,
      sessionid: null,
      csrf: null,
      cartItems: props.cartItems,
      customUnit: customUnit,
      selectedIdx: 0,
      colorIndex: 0,
      modalVisible: false,
      taxRate: taxRate,
      gstType: gstType,
      indexFind: props.index,
      cartLoder: cartLoaderShow,
      alias: props.product.alias,
      salePrices: salePrices,
      cartLoaderShow: cartLoaderShow,
      value2List: value2List
    }
  }





  componentWillReceiveProps({ cartItems, cartLoaderShow }) {
    const varientCount = this.state.varientCount;
    const varientCart = this.state.varientCart;
    for (var i = 0; i < varientCount.length; i++) {
      varientCount[i] = 0
    }
    cartItems.forEach((item, idx) => {
      // if(item.store==this.state.selectedStore.pk){
      this.state.product.variant.forEach((i, id) => {
        if (item.pk == i.pk) {
          varientCount[id] = cartItems[idx].count
          // varientCart[id] = cartItems[idx].cart
        }
      })
      // }
    })
    this.setState({ varientCount: varientCount, varientCart: varientCart })
    if (this.props.cartLoaderShow != cartLoaderShow) {
      this.setState({ cartLoder: cartLoaderShow })
    }
    // this.setState({inCart:this.state.varientCount[this.state.selectedIndex]})
    this.getUser()

  }
  getUser = async () => {
    var login = await AsyncStorage.getItem('login');
    if (JSON.parse(login)) {
      var pk = await AsyncStorage.getItem('userpk');
      var csrf = await AsyncStorage.getItem('csrf');
      var sessionid = await AsyncStorage.getItem('sessionid');
      this.setState({ user: pk, csrf: csrf, sessionid: sessionid })
    }
  }
  componentDidMount() {
    const varientCount = this.state.varientCount;
    const varientCart = this.state.varientCart;
    for (var i = 0; i < varientCount.length; i++) {
      varientCount[i] = 0
    }
    this.state.cartItems.forEach((item, idx) => {
      // if(item.store==this.state.selectedStore.pk){
      this.state.product.variant.forEach((i, id) => {
        if (item.pk == i.pk) {
          varientCount[id] = this.state.cartItems[idx].count
          // varientCart[id] = this.state.cartItems[idx].cart
        }
      })
      // }
    })
    this.setState({ varientCount: varientCount, varientCart: varientCart })
    this.setState({ inCart: this.state.varientCount[this.state.selectedIndex] })
    this.getUser()
  }

  dropDownChanged = (itemValue, itemIndex) => {
    this.setState({ selectedIndex: itemIndex, })
    var image = this.state.product.image
    var variant = this.state.product.variant[itemIndex]
    var salePrice = variant.sellingPrice
    if (variant.images.length > 0) {
      var image = variant.images[0].attachment
    }
    if (this.state.gstType == 'gst_extra') {
      salePrice = salePrice * (1.00 + this.state.taxRate / 100)
    }

    var discount = variant.price - salePrice
    this.setState({ dp: SERVER_URL + image, mrp: variant.price, salePrice: salePrice, discount: discount, selectedPk: variant.pk, inCart: this.state.varientCount[itemIndex], sku: variant.sku, unit: variant.unitType, unitPerpack: variant.displayName, inStock: variant.stock })
    this.setState({ maxOrder: variant.maxQtyOrder, minOrder: variant.minQtyOrder })
    this.setState({ selectName: itemValue })
    // this.setState({ selectName:itemValue})

  }
  changeParent = (itemValue, itemIndex) => {
    this.setState({ selectedIdx: itemIndex })
    var image = this.state.product.image
    var variant = this.state.product.variant[itemIndex]

    if (variant.images.length > 0) {
      var image = variant.images[0].attachment
    }
    this.setState({ dp: SERVER_URL + image, mrp: variant.price, salePrice: variant.sellingPrice, discount: variant.price - variant.sellingPrice, selectedPk: variant.pk, selectedIndex: itemIndex, sku: variant.sku, unit: variant.unitType, unitPerpack: variant.displayName, inStock: this.state.stock[itemIndex] })
    this.setState({ selectName: itemValue, colorIndex: 0 })
    // this.setState({ select: this.state.varientChoices[itemIndex],selectName:itemValue,colorIndex:0})
  }
  changeItem = (colorIndex, itemIndex) => {

    this.setState({ colorIndex: colorIndex })
    var image = this.state.product.image
    var variant = this.state.product.variant[itemIndex]

    if (variant.images.length > 0) {
      var image = variant.images[0].attachment
    }
    this.setState({ dp: SERVER_URL + image, mrp: variant.price, salePrice: variant.sellingPrice, discount: variant.price - variant.sellingPrice, selectedPk: variant.pk, selectedIndex: itemIndex, sku: variant.sku, unit: variant.unitType, unitPerpack: variant.displayName, inStock: this.state.stock[itemIndex] })
    // this.setState({ select: this.state.varientChoices[itemIndex] })

  }



  dropDownChangedIos = (itemValue, itemIndex) => {
    if (itemIndex == -1) {
      itemIndex = 0
    }
    var image = this.state.product.image
    var variant = this.state.product.variant[itemIndex]

    if (variant.images.length > 0) {
      var image = variant.images[0].attachment
    }
    this.setState({ dp: SERVER_URL + image, mrp: variant.price, salePrice: variant.sellingPrice, discount: variant.price - variant.sellingPrice, selectedPk: variant.pk, inCart: this.state.varientCount[itemIndex], selectedIndex: itemIndex, sku: variant.sku, unit: variant.unitType, unitPerpack: variant.displayName, inStock: variant.stock })
    this.setState({ maxOrder: variant.maxQtyOrder, minOrder: variant.minQtyOrder })
    // this.setState({ select: itemValue })
  }


  addToCartUpdate = () => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        var selected = this.state.product.variant[this.state.selectedIndex]
        if (this.state.user == null) {
          this.props.navigation.navigate('LogInScreen')
          return
        }
        var obj = { productVariant: selected.pk, store: this.state.selectedStore.pk, count: selected.minQtyOrder, type: actionTypes.ADD_TO_CART, }
        this.postServiceCart(obj)
      }
    })
  }
  postCart = (obj, varientCount) => {

    var sessionid = this.state.sessionid;
    var csrf = this.state.csrf;
    if (obj.user != null) {
      this.setState({ cartLoder: true })
      var data = {
        product: obj.product,
        productVariant: obj.productVariant,
        store: obj.store,
        qty: obj.count,
      }
      fetch(SERVER_URL + '/api/POS/cart/', {
        method: 'POST',
        headers: {
          "Cookie": "csrftoken=" + csrf + ";sessionid=" + sessionid + ";",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
          'X-CSRFToken': csrf
        },
        body: JSON.stringify(data)
      })
        .then((response) => {
          if (response.status == 201 || response.status == 200) {
            return response.json()
          } else {
            return undefined
          }
        })
        .then((responseJson) => {
          if (responseJson != undefined) {
            obj.product = responseJson.product.pk,
              obj.productVariant = responseJson.productVariant.pk,
              obj.store = responseJson.store,
              obj.count = responseJson.qty,
              obj.sellingPrice = responseJson.sellingPrice,
              obj.mrp = responseJson.productVariant.price,
              obj.discount = responseJson.price - responseJson.sellingPrice,
              obj.bulkChart = responseJson.bulk,
              obj.discountedPrice = responseJson.sellingPrice
            obj.cart = responseJson.pk
            obj.count = responseJson.qty
            obj.addon = responseJson.addon
            obj.customDetails = responseJson.customDetails
            obj.customFile = responseJson.customFile
            obj.is_fav = responseJson.is_fav
            obj.is_changed = responseJson.is_changed
            obj.taxPrice = responseJson.taxPrice
            obj.taxRate = responseJson.product.taxRate
            obj.addonPrice = responseJson.addonPrice
            obj.bulkDiscount = responseJson.bulkDiscount
            obj.promoValue = responseJson.promoValue
            obj.totalPrice = responseJson.price
            // this.setState({ inCart: responseJson.qty  , varientCount : varientCount })
            if (responseJson.qty > 0) {
              this.props.onChange(obj)
            }
          }
          this.setState({ cartLoder: false })
        }).catch((err) => {
          this.setState({ cartLoder: false })
        })

    } else {
      obj.count = obj.count
      obj.cart = obj.cart
      this.setState({ inCart: obj.count, varientCount: varientCount })
      this.props.onChange(obj)

    }
  }
  cartUpdate = (obj, type) => {
    var sessionid = this.state.sessionid;
    var csrf = this.state.csrf;
    if (type == 'increase') {
      var qty = obj.count + 1
    } else {
      var qty = obj.count - 1
    }
    if (obj.user != null) {
      this.setState({ cartLoder: true })
      var data = {
        qty: qty,
      }
      fetch(SERVER_URL + '/api/POS/cart/' + obj.cart + '/', {
        method: 'PATCH',
        headers: {
          "Cookie": "csrftoken=" + csrf + ";sessionid=" + sessionid + ";",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
          'X-CSRFToken': csrf
        },
        body: JSON.stringify(data)
      })
        .then((response) => {
          if (response.status == 201 || response.status == 200) {
            return response.json()
          } else {
            return undefined
          }
        })
        .then((responseJson) => {
          if (responseJson != undefined) {
            obj.product = responseJson.product.pk,
              obj.productVariant = responseJson.productVariant.pk,
              obj.store = responseJson.store,
              obj.count = responseJson.qty,
              obj.sellingPrice = responseJson.sellingPrice,
              obj.mrp = responseJson.productVariant.price,
              obj.discount = responseJson.price - responseJson.sellingPrice,
              obj.bulkChart = responseJson.bulk,
              obj.discountedPrice = responseJson.sellingPrice
            obj.cart = responseJson.pk
            obj.count = responseJson.qty
            obj.addon = responseJson.addon
            obj.customDetails = responseJson.customDetails
            obj.customFile = responseJson.customFile
            obj.is_fav = responseJson.is_fav
            obj.is_changed = responseJson.is_changed
            obj.taxPrice = responseJson.taxPrice
            obj.taxRate = responseJson.product.taxRate
            obj.addonPrice = responseJson.addonPrice
            obj.bulkDiscount = responseJson.bulkDiscount
            obj.promoValue = responseJson.promoValue
            obj.totalPrice = responseJson.price
            var varientCount = this.state.varientCount;
            varientCount[this.state.selectedIndex] = responseJson.qty
            // this.setState({ inCart: responseJson.qty , varientCount : varientCount })
            this.props.onChange(obj)
          }
          this.setState({ cartLoder: false })
        }).catch((err) => {
          this.setState({ cartLoder: false })
        })

    } else {
      var varientCount = this.state.varientCount;
      varientCount[this.state.selectedIndex] = qty
      this.setState({ inCart: qty, varientCount: varientCount })
      this.props.onChange(obj)
    }
  }

  cartDataUpdate = (obj) => {
    this.setState({ cartLoder: true })

    var sessionid = this.state.sessionid;
    var csrf = this.state.csrf;

    console.log(obj.count, 'jjjjjjjjjjjjjjjj');
    var data = {
      productVariant: obj.productVariant,
      store: obj.store,
      qty: obj.count
    }
    fetch(SERVER_URL + '/api/POS/cartService/', {
      method: 'POST',
      headers: {
        "Cookie": "csrftoken=" + csrf + ";sessionid=" + sessionid + ";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        console.log(response.status, 'ptjhujthiop');
        if (response.status == 201 || response.status == 200) {
          return response.json()
        } else {
          return undefined
        }
      })
      .then((responseJson) => {
        this.setState({ cartLoder: false })

        console.log(responseJson, 'ptjhujthiop');
        if (responseJson != undefined) {
          if (responseJson.msg.length > 0) {
            this.refs.toast.show(responseJson.msg)
          }
          obj.pk = responseJson.pk
          obj.count = responseJson.qty
          this.setState({ inCart: responseJson.qty })
          if (responseJson.qty == 0) {
            obj.type = 'delete'
          }
          this.props.onChange(obj)
          this.props.setCounterAmount(responseJson.cartQtyTotal, responseJson.cartPriceTotal, responseJson.saved)
        }

      }).catch((err) => {
        this.setState({ cartLoder: false })
      })


  }

  postServiceCart = (obj) => {
    this.setState({ cartLoder: true })

    var sessionid = this.state.sessionid;
    var csrf = this.state.csrf;

    var data = {
      productVariant: obj.productVariant,
      store: obj.store,
      qty: obj.count,
    }
    fetch(SERVER_URL + '/api/POS/cartService/', {
      method: 'POST',
      headers: {
        "Cookie": "csrftoken=" + csrf + ";sessionid=" + sessionid + ";",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': SERVER_URL,
        'X-CSRFToken': csrf
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        if (response.status == 201 || response.status == 200) {
          return response.json()
        } else {
          return undefined
        }
      })
      .then((responseJson) => {
        this.setState({ cartLoder: false })

        if (responseJson != undefined) {
          if (responseJson.msg.length > 0) {
            this.refs.toast.show(responseJson.msg)
          }
          obj.pk = responseJson.pk
          obj.count = responseJson.qty
          this.setState({ inCart: responseJson.qty })
          this.props.onChange(obj)
          this.props.setCounterAmount(responseJson.cartQtyTotal, responseJson.cartPriceTotal, responseJson.saved)
        }

      }).catch((err) => {
        this.setState({ cartLoder: false })
      })

  }

  increaseCart = () => {
    var varientCount = this.state.varientCount;

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        var selected = this.state.product.variant[this.state.selectedIndex]
        if (this.state.user == null) {
          this.props.navigation.navigate('LogInScreen')
          return
        }
        var obj = { productVariant: selected.pk, store: this.state.selectedStore.pk, count: varientCount[this.state.selectedIndex] + 1, type: actionTypes.INCREASE_CART, }
        this.cartDataUpdate(obj)
      }
    })

  }


  decreaseCart = () => {
    var varientCount = this.state.varientCount;

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        var selected = this.state.product.variant[this.state.selectedIndex]
        if (this.state.user == null) {
          this.props.navigation.navigate('LogInScreen')
          return
        }
        var obj = { productVariant: selected.pk, store: this.state.selectedStore.pk, count: varientCount[this.state.selectedIndex] - 1, type: actionTypes.DECREASE_FROM_CART, }
        this.cartDataUpdate(obj)
      }
    })
  }

  removeCart = (obj) => {
    var sessionid = this.state.sessionid;
    const csrf = this.state.csrf;
    if (obj.user != null) {
      this.setState({ cartLoder: true })
      fetch(SERVER_URL + '/api/POS/cart/' + obj.cart + '/', {
        method: 'DELETE',
        headers: {
          "Cookie": "csrftoken=" + csrf + ";sessionid=" + sessionid + ";",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': SERVER_URL,
          'X-CSRFToken': csrf
        },
      })
        .then((response) => {
          if (response.status == 201 || response.status == 200 || response.status == 204) {
            obj.type = 'delete'
            this.props.onChange(obj)
            return
          }
        })
        .then((responseJson) => {
          this.setState({ cartLoder: false })
          return
        }).catch((err) => {
          this.setState({ cartLoder: false })
        })
    } else {
      obj.type = 'delete'
      this.props.onChange(obj)
    }
  }

  openVarientSelection = () => {
    var variantChoices = this.state.varientChoicesText.map((s, i) => {
      return { name: s, sellingPrice: this.state.salePrices[i], mrp: this.state.product.variant[i].price }
    })
    var obj = { name: this.state.select, variants: variantChoices, selectedIndex: this.state.selectedIndex, indexFind: this.state.indexFind, value2: this.state.value2List }
    this.props.openVariantSelection(obj)
  }

  renderOption = (settings) => {
    const { item, getLabel } = settings
    return (
      <View style={styles.optionContainer}>
        <View style={styles.innerContainer}>
          <View style={[styles.box, { backgroundColor: item.color }]} />
          <MonoText style={{ color: item.color, alignSelf: 'flex-start' }}>{getLabel(item)}</MonoText>
        </View>
      </View>
    )
  }

  showHide = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
  }

  render() {
    let { gstType, taxRate } = this.state

    let varientChoicesText = this.state.varientChoicesText.map((s, i) => {
      return <Picker.Item key={i} value={s} label={s}  ></Picker.Item>
    });
    let varientChoicesName = this.state.varientChoicesName.map((s, i) => {
      if (s != null && s != undefined) {
        return <Picker.Item key={i} value={s.showText} label={s.showText}  ></Picker.Item>
      }
    });

    var themeColor = this.props.store.themeColor

    let varientChoicesIos = this.state.varientChoices.map((s, i) => {
      return { label: s, value: s }
    });
    let units = this.state.select

    let cartActions = (this.state.cartLoder ? <View style={{ width: width * 0.16, height: 27, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={20} color={themeColor} /></View> : (this.state.varientCount[this.state.selectedIndex] == 0 ?
      <TouchableOpacity style={{ width: width * 0.16, height: 27, marginLeft: width * 0.05, backgroundColor: themeColor, alignItems: 'center', justifyContent: 'center', }} onPress={this.addToCartUpdate}>
        <MonoText style={{ color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center', }}>+ <FontAwesome name="shopping-cart" size={14} color="#fff" /></MonoText>
      </TouchableOpacity> : (

        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 25, marginTop: 2 }}>

          <TouchableOpacity onPress={this.decreaseCart}>
            <View style={{ width: 25, borderWidth: 1, borderColor: themeColor, backgroundColor: themeColor, height: 27, alignItems: 'center', justifyContent: 'center', }}>
              <MonoText style={{ textAlign: 'center', color: 'white' }} >-</MonoText>
            </View>
          </TouchableOpacity>

          <View style={{ minWidth: 25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, height: 27, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 }}>
            <MonoText style={{ textAlign: 'center', color: '#000' }} >{this.state.varientCount[this.state.selectedIndex]}</MonoText>
          </View>

          <TouchableOpacity onPress={this.increaseCart}>
            <View style={{ width: 25, textAlign: 'center', borderWidth: 1, borderColor: themeColor, backgroundColor: themeColor, height: 27, alignItems: 'center', justifyContent: 'center', }}>
              <MonoText style={{ textAlign: 'center', color: 'white' }} >+</MonoText>
            </View>
          </TouchableOpacity>


        </View>
      )))




    return (

      <Card containerStyle={[styles.shadow, { borderWidth: 1, borderColor: '#fff', borderRadius: 7, width: width * 0.9, marginTop: 10, marginBottom: 15, paddingTop: 5, marginHorizontal: 5 }]}>

        <View style={{ flexDirection: 'row', flex: 1, }}>
          <Toast style={{ backgroundColor: 'grey' }} textStyle={{ color: '#fff' }} ref="toast" position='top' />

          <TouchableWithoutFeedback onPress={() => { if (this.state.store.quickadd) return; this.props.navigation.navigate('ProductDetails', { product: this.state.product.pk, userScreen: this.props.userScreen }) }}>
            <>
              <View style={{ alignSelf: 'flex-start', width: width * 0.36 }}>
                <Image source={{ uri: this.state.dp }} style={{ width: width * 0.3, height: width * 0.3, alignSelf: 'flex-start' }} />
              </View>

            </>
          </TouchableWithoutFeedback>
          <View style={{ width: width * 0.64 }}>
            <TouchableWithoutFeedback onPress={() => { if (this.state.store.quickadd) return; this.props.navigation.navigate('ProductDetails', { product: this.state.product.pk, userScreen: this.props.userScreen }) }}>
              <View style={{ height: 40, alignItems: 'flex-start', align: 'flex-end', marginTop: 5, marginBottom: 5 }}>
                <MonoText style={{ color: "#000", textAlign: 'center', fontWeight: '700', fontSize: 15 }} maxnumberOfLines={2} > {this.state.select}</MonoText>
                {this.state.alias != undefined && this.state.alias.length > 0 &&
                  <MonoText style={{ color: '#000', textAlign: 'center', marginTop: 5, fontSize: 15, }} > {this.state.alias}</MonoText>
                }
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => { if (this.state.store.quickadd) return; this.props.navigation.navigate('ProductDetails', { product: this.state.product.pk, userScreen: this.props.userScreen }) }}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', }}>
                <MonoText style={{ color: '#000', marginTop: 1, fontSize: 16, paddingRight: 8, borderRightWidth: 1, borderRightColor: 'grey' }}>&#8377;{Math.round(this.state.salePrices[this.state.selectedIndex])}</MonoText>
                <MonoText style={{ color: 'grey', marginTop: 1, fontSize: 16, paddingRight: 8, borderRightWidth: 1, marginLeft: 8, borderRightColor: 'grey' }}>&#8377;{Math.round(this.state.mrp)}</MonoText>
                <MonoText style={{ color: 'red', marginTop: 1, fontSize: 16, marginLeft: 8 }}><MonoText style={{ color: 'red' }}>Save</MonoText>  &#8377;{Math.round(this.state.discount)}</MonoText>
              </View>
            </TouchableWithoutFeedback>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 10 }}>
              <View style={{ borderWidth: this.state.customUnit == 'Size and Color' ? !this.state.store.quickadd ? 0 : 0 : 0, borderColor: themeColor, marginRight: this.state.customUnit == 'Size' ? !this.state.store.quickadd ? 0 : 10 : 10, }}>

                {this.state.varientChoicesName.length <= 1 && this.state.customUnit != 'Size and Color' && this.state.varientChoicesName[0] != undefined &&
                  <View style={{ width: this.state.store.quickadd ? (width * 0.27) : (width * 0.54), height: 27, alignItems: 'flex-start', justifyContent: 'center', borderWidth: storeType == 'MULTI-OUTLET' ? 0 : 0, borderColor: themeColor, }}>
                    <MonoText style={{ color: '#000', fontSize: 16, textAlign: 'center', }} numberOfLines={1}>{this.state.varientChoicesText[0]}</MonoText>
                  </View>
                }
                {this.state.store.quickadd && this.state.customUnit == 'Size and Color' && this.state.varientChoicesName.length <= 1 && this.state.varientChoicesName[0] != undefined &&
                  <View style={{ width: this.state.store.quickadd ? (width * 0.27) : (width * 0.54), height: 27, alignItems: 'flex-start', justifyContent: 'center', borderWidth: storeType == 'MULTI-OUTLET' ? 0 : 0, borderColor: themeColor, }}>
                    <MonoText style={{ color: '#000', fontSize: 16, textAlign: 'center', }} numberOfLines={1}>{this.state.varientChoicesText[0]}</MonoText>
                  </View>
                }
                {!this.state.store.quickadd && this.state.customUnit == 'Size and Color' && this.state.varientChoicesName.length <= 1 && this.state.varientChoicesName[0] != undefined &&
                  <View style={{ width: this.state.store.quickadd ? (width * 0.27) : (width * 0.54), height: 27, alignItems: 'flex-start', justifyContent: 'center', borderWidth: storeType == 'MULTI-OUTLET' ? 0 : 0, borderColor: themeColor, }}>
                    <View style={{ flex: 1, flexDirection: 'row', }}>
                      <View style={{ justifyContent: 'center', alignItems: 'flex-start', flex: 1, flexDirection: 'row', }}>
                        <MonoText style={{ color: '#000', fontSize: 16, textAlign: 'center', }} numberOfLines={1}>{this.state.varientChoicesText[0]} </MonoText>
                        <View style={{ backgroundColor: this.state.value2List[0], width: 14, height: 14, borderRadius: 7, marginLeft: 5 }}>
                        </View>
                      </View>
                    </View>
                  </View>
                }
                {this.state.store.quickadd && this.state.customUnit == 'Size and Color' && this.state.varientChoices.length > 1 &&
                  <Picker
                    selectedValue={this.state.selectName}
                    mode="dropdown"
                    style={{ flex: 1, height: 25, width: width * 0.27 }}
                    onValueChange={(itemValue, itemIndex) => this.dropDownChanged(itemValue, itemIndex)}>
                    {varientChoicesText}
                  </Picker>
                }

                {!this.state.store.quickadd && this.state.customUnit == 'Size and Color' && this.state.varientChoices.length > 1 &&
                  <View>

                    <TouchableOpacity onPress={() => { this.openVarientSelection() }} style={{ height: 27, width: this.state.store.quickadd ? (width * 0.27) : (width * 0.54), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: themeColor }}>
                      <View style={{ width: '80%' }}>
                        <MonoText style={{ color: '#000', fontSize: 16, paddingHorizontal: 5 }} numberOfLines={1}>{this.state.varientChoicesText[this.state.selectedIndex]}</MonoText>
                      </View>
                      <View style={{ width: '20%', justifyContent: 'center', }}>
                        <MaterialIcons name={'arrow-drop-down'} color={storeType == 'MULTI-OUTLET' ? 'red' : themeColor} size={30} />
                      </View>
                    </TouchableOpacity>
                  </View>



                }




                {(this.state.customUnit != 'Size and Color' && this.state.varientChoices.length > 1) &&


                  <TouchableOpacity onPress={() => { this.openVarientSelection() }} style={{ height: 27, width: this.state.store.quickadd ? (width * 0.27) : (width * 0.54), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: themeColor }}>
                    <View style={{ width: '70%' }}>
                      <MonoText style={{ color: '#000', fontSize: 16, paddingHorizontal: 5 }} numberOfLines={1}>{this.state.varientChoicesText[this.state.selectedIndex]}</MonoText>
                    </View>
                    <View style={{ width: '30%', justifyContent: 'center', }}>
                      <MaterialIcons name={'arrow-drop-down'} color={storeType == 'MULTI-OUTLET' ? 'red' : themeColor} size={30} />
                    </View>
                  </TouchableOpacity>

                }

              </View>
              {this.state.store.quickadd &&
                <View>
                  {this.state.inStock < 1 &&
                    <View style={{
                      width: width * 0.20, height: 27, paddingVertical: 4, marginLeft: width * 0.01, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: '#f00'
                    }}>
                      <MonoText style={{ color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center', }}>Sold Out</MonoText>
                    </View>
                  }
                  {this.state.inStock >= 1 &&
                    <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                      {cartActions}
                    </View>
                  }
                </View>
              }
            </View>
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
    elevation: 0,
  },
  scrollContainer: {

  }
})

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    height: 27, width: width * 0.26,
    padding: 0,
    marginTop: -1,
    paddingLeft: 2,
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
    paddingLeft: 3,
    color: '#000', // to ensure the text is never behind the icon
  },
});

{/*<Picker
  selectedValue={this.state.selectName}
  mode="dropdown"
  style={{ flex:1,height:25, width: this.state.store.quickadd?(width * 0.27):(width * 0.54) }}
  onValueChange={(itemValue, itemIndex)=>this.dropDownChanged(itemValue, itemIndex)}>
  {varientChoicesText}
</Picker>*/}

// <MonoText   style={{ color: '#fff', fontSize: 13, fontWeight: '300',marginTop:10, textAlign: 'center',  borderWidth: 0, paddingVertical: 4, paddingHorizontal: 5, backgroundColor: 'red' }}>SOLD OUT</MonoText>
// <TouchableWithoutFeedback onPress={()=>{if(this.state.store.quickadd) return;this.props.navigation.navigate('ProductDetails',{product:this.state.product.pk,userScreen:this.props.userScreen})}}>
// <View style={{ marginTop: 10, padding: 0, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
//   <View style={{ width: width * 0.8, flex: 1 }}>
//     <MonoText   style={{ textAlign: 'left', color: '#a2a2a2' }}>MRP &#8377;{Math.round(this.state.mrp)}</MonoText>
//     <MonoText   style={{ textAlign: 'left', color: themeColor }}>Happy Price &#8377;{Math.round(this.state.salePrice)}</MonoText>
//   </View>
//   <View style={{ padding: 5, paddingLeft: 10, paddingRight: 10, borderWidth: 1, borderColor: themeColor, borderRadius: 3, }}>
//     <MonoText   style={{ textAlign: 'center', color: 'black' }}>Save</MonoText>
//     <MonoText   style={{ textAlign: 'center', color: 'red' }}>&#8377;{Math.round(this.state.discount)}</MonoText>
//   </View>
// </View>
//
// </TouchableWithoutFeedback>

//
// { this.state.varientChoicesName.length <=1 && this.state.customUnit!='Size and Color'&&this.state.varientChoicesName[0]!=undefined&&
//   <MonoText   style={{ color: '#000',   fontSize: 16,width: this.state.store.quickadd?(width * 0.27):(width * 0.51) ,height:25,textAlign:'center',paddingHorizontal: 4}} numberOfLines={1}>{this.state.varientChoicesText[0]}</MonoText>
// }
// {this.state.store.quickadd&&this.state.customUnit=='Size and Color'&&this.state.varientChoicesName.length <=1 &&this.state.varientChoicesName[0]!=undefined&&
// <MonoText   style={{ color: '#000',   fontSize: 16,width:width * 0.27,height:25,textAlign:'center',paddingHorizontal: 4}} numberOfLines={1}>{this.state.varientChoicesText[0]}</MonoText>
// }




{/*<View style={{width:'100%'}}>
  <View style={{flex:1}}>
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
      <View style={{flexDirection:'row',}}>
        <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginTop: 5, paddingLeft: 0,marginBottom:10,paddingBottom:0,}}
        data={this.state.varientChoicesName}
        keyExtractor={(item,index) => {
          return index.toString();
        }}
        extraData={this.state}
        numColumns={5}
        nestedScrollEnabled={true}
        renderItem={({item, index}) => (
          <View key={index}>
          {item!=null&&
            <TouchableOpacity onPress={()=>this.changeParent(item.showText, index)} style={{backgroundColor:this.state.selectedIdx==index?themeColor:'#fff',height:30,minWidth:40,marginRight:10,borderRadius: 5,borderWidth:1,borderColor:this.state.selectedIdx==index?themeColor:'grey',alignItems: 'center',justifyContent: 'center',paddingHorizontal: 10,}}>
            <MonoText   style={{color:this.state.selectedIdx==index?'#fff':'grey', }}>{item.label}</MonoText>
            </TouchableOpacity>
          }
          </View>
        )}
        />
      </View>
    </ScrollView>
  </View>

  <View style={{ flex:1}}>
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
      <View style={{flexDirection:'row',width:'100%'}}>
      {this.state.varientChoicesName[this.state.selectedIdx].value2!=null&&
        <FlatList style={{borderColor : '#fff' , borderWidth:2,margin:0,backgroundColor:'#fff',marginTop: 0 ,marginBottom:0,paddingBottom:0}}
        data={this.state.varientChoicesName[this.state.selectedIdx].value2}
        keyExtractor={(item,index) => {
          return index.toString();
        }}
        listKey={(item2, index) => 'D' + index.toString()}
        extraData={this.state}
        numColumns={5}

        nestedScrollEnabled={true}
        renderItem={({item, index}) => (
          <View key={index} style={{justifyContent: 'center',height:30}}>
          <TouchableOpacity onPress={()=>{this.changeItem(index,item.index)}} style={{backgroundColor: item.color,width:index==this.state.colorIndex?26:22,height:index==this.state.colorIndex?26:22,marginRight:20,borderRadius: index==this.state.colorIndex?13:11}}>
          </TouchableOpacity>
          </View>
        )}
        />
      }
      </View>
    </ScrollView>
  </View>
 </View>*/}


 // <Picker
 //   selectedValue={this.state.selectName}
 //   mode="dropdown"
 //   style={{ flex:1,height:25, width:width * 0.27 }}
 //   onValueChange={(itemValue, itemIndex)=>this.dropDownChanged(itemValue, itemIndex)}>
 //   {varientChoicesName}
 // </Picker>
 // { (this.state.varientChoices.length >1&& Platform.OS === 'ios') &&
 //     <Dropdown
 //      data={varientChoicesIos}
 //      onChangeText={(itemValue, itemIndex)=>this.dropDownChangedIos(itemValue, itemIndex-1)}
 //      containerStyle={{
 //        height:25
 //      }}
 //      inputContainerStyle={{
 //        height:25,paddingLeft:6,padding:4, width: width * 0.27,  paddingTop:-10, borderWidth: 0,fontSize:16,backgroundColor:'#ffffff'
 //      }}
 //      value={this.state.select}
 //     pickerStyle={{borderWidth:0,  borderRadius:10, paddingLeft:10,width:width * 0.27 ,marginLeft:width * 0.05,marginTop:width * 0.03}}
 //    />
 //   }
