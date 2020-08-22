import React from "react";
import {TouchableOpacity, ImageBackground, Dimensions} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {useNavigation} from "react-navigation-hooks";
import {Text} from "components";

const {width} = Dimensions.get("window");
function CategoryItem({item, index}) {
  const navigation = useNavigation();

  const goToProductScreen = () => {
    navigation.navigate("ProductScreen", {category_id: item.id});
  };

  return (
    <TouchableOpacity
      style={[
        {
          width: width / 3 - 15,
          alignItems: "center",
          justifyContent: "center",
          height: 150,
          borderRadius: 4,
          marginTop: 5,
          marginBottom: 15,
          backgroundColor: "#fff",
          elevation: 2,
        },
        index == 0 || index % 3 == 0 ? {marginStart: 12, marginEnd: 10} : {marginEnd: 10},
      ]}
      onPress={goToProductScreen}>
      <ImageBackground
        source={{
          uri: item.image
            ? typeof item.image == "string"
              ? item.image
              : item.image.src
            : "https://source.unsplash.com/1600x900/?" + item.name,
        }}
        style={{width: 80, height: 60, borderRadius: 3}}
        resizeMode="cover"
      />
      <Text
        style={{
          color: "black",
          textAlign: "center",
          fontSize: 10,
          marginTop: 15,
          fontWeight: "700",
        }}>
        {item.name.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

export default CategoryItem;
