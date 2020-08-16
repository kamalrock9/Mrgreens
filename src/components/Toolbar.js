import React from "react";
import {View, StyleSheet, StatusBar} from "react-native";
import Text from "./Text";
import Button from "./Button";
import Icon from "./IconNB";
import HTMLRender from "./HTMLRender";
import {useSelector} from "react-redux";
import {useNavigation, useNavigationState} from "react-navigation-hooks";
import {useTranslation} from "react-i18next";
import {isEmpty, isArray} from "lodash";

function Toolbar({
  title,
  menuButton,
  backButton,
  wishListButton,
  cartButton,
  cancelButton,
  onCancel,
  walletBalance,
  searchButton,
  paymentpage,
}) {
  const navigation = useNavigation();
  const {routeName} = useNavigationState();
  const {t} = useTranslation();
  const {
    primary_color_dark,
    primary_color,
    primary_color_text,
    toolbarbadgecolor,
    accent_color,
  } = useSelector(state => state.appSettings);
  const count = useSelector(state => state.cartCount);
  const wishlist = useSelector(state => state.wishlist);

  const goTo = route => () => {
    navigation.navigate(route);
  };

  const goBack = () => {
    navigation.goBack(null);
  };

  const submitt = () => {
    submit && submit();
  };

  return (
    <>
      <StatusBar backgroundColor={primary_color_dark} barStyle="light-content" />
      <View style={[styles.container, {backgroundColor: primary_color}]}>
        {menuButton && (
          <Button onPress={navigation.openDrawer} style={styles.menuButton}>
            <Icon color={primary_color_text} name="md-menu" size={24} />
          </Button>
        )}
        {backButton && (
          <Button onPress={goBack} style={styles.menuButton}>
            <Icon
              color={primary_color_text}
              name="keyboard-backspace"
              type="MaterialIcons"
              size={24}
            />
          </Button>
        )}
        {paymentpage && (
          <Button onPress={goTo("HomeScreen")} style={styles.menuButton}>
            <Icon color={primary_color_text} name="md-arrow-back" size={24} />
          </Button>
        )}
        {cancelButton && (
          <Button onPress={onCancel} style={styles.menuButton}>
            <Icon color={primary_color_text} name="cross" type="Entypo" size={24} />
          </Button>
        )}

        <Text style={[styles.title, {color: primary_color_text, flex: 1}]}>
          {t(title) || t(routeName)}
        </Text>

        <View style={styles.right}>
          {searchButton && (
            <Button
              style={[styles.right, {paddingVertical: 16, paddingHorizontal: 10}]}
              onPress={goTo("Search")}>
              <Icon color={primary_color_text} name="md-search" size={24} />
            </Button>
          )}
          {wishListButton && (
            <Button
              onPress={goTo("WishlistScreen")}
              style={[styles.menuButton, {paddingVertical: 16, paddingHorizontal: 10}]}>
              <Icon color={primary_color_text} name="md-heart" size={24} />
              {isArray(wishlist) && !isEmpty(wishlist) && (
                <View style={[styles.badge, {backgroundColor: toolbarbadgecolor || accent_color}]}>
                  <Text style={styles.badgeText}>{wishlist.length}</Text>
                </View>
              )}
            </Button>
          )}
          {cartButton && (
            <Button
              onPress={goTo("Cart")}
              style={[styles.menuButton, {paddingVertical: 16, paddingHorizontal: 10}]}>
              <Icon color={primary_color_text} name="md-cart" size={24} />
              {count > 0 && (
                <View style={[styles.badge, {backgroundColor: toolbarbadgecolor || accent_color}]}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </Button>
          )}
          {!isEmpty(walletBalance) && (
            <HTMLRender
              html={walletBalance}
              baseFontStyle={{color: primary_color_text}}
              containerStyle={{paddingEnd: 10}}
            />
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    height: 56,
  },
  badge: {
    position: "absolute",
    end: 4,
    top: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "600",
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    paddingHorizontal: 16,
  },
  right: {
    flexDirection: "row",
    marginStart: "auto",
  },
  menuButton: {padding: 16},
});

export default Toolbar;
