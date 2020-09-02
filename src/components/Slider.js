import React from "react";
import {View, Dimensions, TouchableOpacity} from "react-native";
import SwiperFlatList from "react-native-swiper-flatlist";
import FitImage from "react-native-fit-image";

const {width} = Dimensions.get("window");

function Slider({navigation, data, ...props}) {
  const renderItem = ({item, index}) => (
    <TouchableOpacity style={{width}} onPress={gotoProductPage(item)}>
      <FitImage source={{uri: item.banner_url || item.src}} />
    </TouchableOpacity>
  );

  const gotoProductPage = item => () => {
    console.log("banner");
    let params = {category_id: null, id: item.id, name: item.name};
    navigation.push("ProductScreen", params);
  };

  const keyExtractor = item => item.id.toString();
  return (
    <SwiperFlatList
      {...props}
      data={data}
      nestedScrollEnabled={true}
      paginationActiveColor="black"
      showPagination={data.length > 1 ? true : false}
      paginationStyleItem={{
        width: 10,
        height: 10,
        marginHorizontal: 5,
      }}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={{width}}
    />
  );
}

export default React.memo(Slider);
