import React from 'react';
import { Platform ,Image,View,TouchableOpacity} from 'react-native';
import { createBottomTabNavigator,createAppContainer,createSwitchNavigator,withNavigation} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack'
import TabBarIcon from '../components/TabBarIcon';
import IconWithBadge from '../components/IconWithBadge';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LogInScreen from '../screens/LogInScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import SubCategoryScreen from '../screens/SubCategoryScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import UserAcountScreen from '../screens/userAcountScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import SampleScreen from '../screens/SampleScreen';
import AddressScreen from '../screens/AddressScreen';
import SupportScreenV2 from '../screens/SupportScreenV2';
import ChatScreen from '../screens/ChatScreen';
import OrderSuceesScreen from '../screens/OrderSuceesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderFailureScreen from '../screens/OrderFailureScreen';
import SocialScreen from '../screens/SocialScreen';
import SupportScreen from '../screens/SupportScreen';
import FaqScreen from '../screens/FaqScreen';
import OtpScreen from '../screens/OtpScreen';
import TermsAndCondition from '../screens/TermsAndCondition';
import ViewAllScreen from '../screens/ViewAllScreen';
import ReferEarnScreen from '../screens/ReferEarnScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import OrderCreated from '../screens/OrderCreated';
import OrderProgress from '../screens/OrderProgress';
import OrderCompleted from '../screens/OrderCompleted';
import SearchScreenCopy2 from '../screens/SearchScreenCopy2';
import MemberShip from '../screens/MemberShip';
import ProductDetails from '../screens/ProductDetails';
import RequestForm from '../screens/RequestForm';
import RequestPost from '../screens/RequestPost';
import GiftSection from '../screens/GiftSection';
import StoreScreen from '../screens/StoreScreen';
import Policies from '../screens/Policies';
import NotificationScreen from '../screens/NotificationScreen';
import ForumDetailedScreen from '../screens/ForumDetailedScreen';
import ImageViewScreen from '../screens/ImageViewScreen';
import DrawerContent from '../components/DrawerContent';
import ProductScreen from '../screens/ProductScreen';
import { createDrawerNavigator,DrawerItems } from 'react-navigation-drawer';
import { FontAwesome ,MaterialCommunityIcons,MaterialIcons,SimpleLineIcons} from '@expo/vector-icons';
import WelcomeScreen from '../screens/WelcomeScreen';
import MyProductsScreen from '../screens/MyProductsScreen';
import RichTextScreen from '../screens/RichTextScreen';
import CameraScreen from '../screens/CameraScreen';
import SupportChatScreen from '../screens/SupportChatScreen';
import SellerOrdersScreen from '../screens/SellerOrdersScreen';
// import RichTextScreen1 from '../components/RichTextScreen1';
import SellerOrderCompo from '../components/SellerOrderCompo';
import TabBar from '../components/TabBar';
import Accepted from '../components/Accepted';
import Packed from '../components/Packed';
import Shipped from '../components/Shipped';
import Delivered from '../components/Delivered';
import Return from '../components/Return';
import Replacement from '../components/Replacement';
import Cancelled from '../components/Cancelled';
import History from '../components/History';
import RTO from '../components/RTO';
import NewStore from '../screens/NewStore';
import NewStoreBank from '../screens/NewStoreBank';
import BuyPlanSuccess from '../screens/BuyPlanSuccess';
import MemberShipSuccess from '../screens/MemberShipSuccess';
import CreateQuote from '../components/CreateQuote';
import SellerZone from '../screens/SellerZone';
import SettingScreen from '../components/SettingScreen';
import CategoryScreen from '../components/CategoryScreen';
import Registration from '../screens/Registration';
import RegistrationV2 from '../screens/RegistrationV2';
import LogInScreenV2 from '../screens/LogInScreenV2';
import PasswordResetScreen from '../screens/PasswordResetScreen';
import AddProductInitialScreen from '../screens/AddProductInitialScreen';
import ProductVariantDetails from '../screens/ProductVariantDetails';
import TargetDetails from '../screens/TargetDetails';
import CatalogScreen from '../screens/CatalogScreen';
import DisputeScreen from '../screens/DisputeScreen';
import PayoutScreen from '../screens/PayoutScreen';
import PayoutDetails from '../screens/PayoutDetails';
import OTPLoginScreen from '../screens/OTPLoginScreen';
import RaiseDispute from '../screens/RaiseDispute';
import StoreSearch from '../screens/StoreSearch';
import LedgerScreen from '../screens/LedgerScreen';
import ProductList from '../screens/ProductList';
import ProductView from '../screens/ProductView';
import CategoriesScreenV2 from '../screens/CategoriesScreenV2';
import ProductCreateScreen from '../screens/ProductCreateScreen';
import SellerOrderDetails from '../components/SellerOrderDetails';
import StoreDisplayCard from '../components/StoreDisplayCard';
import DiscoverSellerScreen from '../screens/DiscoverSellerScreen.js';
import ChatListScreen from '../screens/ChatListScreen.js';
import ChatUserScreen from '../screens/ChatUserScreen.js';
import EditBank from '../screens/EditBank.js';
import TalkToSeller from '../screens/TalkToSeller.js';
import Instructions from '../screens/Instructions.js';
import Test from '../screens/Test.js';
import Pages from '../screens/Pages.js';
import EditProfile from '../screens/EditProfile';
import EditStore from '../screens/EditStore';
import CheckoutProducts from '../screens/CheckoutProducts';
import SellerDetails from '../screens/SellerDetails';
import CouponScreen from '../screens/CouponScreen';
import OrderDetailPage from '../screens/OrderDetailPage';
import CouponProductSelection from '../screens/CouponProductSelection';
import CreateCoupon from '../screens/CreateCoupon';
import CouponDetails from '../screens/CouponDetails';
import Charges from '../screens/Charges';
import DashBoard from '../screens/DashBoard';
import SubCategoryList from '../screens/SubCategoryList';
import CategoryFilterScreen from '../screens/CategoryFilterScreen';
import CreateShipment from '../screens/CreateShipment';
import Varients from '../components/Varients';
const HomeStack = createStackNavigator(
  {
    HomeScreen:{
        screen: HomeScreen,
    },
    
    GiftSection:GiftSection,
    TargetDetails:TargetDetails,
    SearchBar:SearchScreenCopy2,
    CategoriesScreen:CategoriesScreenV2,
    SubCategoryView:SubCategoryScreen,
    RegistrationView:RegistrationScreen,
    checkoutScreen:CheckoutScreen,
    sample:SampleScreen,
    ChatScreen:ChatScreen,
    OrderSuceesScreen:OrderSuceesScreen,
    NotificationScreen:NotificationScreen,
    ProfileScreen:ProfileScreen,
    PaymentScreen:PaymentScreen,
    OrderFailureScreen:OrderFailureScreen,
    SocialScreen:SocialScreen,
    OtpScreen:OtpScreen,
    TermsAndCondition:TermsAndCondition,
    ViewAllScreen:ViewAllScreen,
    ReferEarnScreen:ReferEarnScreen,
    ProfileEditScreen:ProfileEditScreen,
    ProductDetails:ProductDetails,
    ImageViewScreen:ImageViewScreen,
    DiscoverSellerScreen:DiscoverSellerScreen,
    ChatListScreen:ChatListScreen,
    ChatUserScreen:ChatUserScreen,
    TalkToSeller:TalkToSeller,
    Pages:Pages,
    SellerDetails:SellerDetails,
    StoreSearch:StoreSearch,
    SubCategoryList:SubCategoryList,
    CategoryFilterScreen:CategoryFilterScreen

 },
 {
   initialRouteName: 'HomeScreen',
   headerMode: 'none',
 }

)
const OrderStack = createStackNavigator(
  {
    UserAcountScreen:{
        screen: UserAcountScreen,
    },
    OrderDetailPage:{
        screen: OrderDetailPage
    },
    Pages:{
        screen: Pages,
    },
 },
 {
   initialRouteName: 'UserAcountScreen',
 }
)
const AddressStack = createStackNavigator(
  {
    AddressScreen:{
        screen: AddressScreen,
    },
    Pages:Pages
 },
 {
   initialRouteName: 'AddressScreen',
 }
)
const FaqStack = createStackNavigator(
  {
    FaqScreen:{
        screen: FaqScreen,
    },
    Pages:Pages
 },
 {
   initialRouteName: 'FaqScreen',
 }
)
const DiscoverSellerStack = createStackNavigator(
  {
    FaqScreen:{
        screen: DiscoverSellerScreen,
    },
    Pages:Pages
 },
 {
   initialRouteName: 'DiscoverSellerScreen',
 }
)

