import React, {useState} from "react";
import {Image, View, StyleSheet, TouchableWithoutFeedback} from "react-native";
import {useSelector} from "react-redux";
import {useNavigation} from "react-navigation-hooks";
import {HTMLRender, Text, WishlistIcon} from "components";
import StarRating from "react-native-star-rating";
import FitImage from "react-native-fit-image";

function ProductItem({containerStyle, width: width, item}) {
  const navigation = useNavigation();
  const {accent_color} = useSelector(state => state.appSettings);

  const goToProductDetails = () => {
    navigation.push("ProductDetailScreen", item);
  };

  var discount = Math.ceil(((item.regular_price - item.price) / item.regular_price) * 100);

  return (
    <TouchableWithoutFeedback onPress={goToProductDetails}>
      <View style={[containerStyle, styles.container, {width}]}>
        {item.images.length > 0 && (
          <Image
            resizeMode="contain"
            style={{width: width, height: 150}}
            source={{uri: item.images[0].src}}
            indicatorColor={accent_color}
          />
        )}
        <View>
          <Text style={[styles.itemMargin, {fontWeight: "600"}]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.price_html != "" && (
            <HTMLRender
              html={item.price_html}
              containerStyle={styles.itemMargin}
              baseFontStyle={{fontSize: 13}}
            />
          )}
          <StarRating
            disabled
            maxStars={5}
            rating={parseInt(item.average_rating)}
            containerStyle={[styles.itemMargin, styles.star]}
            starStyle={{marginEnd: 5}}
            starSize={14}
            halfStarEnabled
            emptyStarColor={accent_color}
            fullStarColor={accent_color}
            halfStarColor={accent_color}
          />
        </View>
        {item.on_sale && (
          <View
            style={{
              marginStart: 5,
              marginTop: 5,
              position: "absolute",
              top: 0,
              start: 0,
              backgroundColor: accent_color,
              width: 30,
              height: 30,
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
            }}>
            <Text style={{fontSize: 10, color: "#fff", fontWeight: "600"}}>
              {isFinite(discount) ? discount + "%" : "SALE"}
            </Text>
          </View>
        )}
        <WishlistIcon style={styles.right} item={item} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "#bdbdbd",
    paddingBottom: 8,
    justifyContent: "flex-end",
  },
  star: {
    justifyContent: "flex-start",
  },
  itemMargin: {
    marginStart: 8,
    marginTop: 4,
  },
  right: {
    position: "absolute",
    end: 0,
    top: 0,
  },
});

export default React.memo(ProductItem);
