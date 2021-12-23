import React from 'react';
import { Text ,Platform} from 'react-native';

export class MonoText extends React.Component {
  render() {
    if(Platform.OS === 'ios'){
      return <Text   {...this.props} style={[this.props.style, {  }]} />;
    }
    if(Platform.OS === 'android'){
      return <Text   {...this.props} style={[this.props.style, { fontFamily: 'OpenSans-Regular'}]} />;
    }
  }
}
