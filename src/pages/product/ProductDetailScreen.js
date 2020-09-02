import React, {Component, Fragment} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Linking,
} from "react-native";
import {connect} from "react-redux";
import StarRating from "react-native-star-rating";
import RNFetchBlob from "rn-fetch-blob";
import Share from "react-native-share";
import Modal from "react-native-modal";
import {isEmpty, unionBy} from "lodash";
import {
  Slider,
  Toolbar,
  HTMLRender,
  QuantitySelector,
  Text,
  Button,
  Icon,
  Container,
} from "components";
import {CustomPicker} from "react-native-custom-picker";
import SpecificationRow from "./SpecificationRow";
import MiniCart from "./MiniCart";
import ProductsRow from "./ProductsRow";
import {ApiClient} from "service";
import {getCartCount, changeShippingPincode} from "store/actions";
import {FlatGrid} from "react-native-super-grid";
import Toast from "react-native-simple-toast";
import {withTranslation} from "react-i18next";
import Constants from "../../service/Config";
import InAppBrowser from "react-native-inappbrowser-reborn";

class ProductDetailScreen extends React.PureComponent {
  constructor(props) {
    super(props);
    console.log(this.props.navigation.state.params);
    this.state = {
      quantity: 1,
      product: this.props.navigation.state.params,
      cartMsg: "",
      modalVisible: false,
      attributes: [],
      selectedAttrs: {},
      variation: {},
      postcode: props.shipping.postcode || "",
      deliverDetails: {},
      loading: false,
      checked: false,
    };
  }
  componentDidMount() {
    const {product, postcode} = this.state;
    let attributes = [];
    for (let attr of product.attributes) {
      if (attr.variation && attr.visible) {
        attributes.push(attr);
      }
    }
    this.setState({attributes});
    console.log(attributes);
    this.setup();
    if (postcode !== "") {
      this.submitPostcode();
    }
  }
  setup = () => {
    if (this.state.product.upsell_ids.length > 0) {
      ApiClient.get("/get-products-by-id", {include: this.state.product.upsell_ids.join()})
        .then(({data}) => {
          this.setState(prevState => ({
            product: {...prevState.product, upsell: data},
          }));
        })
        .catch(error => {});
    }
    if (this.state.product.related_ids.length > 0) {
      ApiClient.get("/get-products-by-id", {include: this.state.product.related_ids.join()})
        .then(({data}) => {
          this.setState(prevState => ({
            product: {...prevState.product, related: data},
          }));
        })
        .catch(error => {});
    }
    if (this.state.product.grouped_products.length > 0) {
      ApiClient.get("/get-products-by-id", {include: this.state.product.grouped_products.join()})
        .then(({data}) => {
          let newData = data.map(item => {
            let varia = {...item, quantity: 0};
            return varia;
          });
          console.log(newData);
          this.setState(prevState => ({
            product: {...prevState.product, group: newData},
          }));
        })
        .catch(error => {});
    }
  };

  shareProduct = () => {
    RNFetchBlob.fetch("GET", this.state.product.images[0].src)
      .then(resp => {
        console.log("response : ", resp);
        let base64image = resp.data;
        this.share("data:image/png;base64," + base64image);
      })
      .catch(err => console.log(err));
  };

