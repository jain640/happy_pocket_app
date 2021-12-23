import * as React from 'react';
import { StatusBar ,View,FlatList,StyleSheet,TouchableOpacity,TouchableHighlight,Text,Dimensions,Image,AppState,BackHandler,AsyncStorage , TextInput, ScrollView , KeyboardAvoidingView, Platform, Button, Alert,ActivityIndicator, ToastAndroid , WebView} from 'react-native';
import  Constants  from 'expo-constants';
import settings from '../constants/Settings.js';
const { width } = Dimensions.get('window');
import Toast, {DURATION} from 'react-native-easy-toast';
import { MonoText } from '../components/StyledText';
export default class PaymentScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    return {
      header:null
    }
  };
  constructor(props){
    super(props);
    this.state = {

    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

  }
  handleBackButtonClick() {
    this.props.navigation.popToTop();
    return true;
  };

  componentDidMount() {

    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  componentWillMount() {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  render(){
    let url = this.props.navigation.getParam('url','')
    let error = this.props.navigation.getParam('errorname','')
    return (
      <View style={{flex:1}}>
        <View style={{height:Constants.statusBarHeight,backgroundColor:'#efa834'}}></View>
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <MonoText   style={{fontSize:22,color:'#ff0000',alignSelf:'center',marginBottom:5,fontWeight:'700'}} >Sorry.</MonoText> 
          <MonoText   style={{fontSize:26,color:'#ff0000',alignSelf:'center',marginBottom:10,fontWeight:'700'}} >{error}</MonoText> 
          <Button
          onPress={()=>this.props.navigation.navigate('checkoutScreen')}
          title="Go Back"
          color="#efa834"
          accessibilityLabel="Go Back"
          />
      </View>
      </View>
    )
  }


}
