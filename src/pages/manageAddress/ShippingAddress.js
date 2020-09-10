import React, {useState, useCallback, useEffect, useReducer} from "react";
import {View, ScrollView, StyleSheet} from "react-native";
import {Text, Toolbar, FloatingTextinput, Button} from "components";
import {useTranslation} from "react-i18next";
import {useSelector, useDispatch} from "react-redux";
import {CustomPicker} from "react-native-custom-picker";
import {WooCommerce} from "service";
import {updateShipping} from "../../store/actions";
import Toast from "react-native-simple-toast";

const initialState = {
  first_name: "",
  last_name: "",
  company: "",
  city: "",
  postcode: "",
  address_1: "",
  address_2: "",
  country: "",
  state: "",
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case "changeFirstname":
      return {...state, first_name: action.payload};
    case "changeLastname":
      return {...state, last_name: action.payload};
    case "changeCompany":
      return {...state, company: action.payload};
    case "changeCity":
      return {...state, city: action.payload};
    case "changePostcode":
      return {...state, postcode: action.payload};
    case "changeAddress1":
      return {...state, address_1: action.payload};
    case "changeAddress2":
      return {...state, address_2: action.payload};
    case "changeCountry":
      return {...state, country: action.payload};
    case "changeState":
      return {...state, state: action.payload};
    default:
      return state;
  }
}

function ShippingAddress() {
  const {t} = useTranslation();
  const user = useSelector(state => state.user);
  const appSettings = useSelector(state => state.appSettings);
  const dispatchAction = useDispatch();

  const [state, dispatch] = useReducer(reducer, user.shipping);

  useEffect(() => {
    let arr = [];
    for (let i in appSettings.countries) arr.push({id: i, name: appSettings.countries[i]});
    setCountry(arr);
  }, []);

  const [arrCountry, setCountry] = useState([]);

  const [stateData, setStateData] = useState([]);

  const onChangeFirstname = text => {
    dispatch({type: "changeFirstname", payload: text});
  };
  const onChangeLastname = text => {
    dispatch({type: "changeLastname", payload: text});
  };
  const onChangeCompany = text => {
    dispatch({type: "changeCompany", payload: text});
  };
  const onChangeCity = text => {
    dispatch({type: "changeCity", payload: text});
  };
  const onChangePostcode = text => {
    dispatch({type: "changePostcode", payload: text});
  };
  const onChangeAddress1 = text => {
    dispatch({type: "changeAddress1", payload: text});
  };
  const onChangeAddress2 = text => {
    dispatch({type: "changeAddress2", payload: text});
  };

  const onChangeCountry = text => {
    dispatch({type: "changeCountry", payload: text});
  };

  const onChangeState = text => {
    dispatch({type: "changeState", payload: text});
  };

  const _UpdateAddress = () => {
    let param = {
      first_name: state.first_name,
      last_name: state.last_name,
      company: state.company,
      city: state.city,
      state: state.state,
      postcode: state.postcode,
      address_1: state.address_1,
      address_2: state.address_2,
      country: state.country,
    };
    console.log(param);

    let data = {};
    data.shipping = param;

    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (
      state.first_name == "" &&
      state.last_name == "" &&
      state.company == "" &&
      state.city == "" &&
      state.state == "" &&
      state.postcode == "" &&
      state.address_1 == "" &&
      state.country == ""
    ) {
      Toast.show("Please fill all the fields");
    } else {
      WooCommerce.post("customers/" + user.id, data).then(res => {
        console.log(res);
        if (res.status == 200) {
          dispatchAction(updateShipping(param));
        } else {
          Toast.show("Nothing to update", Toast.LONG);
        }
      });
    }
  };

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
    onChangeCountry(text.name);
    let arr = [];
    let obj = appSettings.county_states[text.id];
    for (let i in obj) arr.push({id: i, name: obj[i]});
    setStateData(arr);
  };

  const setStateD = text => {
    onChangeState(text.name);
  };

  return (
    <>
      <Toolbar backButton title={t("SHIPPING") + " " + t("ADDRESS")} />
      <ScrollView contentContainerStyle={{marginHorizontal: 16, marginTop: 16}}>
        <FloatingTextinput
          label={t("FIRST_NAME")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={state.first_name}
          onChangeText={onChangeFirstname}
        />
        <FloatingTextinput
          label={t("LAST_NAME")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={state.last_name}
          onChangeText={onChangeLastname}
        />
        <FloatingTextinput
          label={t("COMPANY")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={state.company}
          onChangeText={onChangeCompany}
        />

        <FloatingTextinput
          label={t("CITY")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={state.city}
          onChangeText={onChangeCity}
        />
        <FloatingTextinput
          label={t("POSTCODE")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={state.postcode}
          onChangeText={onChangePostcode}
        />
        <FloatingTextinput
          label={t("ADDRESS_1")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={state.address_1}
          onChangeText={onChangeAddress1}
        />
        <FloatingTextinput
          label={t("ADDRESS_2")}
          labelColor="#000000"
          style={{color: "#000000"}}
          value={state.address_2}
          onChangeText={onChangeAddress2}
        />
        <>
          <Text style={{fontSize: 12, color: appSettings.accent_color, marginTop: 10}}>
            {t("COUNTRY")}
          </Text>
          <CustomPicker
            options={arrCountry}
            placeholder={state.country}
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
            placeholder={state.state}
            getLabel={item => item.name}
            optionTemplate={renderOption}
            fieldTemplate={renderField}
            onValueChange={value => setStateD(value)}
          />
        </>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          style={[styles.footerButton, {backgroundColor: appSettings.accent_color}]}
          onPress={_UpdateAddress}>
          <Text style={{color: "white", marginEnd: 5}}>{t("SAVE")}</Text>
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
});

export default ShippingAddress;
