import React, {Component} from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,ScrollView,
} from 'react-native';
const PhoneWidth = Dimensions.get('window').width;
import { MonoText } from './StyledText';
const Button = (props) => {
    return (
        <TouchableOpacity {...props} activeOpacity={0.95}>
            {props.children}
        </TouchableOpacity>
    )
};
export default class SegmentTabBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
          store:props.store
        };
    }
    renderTab(name, page, isTabActive, onPressHandler) {
        const textColor = isTabActive ? '#0086E5' : '#fff';
        const backgroundColor = isTabActive ? '#fff' : '#fff';
        console.log(textColor)
        return <Button
            style={{flex: 1, height: 40, backgroundColor}}
            key={name}
            accessible={true}
            accessibilityLabel={name}
            accessibilityTraits='button'
            onPress={() => onPressHandler(page)}
        >
            <View style={[styles.tab]}>
                <MonoText   style={[{color: textColor, },]}>
                    {name}
                </MonoText>
            </View>
        </Button>;
    }

    render() {
        return (
            <View style={styles.tabBarBox}>
                <View style={ {flexDirection: 'row',flex:1}}>
                    {this.props.tabs.map((name, page) => {
                        const isTabActive = this.props.activeTab === page;
                        const renderTab = this.props.renderTab || this.renderTab;
                        return renderTab(name, page, isTabActive, this.props.goToPage);
                    })}
                </View>
            </View>
        );
    }

}
const styles = StyleSheet.create({
    tabBarBox: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3671ff',
    },
    iconBox: {
        margin: 15
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabs: {
        borderRadius: 2,
        borderColor: '#0086E5',
        borderWidth: 1,
        width: PhoneWidth / 3,
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-around',
    },
});