  share = base64image => {
    let shareOptions = {
      title: "Share " + this.state.product.name,
      url: base64image,
      message: this.state.product.permalink,
      subject: this.state.product.name,
    };
    Share.open(shareOptions)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        err && console.log(err);
      });
  };

  _handleExternalProduct = () => {
    const isAvailable = InAppBrowser.isAvailable();
    if (isAvailable) {
      InAppBrowser.open(this.state.product.external_url, {
        // iOS Properties
        dismissButtonStyle: "cancel",
        preferredBarTintColor: "gray",
        preferredControlTintColor: "white",
        // Android Properties
        showTitle: true,
        toolbarColor: "#6200EE",
        secondaryToolbarColor: "black",
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: true,
      }).then(result => {
        //Toast.show(result);
      });
    } else {
      Linking.openURL(url);
    }
  };

  _increaseCounter = i => {
    console.log("inc");
    const {variation, product} = this.state;
    let quantity = this.state.quantity;

    if (product.type == "grouped") {
      product.group[index].quantity++;
      console.log(quantity);
      console.log(product);
    }

    if (product.type == "variable") {
      if (!isEmpty(variation)) {
        if (variation.manage_stock == "parent") {
          if (product.manage_stock) {
            if (quantity < product.stock_quantity) {
              quantity++;
            } else {
              Toast.show("More items cannot be added");
            }
          } else {
            quantity++;
          }
        } else if (variation.manage_stock) {
          if (quantity < variation.stock_quantity) {
            quantity++;
          } else {
            Toast.show("More items cannot be added");
          }
        } else {
          quantity++;
        }
      } else {
        Toast.show("Select a variation first");
      }
    } else {
      console.log("def", product.manage_stock);
      if (product.manage_stock) {
        if (quantity < product.stock_quantity) {
          quantity++;
        } else {
          Toast.show("More items cannot be added");
        }
      } else {
        quantity++;
      }
    }

    this.setState({quantity});
  };

  _decreaseCounter = index => {
    console.log("decrease");
    const {quantity, product} = this.state;
    console.log(quantity);
    console.log(product);
    if (product.type == "grouped") {
      if (product.group[index].quantity > 0) {
        product.group[index].quantity--;
        this.setState({
          quantity: quantity - 1,
        });
      }
    } else if (quantity > 1) {
      this.setState({
        quantity: quantity - 1,
      });
    }
  };

  checkBox = i => () => {
    const {quantity, product, checked} = this.state;
    console.log(quantity);
    console.log(product);
    if (checked) {
      product.group[i].quantity--;
      this.setState({
        quantity: quantity - 1,
        checked: false,
      });
    } else {
      product.group[i].quantity++;
      this.setState({
        quantity: quantity + 1,
        checked: true,
      });
    }
  };

  gotoProductDetailPage = item => () => {
    console.log("kamal");
    this.props.navigation.push("ProductDetailScreen", item);
  };

  _handleAddToCart = (isBuyNow = false) => {
    const {product, quantity, variation, selectedAttrs} = this.state;
    let data = {id: this.state.product.id};

    switch (product.type) {
      case "grouped":
        if (
          product.group.every(element => {
            return element.quantity == 0;
          })
        ) {
          Toast.show("Select atleast one product");
          return;
        }
        data.quantity = {};
        for (let i in product.group) {
          if (product.group[i].quantity > 0) {
            data.quantity[product.group[i].id] = product.group[i].quantity;
          }
        }
        break;
      case "simple":
        data.quantity = quantity;
        break;
      case "variable":
        if (!isEmpty(variation)) {
          data.variation_id = variation.id;
          data.variation = selectedAttrs;
          data.quantity = quantity;
        } else {
          Toast.show("Select a variation first");
          return;
        }
    }

    if (this.props.appSettings.pincode_active) {
      if (this.state.postcode == "") {
        Toast.show("Please select a pincode first.");
        return;
      }
      if (isEmpty(this.state.deliverDetails)) {
        Toast.show("Please apply the pincode first.");
        return;
      }
      if (
        this.state.deliverDetails.hasOwnProperty("delivery") &&
        !this.state.deliverDetails.delivery
      ) {
        Toast.show("Delivery is not available for your location");
        return;
      }
    }

    console.log(data);
    ApiClient.post("/cart/add", data)
      .then(({data}) => {
        this.setState({
          cartMsg: Array.isArray(data) ? data.map(e => e.message).join(", ") : data.message,
        });
        if (this.isError(data)) {
          console.log("error");
        } else {
          this.props.getCartCount();
          if (isBuyNow) {
            this.props.navigation.navigate("Cart", this.state);
          } else {
            this.setState({modalVisible: true});
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  isError(data) {
    if (Array.isArray(data)) {
      return data.every(e => e.code === "0");
    } else {
      return data.code == 0;
    }
  }

  _closeModal = () => {
    this.setState({modalVisible: false});
  };

  gotoReviews = product => () => {
    this.props.navigation.navigate("Reviews", product);
  };

  onVariationChange = item => option => {
    this.setState(
      prevState => ({
        selectedAttrs: {
          ...prevState.selectedAttrs,
          [item.slug]: option && option.slug ? option.slug : option,
        },
      }),
      () => {
        console.log(this.state.selectedAttrs);
        const {selectedAttrs, product, attributes} = this.state;
        if (Object.keys(selectedAttrs).length == attributes.length) {
          this.loadVariation({product_id: product.id, attributes: selectedAttrs});
        }
      },
    );
  };

  loadVariation(data) {
    console.log("Loading Variation");
    ApiClient.post("products/get-variation", data)
      .then(({data}) => {
        if (data.error) {
          this.setState({variation: {}});
          Toast.show("Currently This variation is not available. Select a different Variation");
        } else {
          this.setState({variation: data});
        }
      })
      .catch(err => {
        Toast.show("Something went wrong! Try later");
      });
  }

  submitPostcode = () => {
    let param = {
      pincode: this.state.postcode,
      product_id: this.state.product.id,
    };
    this.props.changeShippingPincode(this.state.postcode);
    this.setState({loading: true});
    ApiClient.post("/checkpincode/", param)
      .then(({data}) => {
        console.log(data);
        this.setState({loading: false, deliverDetails: data});
      })
      .catch(error => {
        this.setState({loading: false});
        console.log(error);
      });
  };

  changePostcode = () => {
    this.setState({deliverDetails: {}});
  };

  _renderItem = ({item, index}) => {
    return (
      <View
        key={item.id}
        style={{
          marginHorizontal: 16,
          marginTop: index > 0 ? 8 : 0,
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
        <Text>{item.name}</Text>
        {!item.sold_individually && item.type !== "variable" && (
          <View style={{flexDirection: "row"}}>
            <Button style={styles.btn} onPress={() => this._decreaseCounter(index)}>
              <Icon name="minus" type="Entypo" size={16} color="#757575" />
            </Button>
            <Text style={{paddingHorizontal: 8}}>{item.quantity}</Text>
            <Button style={styles.btn} onPress={() => this._increaseCounter(index)}>
              <Icon name="plus" type="Entypo" size={16} color="#757575" />
            </Button>
          </View>
        )}
        {item.sold_individually && item.type !== "variable" && (
          <Button onPress={this.checkBox(index)}>
            <Icon
              type="MaterialCommunityIcons"
              color={this.state.checked ? this.props.appSettings.primary_color : "#00000099"}
              size={24}
              name={this.state.checked ? "checkbox-marked" : "checkbox-blank-outline"}
            />
          </Button>
        )}
        {item.type === "variable" && (
          <Button onPress={this.gotoProductDetailPage(item)}>
            <Text style={{textDecorationLine: "underline"}}>Select Option</Text>
          </Button>
        )}
      </View>
    );
  };

  _keyExtractor = (index, item) => index + item;

  render() {
    const {accent_color, pincode_active} = this.props.appSettings;
    const {t} = this.props;
    const {
      product,
      attributes,
      selectedAttrs,
      modalVisible,
      variation,
      postcode,
      deliverDetails,
      loading,
    } = this.state;
    return (
      <>
        <Container style={styles.container}>
          <Toolbar backButton title={product.name} cartButton />
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <View>
              <Slider
                data={
                  variation.image
                    ? unionBy([variation.image], product.images, x => x.id)
                    : product.images
                }
              />
            </View>
            <View style={[styles.card, {marginTop: 0}]}>
              <View style={[styles.rowCenterSpaced, styles.cardItem]}>
                <Text style={{fontSize: 16, color: "#000000", fontWeight: "700"}}>
                  {product.name}
                </Text>
                <Button transparent onPress={this.shareProduct}>
                  <Icon name="md-share" size={24} />
                </Button>
              </View>

              {product.short_description != "" && (
                <HTMLRender html={product.short_description} containerStyle={styles.cardItem} />
              )}

              <View style={[styles.rowCenterSpaced, styles.cardItem]}>
                <HTMLRender
                  html={variation.price_html || product.price_html}
                  baseFontStyle={{fontSize: 16, fontWeight: "500"}}
                  containerStyle={{paddingTop: 8}}
                />
                <Text
                  style={
                    (!isEmpty(variation) && variation.in_stock) || product.in_stock
                      ? {color: "green"}
                      : {color: "gray"}
                  }>
                  {product.in_stock ? "In stock" : "Out of stock"}
                </Text>
              </View>

              {product.type != "grouped" && (
                <View style={[styles.rowCenterSpaced, styles.cardItem]}>
                  <Text>Quantity</Text>
                  <QuantitySelector
                    minusClick={this._decreaseCounter}
                    plusClick={this._increaseCounter}
                    quantity={this.state.quantity}
                  />
                </View>
              )}
            </View>
            <View
              style={[styles.card, styles.cardItem, {flexDirection: "row", alignItems: "center"}]}>
              <StarRating
                disabled
                maxStars={5}
                rating={parseInt(product.average_rating)}
                containerStyle={{justifyContent: "flex-start"}}
                starStyle={{marginEnd: 5}}
                starSize={14}
                halfStarEnabled
                emptyStarColor={accent_color}
                fullStarColor={accent_color}
                halfStarColor={accent_color}
              />
              <Text>({product.rating_count || 0})</Text>
              <Button onPress={this.gotoReviews(product)}>
                <Text> See all reviews</Text>
              </Button>
            </View>
            {product.variations.length > 0 && attributes.length > 0 && (
              <View style={[styles.card, {paddingBottom: 0, paddingHorizontal: 8}]}>
                <Text style={[styles.cardItemHeader, {paddingBottom: 8, paddingStart: 8}]}>
                  Variations
                </Text>
                <FlatGrid
                  items={attributes}
                  keyExtractor={this._keyExtractor}
                  renderItem={({item, index}) => {
                    console.log(index);
                    return (
                      <CustomPicker
                        options={item.options}
                        getLabel={option => (option && option.slug ? option.name : option)}
                        fieldTemplate={PickerField}
                        placeholder={item.name}
                        modalAnimationType="slide"
                        onValueChange={this.onVariationChange(item)}
                      />
                    );
                  }}
                  itemDimension={180}
                  spacing={8}
                  itemContainerStyle={{justifyContent: "flex-start"}}
                />
              </View>
            )}
            {product.group && product.group.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardItemHeader}>Group Products</Text>
                <FlatList
                  data={product.group}
                  renderItem={this._renderItem}
                  keyExtractor={this._keyExtractor}
                />
              </View>
            )}
            {pincode_active && (
              <View style={styles.card}>
                <Text style={styles.cardItemHeader}>{t("DELIVERY_OPTIONS")}</Text>
                {!deliverDetails.hasOwnProperty("delivery") ? (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}>
                    <TextInput
                      placeholder={t("ENTER_POSTCODE")}
                      value={postcode}
                      onChangeText={text => this.setState({postcode: text})}
                    />
                    <Button
                      style={{
                        // backgroundColor: accent_color,
                        alignItems: "center",
                        justifyContent: "center",
                        height: 40,
                        paddingHorizontal: 10,
                      }}
                      onPress={this.submitPostcode}>
                      <Text style={{color: accent_color}}>Apply</Text>
                    </Button>
                  </View>
                ) : (
                  postcode != "" &&
                  deliverDetails.hasOwnProperty("delivery") && (
                    <View
                      style={{
                        justifyContent: "space-between",
                        flexDirection: "row",
                        marginHorizontal: 16,
                      }}>
                      <Text>
                        Delivery {deliverDetails.delivery ? "" : "not"} available at -{" "}
                        <Text style={{fontWeight: "600"}}>{postcode}</Text>
                      </Text>
                      <Button onPress={this.changePostcode}>
                        <Text style={{color: accent_color}}>Change</Text>
                      </Button>
                    </View>
                  )
                )}

                {postcode != "" &&
                  deliverDetails.hasOwnProperty("delivery") &&
                  deliverDetails.delivery && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 16,
                        paddingTop: 16,
                        borderTopWidth: 1,
                        borderTopColor: "#d2d2d2",
                      }}>
                      <View style={styles.pincodeView}>
                        <Icon type="MaterialIcons" name="location-on" size={24} />
                        <Text style={{fontSize: 12, fontWeight: 600, marginTop: 8}}>LOCATION</Text>
                        <Text style={styles.pincodeText}>
                          {deliverDetails.city + "," + deliverDetails.state}
                        </Text>
                      </View>
                      <View style={styles.pincodeView}>
                        <Icon type="MaterialIcons" name="date-range" size={24} />
                        <Text style={{fontSize: 12, fontWeight: 600, marginTop: 8}}>
                          DELIVERY BY
                        </Text>
                        {deliverDetails.delivery_date != "" && (
                          <Text style={styles.pincodeText}>{deliverDetails.delivery_date}</Text>
                        )}
                      </View>
                      <View style={styles.pincodeView}>
                        <Icon name="ios-cash" size={24} />
                        <Text style={{fontSize: 12, fontWeight: 600, marginTop: 8}}>COD</Text>
                        <Text style={styles.pincodeText}>{deliverDetails.cod_message}</Text>
                      </View>
                    </View>
                  )}
              </View>
            )}
            <View style={styles.card}>
              <Text style={styles.cardItemHeader}>Specification</Text>
              <View style={styles.cardItem}>
                <SpecificationRow
                  leftContent="Categories"
                  rightContent={product.categories.map(item => item.name).join(", ")}
                />

                {product.hasOwnProperty("total_sales") && (
                  <SpecificationRow leftContent="Total Sales" rightContent={product.total_sales} />
                )}

                {product.stock_quantity && (
                  <SpecificationRow
                    leftContent="Stock Quantity"
                    rightContent={product.stock_quantity}
                  />
                )}

                {product.hasOwnProperty("sku") && product.sku != "" && (
                  <SpecificationRow leftContent="SKU" rightContent={product.sku} />
                )}
                {product.hasOwnProperty("weight") && product.weight != "" && (
                  <SpecificationRow leftContent="Weight" rightContent={product.stock_quantity} />
                )}

                {product.attributes.map((item, index) => (
                  <SpecificationRow
                    leftContent={item.name}
                    rightContent={item.options.map(opt => (opt.slug ? opt.name : opt)).join(", ")}
                    key={item.name + index}
                  />
                ))}
              </View>
            </View>
            {product.description != "" && (
              <View style={styles.card}>
                <Text style={styles.cardItemHeader}>Description</Text>
                <HTMLRender html={product.short_description} containerStyle={styles.cardItem} />
              </View>
            )}
            {product.upsell && product.upsell.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardItemHeader}>Products you may like</Text>
                <ProductsRow keyPrefix="product" products={product.upsell} />
              </View>
            )}
            {product.related && product.related.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardItemHeader}>Related Products</Text>
                <ProductsRow keyPrefix="product" products={product.related} />
              </View>
            )}
            {loading && <ActivityIndicator style={{flex: 1}} />}
          </ScrollView>

          {/* Footer Content */}
          {(product.purchasable ||
            (product.type === "external" && product.external_url) ||
            product.type === "grouped") && (
            <View style={styles.footer}>
              {product.type === "external" ? (
                <Fragment>
                  <Button
                    onPress={this._handleExternalProduct}
                    style={[styles.footerButton, {backgroundColor: accent_color}]}>
                    <Text style={{color: "white"}}>Buy External Product</Text>
                  </Button>
                </Fragment>
              ) : (
                ((!isEmpty(variation) && variation.in_stock) || product.in_stock) && (
                  <Fragment>
                    <Button
                      onPress={() => this._handleAddToCart(true)}
                      style={[styles.footerButton, {backgroundColor: "#f7f7f7"}]}>
                      <Text>Buy Now</Text>
                    </Button>
                    <Button
                      style={[styles.footerButton, {backgroundColor: accent_color}]}
                      onPress={() => this._handleAddToCart(false)}>
                      <Text style={{color: "white"}}>Add to Cart</Text>
                    </Button>
                  </Fragment>
                )
              )}
            </View>
          )}
        </Container>
        <Modal
          isVisible={modalVisible}
          onBackButtonPress={this._closeModal}
          hasBackdrop
          backdropOpacity={0.3}
          useNativeDriver
          hideModalContentWhileAnimating
          style={{marginHorizontal: 0, marginBottom: 0, justifyContent: "flex-end"}}>
          <MiniCart data={this.state} close={this._closeModal} message={this.state.cartMsg} />
        </Modal>
      </>
    );
  }
}