const SupportStack = createStackNavigator(
  {
    SupportScreen:{
        screen: SupportScreenV2,
    },
    RaiseDisputeSupport:RaiseDispute,
    UserForumDetailedScreen:ForumDetailedScreen,
    Pages:Pages,
 },
 {
   initialRouteName: 'SupportScreen',
 }
)

const NewStoreStack = createStackNavigator(
  {
    NewStore:{
        screen: NewStore,
    },
    NewStoreBank:{
        screen: NewStoreBank,
    },
    Instructions:{
        screen:Instructions,
    },
    Pages:Pages
 },
 {
   initialRouteName: 'Instructions',
 }
)


const SellerZoneStack = createStackNavigator(
  {

    EditBank:EditBank,
    SellerZone:SellerZone,
    AddProductInitialScreen:AddProductInitialScreen,
    ProductCreateScreen:ProductCreateScreen,
    ProductList:ProductList,
    ProductVariantDetails:ProductVariantDetails,
    SellerOrdersScreen:SellerOrdersScreen,
    SellerOrderCompo:SellerOrderCompo,
    Accepted:Accepted,
    Packed:Packed,
    Shipped:Shipped,
    Delivered:Delivered,
    Return:Return,
    Replacement:Replacement,
    Cancelled:Cancelled,
    History:History,
    RTO:RTO,
    CreateQuote:CreateQuote,
    TabBar:TabBar,
    SellerZone:SellerZone,
    MyProductsScreen:MyProductsScreen,
    ProductScreen:ProductScreen,
    RichTextScreen:RichTextScreen,
    CameraScreen:CameraScreen,
    SettingScreen:SettingScreen,
    CategoryScreen:CategoryScreen,
    SellerOrderDetails:SellerOrderDetails,
    Varients:Varients,
    DisputeScreen:DisputeScreen,
    ForumDetailedScreen:ForumDetailedScreen,
    PayoutScreen:PayoutScreen,
    PayoutDetails:PayoutDetails,
    CatalogScreen:CatalogScreen,
    ProductView:ProductView,
    RaiseDispute:RaiseDispute,
    LedgerScreen:LedgerScreen,
    Pages:Pages,
    EditProfile:EditProfile,
    EditStore: EditStore,
    CouponScreen:CouponScreen,
    CreateCoupon:CreateCoupon,
    CouponProductSelection:CouponProductSelection,
    CouponDetails:CouponDetails,
    PayoutOrderDetail:OrderDetailPage,
    ProductViewSeller:ProductDetails,
    Charges:Charges,
    DashBoard:DashBoard,
    CreateShipment:CreateShipment
 },
 {
   initialRouteName: 'SellerZone',
 }
)

