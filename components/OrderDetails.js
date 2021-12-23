import * as React from 'react';
import { StatusBar, View, Text, Image, Dimensions, StyleSheet, Picker, TouchableOpacity, FlatList , Alert} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import  Constants  from 'expo-constants';
import { Card } from 'react-native-elements';
import ImageOverlay from "react-native-image-overlay";
import { MonoText } from './StyledText';

const { width } = Dimensions.get('window');
const height = width * 0.8
export default class OrderDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open : false,
      order :  props.order
    }

  }


  toggle=()=>{
    this.setState({open : !this.state.open})
  }

  render() {


    const { order } = this.props

    return (

      <View style={styles.item}>
        <TouchableOpacity onPress={() => this.toggle()}>
          <MonoText>{item.totalAmount}</MonoText>
        </TouchableOpacity>
        {this.state.open?<FlatList style={{borderColor : '#eeeeee' , borderWidth:2}}
          data={this.state.order}
          renderItem={({ item }) => (
            <TouchableOpacity >
              <Card  containerStyle={[styles.shadow, { borderWidth: 1, borderColor: '#fff', borderRadius: 7, marginTop: 10, marginBottom: 10 }]}>
                <MonoText   style={{fontSize:13}}>{item.totalAmount}</MonoText>
              </Card>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index}
        />:<View></View>}


      </View>
    );
  }
}


const styles = StyleSheet.create({
  item: {
    marginTop:10,
    borderRadius:10
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