// const mapDispatchToProps = {
//   getCartCount,
// };

function PickerField({selectedItem, defaultText, getLabel, clear}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        minHeight: 30,
        backgroundColor: "#efefef",
        alignItems: "center",
        padding: 8,
        borderRadius: 4,
      }}>
      <Text style={{color: selectedItem ? selectedItem.color : "gray"}}>
        {selectedItem ? getLabel(selectedItem) : defaultText}
      </Text>
      <Icon name="ios-arrow-down" size={20} color="gray" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  footer: {
    width: "100%",
    flexDirection: "row",
  },
  footerButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  rowCenterSpaced: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    marginTop: 10,
  },
  cardItemHeader: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
    padding: 16,
    paddingTop: 0,
  },
  cardItem: {
    paddingHorizontal: 16,
  },
  pincodeView: {
    flex: 1,
    alignItems: "center",
  },
  pincodeText: {
    //fontWeight: "500",
    textAlign: "center",
    fontSize: 12,
  },
  btn: {
    borderWidth: 1,
    borderColor: "#dedede",
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
});

const mapStateToProps = state => ({
  appSettings: state.appSettings,
  shipping: state.shipping,
});
const mapDispatchToProps = {
  getCartCount,
  changeShippingPincode,
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(ProductDetailScreen));
