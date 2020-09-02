import React, {useState, useEffect} from "react";
import {View, StatusBar, StyleSheet, Platform, ScrollView, TouchableOpacity} from "react-native";
import {Text, Icon, Button, CheckBox, Container} from "components";
import {useSelector, useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import {getAllCategories} from "store/actions";

function Filter({onBackPress, onFilter, filterData, attributes, seletedAttr = {}}) {
  const [priceFilter, setPriceFilter] = useState({
    min_price: filterData.min_price,
    max_price: filterData.max_price,
  });
  const [category, setCategoryID] = useState(filterData.category);
  const [attr, setAttr] = useState(seletedAttr);
  const [tabIndex, setTabIndex] = useState(0);
  const {t} = useTranslation();
  const disptach = useDispatch();

  const {primary_color_dark, primary_color, primary_color_text, price, accent_color} = useSelector(
    state => state.appSettings,
  );
  const categories = useSelector(state => state.categories);

  const filterTabs = ["Price", "Categories", ...attributes.map(item => item.name)];

  useEffect(() => {
    disptach(getAllCategories());
  }, []);

  const onChangeIndex = tabIndex => () => {
    setTabIndex(tabIndex);
  };

  const onSliderUpdate = value => {
    setPriceFilter({min_price: value[0], max_price: value[1] || priceFilter.max_price});
  };

  const updateAttributes = item => () => {
    const key = attributes[tabIndex - 2].slug;
    let index =
      attr[key] && Array.isArray(attr[key]) ? attr[key].findIndex(el => el === item.slug) : -1;
    if (index != -1) {
      setAttr(prevAttr => {
        let data = prevAttr[key].filter(el => el !== item.slug);
        let newState = {
          ...prevAttr,
          [key]: data,
        };
        if (data.length == 0) {
          delete newState[key];
        }
        return newState;
      });
    } else {
      setAttr(prevAttr => ({
        ...prevAttr,
        [key]:
          prevAttr[key] && Array.isArray(attr[key]) ? [...prevAttr[key], item.slug] : [item.slug],
      }));
    }
  };

  const filter = () => {
    let params = {
      ...filterData,
      ...priceFilter,
      page: 1,
      category,
    };
    onFilter && onFilter(params, attr);
  };

  const reset = () => {
    setAttr({});
    setCategoryID(undefined);
    setPriceFilter({min_price: price.min, max_price: price.max});
  };

  return (
    <Container>
      <StatusBar backgroundColor={primary_color_dark} barStyle="light-content" />
      <View style={[styles.toolbar, {backgroundColor: primary_color}]}>
        <Text style={[styles.title, {color: primary_color_text}]}>{t("FILTER")}</Text>

        <Button onPress={onBackPress} style={styles.menuButton}>
          <Icon color={primary_color_text} type="Entypo" name="cross" size={24} />
        </Button>
      </View>
      <View style={{flex: 1, flexDirection: "row"}}>
        <ScrollView style={{flex: 2, backgroundColor: "#E8EEF6"}}>
          {filterTabs.map((item, index) => (
            <Button
              style={[styles.filterTabs, {backgroundColor: index === tabIndex ? "#FFFFFF" : null}]}
              key={"filter_" + item + index}
              onPress={onChangeIndex(index)}>
              <Text>{item}</Text>
            </Button>
          ))}
        </ScrollView>
        <ScrollView style={{flex: 3, backgroundColor: "#FFFFFF"}}>
          {tabIndex == 0 && (
            <View
              style={{
                marginHorizontal: Platform.OS == "ios" ? 10 : 0,
                alignItems: "center",
                paddingHorizontal: 12,
                paddingBottom: 16,
              }}>
              <MultiSlider
                containerStyle={{marginHorizontal: Platform.OS == "ios" ? 10 : 0}}
                trackStyle={{height: 4}}
                selectedStyle={{backgroundColor: "#F68E1F"}}
                markerStyle={{
                  marginTop: 4,
                  backgroundColor: "#F68E1F",
                  height: 20,
                  width: 20,
                }}
                sliderLength={150}
                min={price.min}
                max={price.max}
                values={[priceFilter.min_price, priceFilter.max_price]}
                enabledTwo
                onValuesChangeFinish={onSliderUpdate}
              />
              <View
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  marginTop: -10,
                }}>
                <Text style={{fontWeight: "700"}}>{priceFilter.min_price}</Text>
                <Text style={{fontWeight: "700"}}>{priceFilter.max_price}</Text>
              </View>
            </View>
          )}
          {tabIndex == 1 && (
            <View
              style={{
                marginHorizontal: Platform.OS == "ios" ? 10 : 0,
                alignItems: "center",
                padding: 8,
              }}>
              {categories.data.map((item, index) => (
                <TouchableOpacity
                  onPress={() => setCategoryID(item.id)}
                  style={{
                    flexDirection: "row",
                    padding: 16,
                    alignItems: "center",
                    width: "100%",
                  }}
                  key={"categories" + item + index}>
                  <Icon
                    type="MaterialCommunityIcons"
                    color={category == item.id ? primary_color : "#00000099"}
                    size={24}
                    name={category == item.id ? "radiobox-marked" : "radiobox-blank"}
                  />

                  <Text style={{marginStart: 16, flex: 1}}>{item.name}</Text>
                </TouchableOpacity>
                // <CheckBox
                //   label={item.name}
                //   key={"categories" + item + index}
                //   checked={category == item.id}
                //   onPress={() => setCategoryID(item.id)}
                // />
              ))}
            </View>
          )}
          {tabIndex > 1 && (
            <View
              style={{
                marginHorizontal: Platform.OS == "ios" ? 10 : 0,
                alignItems: "center",
                padding: 8,
              }}>
              {attributes[tabIndex - 2].options.map((item, index) => (
                <CheckBox
                  label={item.name}
                  key={item + index}
                  checked={
                    attr[attributes[tabIndex - 2].slug] &&
                    Array.isArray(attr[attributes[tabIndex - 2].slug]) &&
                    attr[attributes[tabIndex - 2].slug].includes(item.slug)
                  }
                  onPress={updateAttributes(item)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <Button style={[styles.applyButton, {backgroundColor: primary_color}]} onPress={reset}>
          <Text style={{color: "#FFFFFF", fontWeight: "700"}}>RESET</Text>
        </Button>
        <Button
          style={[styles.applyButton, {backgroundColor: accent_color, flex: 3}]}
          onPress={filter}>
          <Text style={{color: "#FFFFFF", fontWeight: "700"}}>APPLY</Text>
        </Button>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    paddingStart: 16,
  },
  menuButton: {padding: 16},
  filterTabs: {
    width: "100%",
    padding: 16,
  },
  footer: {
    flexDirection: "row",
    width: "100%",
    padding: 8,
    backgroundColor: "#FFFFFF",
  },
  applyButton: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 10,
  },
});

export default Filter;
