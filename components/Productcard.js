import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList ,Platform} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown-v2';
import { MonoText } from './StyledText';

const { width } = Dimensions.get('window');
const height = width * 0.8

export default class Productcard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      select: '1kg',
      quantity: 1,
    }
  }

  render() {


    const { products } = this.props

    return (

      <FlatList
        style={{ paddingBottom: 100 }}
        data={products}
        keyExtractor={(item, index) => {
          return index.toString();
        }}
        renderItem={(products) => {
          const item = products.item
          return (

            <Card containerStyle={[styles.shadow, { borderWidth: 1, borderColor: '#fff', borderRadius: 7, width: width * 0.9, marginTop: 10, marginBottom: 10 }]}>
              <View >
                <View>
                  <MonoText   style={{ color: "#000", alignSelf: 'center', fontWeight: '700', fontSize: 20 }} >{item.name}</MonoText>
                </View>
                <View>
                  <Image source={item.picture} style={{ width: width * 0.5, height: width * 0.5, alignSelf: 'center' }} />
                </View>
                <View style={{ borderWidth: 1, borderColor: '#efa834', marginTop: 10, padding: 0, height: 40 }}>
                  <Picker
                    selectedValue={item.variant[0]}
                    mode="dropdown"
                    style={{ height: 40, width: width * 0.8, }}
                    onValueChange={(itemValue, itemIndex) => this.setState({ select: itemValue })}>
                    <Picker.Item label="500g" value="java" />
                    <Picker.Item label="1kg" value="js" />
                  </Picker>
                </View>
                <View style={{ marginTop: 10, height: 40 }}>
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ borderWidth: 1, borderColor: '#efa834', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, }}>
                      <MonoText   style={{ color: '#fff', fontSize: 16, width: width * 0.13, height: 40, paddingVertical: 9, paddingHorizontal: 10, backgroundColor: '#efa834', borderTopLeftRadius: 7, borderBottomLeftRadius: 7 }}>Qty</MonoText>
                    </View>
                    <View style={{ borderWidth: 1, borderColor: '#efa834', }}>
                    { Platform.OS === 'ios' &&
                        <Dropdown
                         data={variant}
                         onChangeText={(itemValue, itemIndex) => this.setState({ select: itemValue })}
                         containerStyle={{ height: 40, width: width * 0.3, }}
                         inputContainerStyle={{ height: 40, width: width * 0.3,paddingLeft:6,padding:4, paddingTop:-10, borderWidth: 0,fontSize:16,backgroundColor:'#ffffff'}}
                         value={item.quantity[0]}
                        pickerStyle={{borderWidth:0,  borderRadius:10, paddingLeft:10,width:width * 0.3 ,marginLeft:width * 0.05,marginTop:width * 0.03}}
                       />
                      }
                      { Platform.OS === 'android' &&
                      <Picker
                        selectedValue={item.quantity[0]}
                        mode="dropdown"
                        style={{ height: 40, width: width * 0.3, }}
                        onValueChange={(itemValue, itemIndex) => this.setState({ select: itemValue })}>
                        {item.variant.map((variant, index) => {
                          return (< Picker.Item label={variant} value={index} key={index} />);
                        })}
                      </Picker>}
                    </View>
                    <View style={{ width: width * 0.27, marginLeft: width * 0.1 }}>
                      <TouchableOpacity style={{}}>
                        <MonoText   style={{ color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center', height: 40, paddingVertical: 9, paddingHorizontal: 10, backgroundColor: '#efa834' }}>ADD <FontAwesome name="shopping-cart" size={16} color="#fff" /></MonoText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

              </View>
            </Card>
          )
        }} />

    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingBottom: 200
  },
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
