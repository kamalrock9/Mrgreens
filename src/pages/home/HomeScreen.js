import React, {useState, useEffect} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  unstable_batchedUpdates,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import {Slider, Toolbar, Container, Text} from "components";
import {useSelector, useDispatch} from "react-redux";
import {isEmpty} from "lodash";
import CategoryItem from "./CategoryItem";
import SectonHeader from "./SectonHeader";
import ProductsRow from "../product/ProductsRow";
import {saveHomeLayout, saveNotification} from "store/actions";
import {ApiClient} from "service";
import {useTranslation} from "react-i18next";
import OneSignal from "react-native-onesignal";
import Carousel from "react-native-snap-carousel";
import FitImage from "react-native-fit-image";

const {width, height} = Dimensions.get("window");
function HomeScreen({navigation}) {
  const [loading, setLoading] = useState(false);
  const layout = useSelector(state => state.homeLayout);
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const _categoryKeyExtractor = item => "category_" + item.id;

  const [activeIndex, setactiveIndex] = useState(0);
  const [carouselItems] = useState([
    {
      title: "Item 1",
      text: "Text 1",
    },
    {
      title: "Item 2",
      text: "Text 2",
    },
    {
      title: "Item 3",
      text: "Text 3",
    },
    {
      title: "Item 4",
      text: "Text 4",
    },
    {
      title: "Item 5",
      text: "Text 5",
    },
  ]);

  // const trackScreenView = async screen => {
  //   // Set & override the MainActivity screen name
  //   await analytics().setCurrentScreen(screen, screen);
  // };

  useEffect(() => {
    //trackScreenView("Home Page");
    setLoading(layout ? false : true);
    ApiClient.get("/layout")
      .then(({data}) => {
        unstable_batchedUpdates(() => {
          dispatch(saveHomeLayout(data));
          setLoading(false);
        });
      })
      .catch(e => {
        setLoading(false);
      });
    OneSignal.init("71c73d59-6d8f-4824-a473-e76fe6663814", {
      kOSSettingsKeyAutoPrompt: true,
    });
    OneSignal.inFocusDisplaying(2);
    OneSignal.addEventListener("received", onReceived);
    OneSignal.addEventListener("opened", onOpened);
    return () => {
      OneSignal.removeEventListener("received", onReceived);
      OneSignal.removeEventListener("opened", onOpened);
    };
  }, []);

  const onReceived = notification => {
    console.log("Notification received: ", notification);
    dispatch(saveNotification(notification.payload));
  };

  const onOpened = openResult => {
    console.log("Message: ", openResult.notification.payload);
    console.log("openResult: ", openResult.notification);
    // navigationDeferred.promise.then(() => {
    //   NavigationService.navigate("NotificationScreen");
    // });
  };

  const goToPage = (route, param = {}) => () => {
    let params = {category_id: null, ...param};
    navigation.push(route, params);
  };

  const openCategories = () => {
    navigation.navigate("CategoryScreen");
  };

  const _renderItem = ({item, index}) => <CategoryItem item={item} index={index} />;

  const gotoProductPage = item => () => {
    console.log("banner");
    let params = {category_id: null, id: item.id, name: item.name};
    navigation.push("ProductScreen", params);
  };

  const _renderItemCrousel = ({item, index}) => {
    return (
      <TouchableOpacity onPress={gotoProductPage(item)}>
        <Image
          style={{width: "100%", height: 190, borderRadius: 4}}
          source={{uri: item.banner_url}}
          resizeMode={"contain"}
        />
        {/* <Text>{item.name}</Text> */}
      </TouchableOpacity>
    );
  };

  let carousel = null;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  } else if (isEmpty(layout)) {
    return <View />;
  } else {
    return (
      <Container>
        <Toolbar menuButton cartButton wishListButton searchButton title="HOME" />
        <ScrollView nestedScrollEnabled={true}>
          {/* <View>
            <Slider
              //autoplay
              //autoplayLoop
              //autoplayDelay={5}
              data={layout.banner}
              approxHeight={180}
            />
          </View> */}

          <Carousel
            layout={"default"}
            ref={ref => {
              carousel = ref;
            }}
            data={layout.banner}
            sliderWidth={width}
            sliderHeight={200}
            itemWidth={300}
            itemHeight={180}
            renderItem={_renderItemCrousel}
            onSnapToItem={index => setactiveIndex(index)}
          />

          <SectonHeader
            style={{marginTop: 4}}
            title={t("ALL_CATEGORIES")}
            titleEnd={t("VIEW_ALL")}
            onPress={openCategories}
            onPressArgs={["CategoryScreen"]}
          />

          <FlatList
            style={{flex: 1}}
            //horizontal
            //  showsHorizontalScrollIndicator={false}
            data={layout.categories}
            //data={categories}
            keyExtractor={_categoryKeyExtractor}
            renderItem={_renderItem}
            numColumns={3}
            // removeClippedSubviews={true}
          />

          <View>
            {layout.custom_banner.map((item, index) => {
              return (
                <TouchableOpacity
                  style={{
                    borderRadius: 2,
                    marginHorizontal: 16,
                    marginTop: index > 0 ? 10 : 0,
                    elevation: 2,
                    backgroundColor: "#fff",
                  }}
                  onPress={gotoProductPage(item)}
                  key={item + "item" + index}>
                  <Image
                    resizeMode="contain"
                    style={{
                      height: 190,
                      width: width - 32,
                      borderRadius: 2,
                    }}
                    source={{uri: item.custom_banner_url || item.src}}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {layout.featured_products && layout.featured_products.length > 0 && (
            <>
              <SectonHeader
                title={t("FEATURED")}
                titleEnd={t("SEE_MORE")}
                style={{marginTop: 8}}
                onPress={goToPage("ProductScreen", {featured: true})}
              />
              <ProductsRow keyPrefix="featured" products={layout.featured_products} />
            </>
          )}

          {layout.top_rated_products && layout.top_rated_products.length > 0 && (
            <>
              <SectonHeader
                title={t("TOP_RATED")}
                titleEnd={t("SEE_MORE")}
                style={{marginTop: 8}}
                onPress={goToPage("ProductScreen", {sortby: "rating"})}
              />
              <ProductsRow keyPrefix="toprated" products={layout.top_rated_products} />
            </>
          )}

          {layout.sale_products && layout.sale_products.length > 0 && (
            <>
              <SectonHeader
                title={t("TRENDING_OFFERS")}
                titleEnd={t("SEE_MORE")}
                style={{marginTop: 8}}
                onPress={goToPage("ProductScreen", {on_sale: "true"})}
              />
              <ProductsRow keyPrefix="sale" products={layout.sale_products} />
            </>
          )}

          {layout.top_seller && layout.top_seller.length > 0 && (
            <>
              <SectonHeader
                title={t("TOP_SELLERS")}
                titleEnd={t("SEE_MORE")}
                style={{marginTop: 8}}
                onPress={goToPage("ProductScreen", {sortby: "popularity"})}
              />
              <ProductsRow keyPrefix="topseller" products={layout.top_seller} />
            </>
          )}
        </ScrollView>
      </Container>
    );
  }
}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
