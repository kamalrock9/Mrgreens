import React, {useEffect, useState} from "react";
//React-Navigation
import {createAppContainer, createSwitchNavigator} from "react-navigation";
import {createStackNavigator} from "react-navigation-stack";
import {createDrawerNavigator} from "react-navigation-drawer";

//SIDEMENU
import Drawer from "./src/pages/drawer/Drawer";
import TawkToChat from "./src/pages/drawer/TawkToChat";
import Notification from "./src/pages/drawer/Notification/Notification";

//pages
import HomeScreen from "./src/pages/home/HomeScreen";
import CategoryScreen from "./src/pages/CategoryScreen";
import SplashScreen from "./src/pages/SplashScreen";
import ProductScreen from "./src/pages/product/ProductScreen";
import ProductDetailScreen from "./src/pages/product/ProductDetailScreen";
import Cart from "./src/pages/Cart/Cart";
import WishlistScreen from "./src/pages/WishlistScreen";
import TermAndCondition from "./src/pages/TermAndCondition";
import Orders from "./src/pages/Order/Orders";
import OrderDetails from "./src/pages/Order/OrderDetails";
import AccountSetting from "./src/pages/AccountSetting";
import ManageAddress from "./src/pages/manageAddress/ManageAddress";
import BillingAddress from "./src/pages/manageAddress/BillingAddress";
import ShippingAddress from "./src/pages/manageAddress/ShippingAddress";
import Download from "./src/pages/Download";
import Wallet from "./src/pages/wallet/Wallet";
import ReferAndEarn from "./src/pages/wallet/ReferAndEarn";
import CheckoutScreen from "./src/pages/checkout/CheckoutScreen";
import Review from "./src/pages/Review";
import Search from "./src/pages/Search";
import PaymentPage from "./src/pages/checkout/PaymentPage";
import Auth from "./src/pages/auth/Login";
import Reviews from "./src/pages/product/Reviews";
import AddReview from "./src/pages/product/AddReview";
//Redux
import {persistor, store} from "./src/store";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/lib/integration/react";

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AppContainer />
      </PersistGate>
    </Provider>
  );
}

const HomeStack = createStackNavigator(
  {
    HomeScreen,
    ProductDetailScreen,
    Cart,
    CheckoutScreen,
    BillingAddress,
    ShippingAddress,
    Review,
    WishlistScreen,
    Search,
    PaymentPage,
    Auth,
    Reviews,
    AddReview,
  },
  {
    defaultNavigationOptions: {
      headerShown: false,
    },
  },
);

const CategoryStack = createStackNavigator(
  {
    CategoryScreen,
    Cart,
    CheckoutScreen,
    WishlistScreen,
    Search,
    CheckoutScreen,
    Auth,
  },
  {
    defaultNavigationOptions: {
      headerShown: false,
    },
  },
);

const ProductStack = createStackNavigator(
  {
    HomeScreen,
    ProductScreen,
    ProductDetailScreen,
    CheckoutScreen,
    Cart,
    WishlistScreen,
    Search,
    Auth,
    Reviews,
    AddReview,
  },
  {
    defaultNavigationOptions: {
      headerShown: false,
    },
  },
);

const OrderStack = createStackNavigator({
  Orders,
  OrderDetails,
});

const WalletStack = createStackNavigator(
  {
    Wallet,
    ReferAndEarn,
  },
  {
    initialRouteName: "Wallet",
    defaultNavigationOptions: {
      headerShown: false,
    },
  },
);

const DrawerNavigator = createDrawerNavigator(
  {
    HomeStack,
    ProductStack,
    CategoryStack,
    OrderStack,
    TawkToChat,
    TermAndCondition,
    AccountSetting,
    ManageAddress,
    BillingAddress,
    ShippingAddress,
    Download,
    WalletStack,
    Notification,
    Review,
  },
  {
    contentComponent: Drawer,
  },
);

const AppNavigator = createSwitchNavigator(
  {
    SplashScreen: SplashScreen,
    Drawer: DrawerNavigator,
  },
  {
    initialRouteName: "SplashScreen",
    backBehavior: "none",
  },
);

const AppContainer = createAppContainer(AppNavigator);

export default App;