const LogInStack = createStackNavigator(
  {

    LogInScreen:OTPLoginScreen,
    Registration:RegistrationV2,
    PasswordResetScreen:PasswordResetScreen,
 },
 {
   initialRouteName: 'LogInScreen',
 }
)
const RequestPostStack = createStackNavigator(
  {

    RequestPost:RequestPost,
 },
 {
   initialRouteName: 'RequestPost',
 }
)

const MemberShipStack = createStackNavigator(
  {
    MemberShip:MemberShip,
    Pages:Pages,
    BuyPlanSuccess:BuyPlanSuccess,
    MemberShipSuccess:MemberShipSuccess,
 },
 {
   initialRouteName: 'MemberShip',
 }
)

const PloicyStack = createStackNavigator(
  {
    Policies:Policies,
    PolicyPage:Pages,
 },
 {
   initialRouteName: 'Policies',
 }
)

const MyAccountStack= createStackNavigator(
  {
    MyAccountScreen:ProfileEditScreen,
 },
 {
   initialRouteName: 'MyAccountScreen'
 }
)

const ReferEarnStack= createStackNavigator(
  {
    ReferEarnScreen:ReferEarnScreen,
    CheckoutProducts:CheckoutProducts,
 },
 {
   initialRouteName: 'ReferEarnScreen'
 }
)



const drawerNavigator = createDrawerNavigator({
    Home:{
        screen:HomeStack,
        navigationOptions: {
            drawerLabel: () => null,
            header: null,
            drawerIcon: () => null,
            /*drawerIcon: ({ tintColor }) => (
              <FontAwesome name="home" size={25} color={tintColor} />
            )*/

        }
    } ,
    LogInScreen:{
        screen: LogInStack,
        navigationOptions: {
            drawerLabel: () => null
       }
    } ,
    MyAccount:{
        screen: MyAccountStack,
        navigationOptions: {
            drawerLabel: () => null
       }
    },
    ReferEarn:{
        screen: ReferEarnStack,
        navigationOptions: {
            drawerLabel: () => null
       }
    } ,    
    NewStore:{
        screen: NewStoreStack,
        navigationOptions: {
            drawerLabel: () => null
       }
    } ,
    Support:{
        screen:SupportStack,
        navigationOptions: {
            drawerLabel: () => null
        }
    } ,
    MemberShip:{
        screen:MemberShipStack,
        navigationOptions: {
            drawerLabel: () => null
        }
    } ,
    OrderDetailsScreen:{
        screen:OrderStack,
        navigationOptions: {
            drawerLabel: () => null
        }
    } ,
    AddressScreen:{
        screen:AddressStack,
        navigationOptions: {
            drawerLabel: () => null
        }
    } ,
    RequestPost:{
        screen:RequestPostStack,
        navigationOptions: {
            drawerLabel: () => null
        }
    } ,
    FaqScreen:{
        screen:FaqStack,
        navigationOptions: {
            drawerLabel: () => null
        }
    },
    SellerZone:{
        screen:SellerZoneStack,
        navigationOptions: {
            drawerLabel: () => null
        }
    },
    Policies:{
        screen:PloicyStack,
        navigationOptions: {
            drawerLabel: () => null
        }
    },
  },
  {
    headerMode: 'none',
    header:null,
    drawerBackgroundColor:'#fff',
    drawerPosition:'left',
    drawerType:'slide',
    drawerWidth: "100%",
    hideStatusBar:false,
    contentComponent:props =><DrawerContent  {...props}  />,
    contentOptions: {
        activeTintColor: '#efa834',
        inactiveTintColor: '#efa834',
        itemsContainerStyle: {
            marginVertical: 0,
            paddingVertical:0
        },
        iconContainerStyle: {
            opacity: 1
        }
    },
    initialRouteName:'Home'
  }
);





export default drawerNavigator
