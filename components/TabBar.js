import React from 'react';
import {
  StyleSheet,Text,View,ScrollView,
  TouchableOpacity,Dimensions
} from 'react-native';
import { Ionicons ,FontAwesome,MaterialCommunityIcons } from '@expo/vector-icons';
import settings from '../constants/Settings.js';
const themeColor = settings.themeColor
const { width } = Dimensions.get('window');
import { MonoText } from './StyledText';
class TabBar extends React.Component {
  icons = [];
  constructor(props) {
    super(props);
    this.icons = [];

  }

  componentDidMount() {
    this._listener = this.props.scrollValue.addListener(this.setAnimationValue.bind(this));

  }

  setAnimationValue({ value, }) {
    this.icons.forEach((icon, i) => {
      const progress = (value - i >= 0 && value - i <= 1) ? value - i : 1;
      icon.setNativeProps({
        style: {
          color: this.iconColor(progress),
        },
      });
    });

  }

  //color between rgb(59,89,152) and rgb(204,204,204)
  iconColor(progress) {
    const red = 0 + (255 - 0) * progress;
    const green = 0 + (255 - 0) * progress;
    const blue = 0 + (255 - 0) * progress;
    return '#ffffff';
  }

  render() {
    return <View style={{marginRight:10}}>
      <ScrollView horizontal={true} style={[styles.tabs, this.props.style,{marginRight:10} ]} >
      {this.props.tabs.map((tab, i) => {
        return <TouchableOpacity initialPage={5}collapsableBar={tab} key={tab} onPress={() => this.props.goToPage(i)} style={[styles.tab,{borderBottomWidth:this.props.activeTab === i?3:0,borderBottomColor:this.props.activeTab === i?'red':themeColor }]}>
         {i == 0&&
           <MaterialCommunityIcons
             name='view-grid'
             size={width*0.06}
             color={this.props.activeTab === i ? '#ffffff' : '#ffffff'}
             ref={(icon) => { this.icons[i] = icon; }}
             style={{marginLeft:5}}
           />
         }
         {i == 1&&
          <FontAwesome
            name='money'
            size={width*0.06}
            color={this.props.activeTab === i ? '#ffffff' : '#ffffff'}
            ref={(icon) => { this.icons[i] = icon; }}
            style={{marginLeft:5}}
          />
        }
         {i == 2&&
          <FontAwesome
            name='line-chart'
            size={width*0.06}
            color={this.props.activeTab === i ? '#ffffff' : '#ffffff'}
            ref={(icon) => { this.icons[i] = icon; }}
            style={{marginLeft:5}}
          />
        }
        {i == 3&&
          <FontAwesome
          name='truck'
          reverse={true}
          size={width*0.06}
          color={this.props.activeTab === i ? '#ffffff' : '#ffffff'}
          ref={(icon) => { this.icons[i] = icon; }}
          style={{marginLeft:5}}
          />
        }
          <MonoText   style={{color:'#ffffff',marginLeft:5,fontSize:16,textAlign:'center',marginRight:20}}>
          {tab}
          </MonoText>
        </TouchableOpacity>

      })}
        </ScrollView>
    </View>
  }
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:'row',
    paddingBottom: 10,
  },
  tabs: {
    height: 45,
    flexDirection: 'row',
    paddingTop: 5,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

});

export default TabBar;
