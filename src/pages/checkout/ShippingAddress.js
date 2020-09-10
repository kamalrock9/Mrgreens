import React, {useState, useEffect, useCallback} from "react";
import {View, StyleSheet, ScrollView} from "react-native";
import {Text, Toolbar, FloatingTextinput, Button} from "components";
import {useSelector, useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {CustomPicker} from "react-native-custom-picker";
import {useNavigation} from "react-navigation-hooks";
import {updateShipping} from "../../store/actions";

function ShippingAddresss(props) {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const user = useSelector(state => state.user);
  const dispatchAction = useDispatch();
  const appSettings = useSelector(state => state.appSettings);

  useEffect(() => {
    let arr = [];
    for (let i in appSettings.countries) arr.push({id: i, name: appSettings.countries[i]});
    console.log(arr);
    setCountry(arr);
  }, []);

  const [firstname, setFirstname] = useState(user.shipping.first_name);
  const [lastname, setLastname] = useState(user.shipping.last_name);
  const [city, setCity] = useState(user.shipping.city);
  const [postcode, setPostcode] = useState(user.shipping.postcode);
  const [address1, setAddress1] = useState(user.shipping.address_1);
  const [address2, setAddress2] = useState(user.shipping.address_2);
  const [counrtyy, setCountryy] = useState(user.shipping.country);
  const [state, setState] = useState(user.shipping.state);

  const [country, setCountry] = useState([]);

  const [stateData, setStateData] = useState([]);

  const onChangeFirstname = useCallback(text => {
    setFirstname(text);
    dispatchAction(updateShipping({...user.shipping, first_name: text}));
  });
  const onChangeLastname = useCallback(text => {
    setLastname(text);
    dispatchAction(updateShipping({...user.shipping, last_name: text}));
  });

  const onChangeCity = useCallback(text => {
    setCity(text);
    dispatchAction(updateShipping({...user.shipping, city: text}));
  });
  const onChangePostcode = useCallback(text => {
    setPostcode(text);
    dispatchAction(updateShipping({...user.shipping, postcode: text}));
  });
  const onChangeAddress1 = useCallback(text => {
    setAddress1(text);
    dispatchAction(updateShipping({...user.shipping, address_1: text}));
  });
  const onChangeAddress2 = useCallback(text => {
    setAddress2(text);
    dispatchAction(updateShipping({...user.shipping, address_2: text}));
  });

  const renderOption = settings => {
    const {item, getLabel} = settings;
    return (
      <View style={styles.optionContainer}>
        <View style={styles.innerContainer}>
          <View style={[styles.box, {backgroundColor: item.color}]} />
          <Text style={{color: item.color, alignSelf: "flex-start"}}>{getLabel(item)}</Text>
        </View>
      </View>
    );
  };

  const renderField = settings => {
    const {selectedItem, defaultText, getLabel, clear} = settings;
    return (
      <View style={styles.container}>
        <View>
          {!selectedItem && <Text style={[styles.text, {color: "#000000"}]}>{defaultText}</Text>}
          {selectedItem && (
            <View style={{}}>
              <Text style={[styles.text, {color: selectedItem.color}]}>
                {getLabel(selectedItem)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const setCount = text => {
    setCountryy(text.name);
    dispatchAction(updateShipping({...user.shipping, country: text.name}));

    let arr = [];
    let obj = appSettings.county_states[text.id];
    for (let i in obj) arr.push({id: i, name: obj[i]});
    setStateData(arr);
  };

  const setStateD = text => {
    setState(text.name);
    dispatchAction(updateShipping({...user.shipping, state: text.name}));
  };

  const gotoBack = () => {
    navigation.goBack(null);
  };

  const gotoReview = () => {
    let shipping = {
      first_name: firstname,
      last_name: lastname,
      company: user.shipping.company,
      city: city,
      state: state,
      postcode: postcode,
      address_1: address1,
      address_2: address2,
      country: counrtyy,
    };
    navigation.navigate("Review", {...props.navigation.state.params, shipping: shipping});
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView style={{paddingHorizontal: 16}}>
        <FloatingTextinput
          label={t("FIRST_NAME")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={firstname}
          onChangeText={onChangeFirstname}
        />
        <FloatingTextinput
          label={t("LAST_NAME")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={lastname}
          onChangeText={onChangeLastname}
        />
        <>
          <Text style={{fontSize: 12, color: appSettings.accent_color, marginTop: 10}}>
            {t("COUNTRY")}
          </Text>
          <CustomPicker
            options={country}
            placeholder={counrtyy}
            getLabel={item => item.name}
            optionTemplate={renderOption}
            fieldTemplate={renderField}
            onValueChange={value => setCount(value)}
          />
        </>
        <>
          <Text style={{fontSize: 12, color: appSettings.accent_color, marginTop: 10}}>
            {t("STATE")}
          </Text>
          <CustomPicker
            options={stateData}
            placeholder={state}
            getLabel={item => item.name}
            optionTemplate={renderOption}
            fieldTemplate={renderField}
            onValueChange={value => setStateD(value)}
          />
        </>
        <FloatingTextinput
          label={t("CITY")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={city}
          onChangeText={onChangeCity}
        />
        <FloatingTextinput
          label={t("POSTCODE")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={postcode}
          onChangeText={onChangePostcode}
        />
        <FloatingTextinput
          label={t("ADDRESS_1")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={address1}
          onChangeText={onChangeAddress1}
        />
        <FloatingTextinput
          label={t("ADDRESS_2")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={address2}
          onChangeText={onChangeAddress2}
        />
      </ScrollView>
      {/* <View style={styles.footer}>
        <Button
          style={[
            styles.footerButton,
            {backgroundColor: appSettings.primary_color, marginRight: -5},
          ]}
          onPress={gotoBack}>
          <Text style={{color: "white"}}>{t("PREVIOUS")}</Text>
        </Button>
        <Button
          style={[styles.footerButton, {backgroundColor: appSettings.accent_color, marginLeft: -5}]}
          onPress={gotoReview}>
          <Text style={{color: "white"}}>{t("NEXT")}</Text>
        </Button>
      </View> */}
    </View>
  );
}

ShippingAddresss.navigationOptions = {
  header: <Toolbar backButton title="Shipping Address" />,
};

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    elevation: 2,
    backgroundcolor: "#fff",
  },
  footerButton: {
    flex: 1,
    height: 48,
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    borderBottomColor: "#EDEBF2",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: -20,
    marginStart: -40,
  },
  text: {
    fontSize: 14,
  },
  optionContainer: {
    marginHorizontal: 16,
    padding: 10,
    borderBottomColor: "#EDEBF2",
    borderBottomWidth: 1,
  },
  box: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  footer: {
    width: "100%",
    flexDirection: "row",
  },
  footerButton: {
    flex: 1,
    height: 40,
    margin: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ShippingAddresss;
