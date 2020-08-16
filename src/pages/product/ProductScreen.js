import React from "react";
import {StyleSheet, View, FlatList, ActivityIndicator} from "react-native";
import {Toolbar, Container, Text, Button, Icon, EmptyList} from "components";
import {connect} from "react-redux";
import Toast from "react-native-simple-toast";
import ProductItem from "./ProductItem";
import {ApiClient} from "service";
import {FlatGrid} from "react-native-super-grid";
import Filter from "./Filter";
import Modal from "react-native-modal";
import {isEmpty} from "lodash";
import CategoryItem from "../home/CategoryItem";
import SortOptions from "./SortOptions";

class ProductScreen extends React.PureComponent {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    console.log(props.navigation.state.params);

    const {category_id, featured, sortby, on_sale} = props.navigation.state.params;
    const {price} = props.appSettings;

    this.state = {
      products: [],
      loading: true,
      hasMore: false,
      showFilter: false,
      showFilterSort: false,
      categories: [],
      attributes: [],
    };
    this.params = {
      page: 1,
      per_page: 20,
      on_sale,
      sort: sortby || "popularity",
      featured,
      category: category_id,
      min_price: price.min || 0,
      max_price: price.max || "",
    };
    this.attr = {};
  }

  openFilter = () => {
    this.setState({showFilter: true});
  };

  openSort = () => {
    this.setState({showFilterSort: true, hasMore: false});
  };

  closeFilter = () => {
    this.setState({showFilter: false});
  };

  closeSort = () => {
    this.setState({showFilterSort: false});
  };

  sortData = text => {
    this.setState({
      showFilterSort: false,
      products: [],
      hasMore: false,
      loading: true,
    });
    console.log(text);
    this.params.sort = text;
    this.params.page = 1;
    this.loadProducts();
  };

  componentDidMount() {
    this.loadProducts();
    if (this.params.category) {
      ApiClient.get("products/all-categories", {parent: this.params.category}).then(({data}) => {
        console.log(data);
        this.setState({categories: data});
      });
    }

    const params = {
      hide_empty: true,
      show_all: true,
    };
    ApiClient.get("products/custom-attributes", params).then(({data}) => {
      this.setState({attributes: data});
    });
  }

  loadProducts = () => {
    console.log(this.params);
    ApiClient.post("custom-products", this.attr, {params: this.params})
      .then(({data}) => {
        this.fetchAttributes(data);
      })
      .catch(e => {
        Toast.show(e.toString(), Toast.LONG);
        this.setState({
          loading: false,
        });
      });
  };

  fetchAttributes = async data => {
    await this.setState(prevState => ({
      products: [...prevState.products, ...data],
      hasMore: data.length == this.params.per_page,
      loading: false,
    }));
    //will use global attrributes
    /*const params = {
      product: this.state.products.map(item => item.id).join(),
      hide_empty: true,
    };
    ApiClient.get("products/custom-attributes", params).then(({data}) => {
      this.setState({attributes: data});
    });*/
  };

  onEndReached = () => {
    if (!this.state.hasMore) return;
    this.params.page++;
    this.setState({loading: true, hasMore: false}, () => this.loadProducts());
  };

  onFilter = (params, attr) => {
    this.params = params;
    this.attr = attr;
    console.log(this.attr);
    this.setState({showFilter: false, products: [], loading: true, hasMore: false}, () =>
      this.loadProducts(),
    );
  };

  _renderItem = ({item, index}) => <ProductItem item={item} />;

  getToProductPage = param => {
    this.params.category = param;
    this.params.page = 1;
    this.setState({hasMore: false, products: []});
    this.loadProducts();
  };

  _renderItemCat = ({item, index}) => <CategoryItem item={item} index={index} />;

  listHeaderComponent = () =>
    !isEmpty(this.state.categories) && (
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={this.state.categories}
        keyExtractor={this._categoryKeyExtractor}
        renderItem={this._renderItemCat}
        removeClippedSubviews={true}
      />
    );

  _categoryKeyExtractor = item => "category_" + item.id;

  _keyExtractor = item => "products_" + item.id;

  render() {
    const {products, loading, showFilter, showFilterSort, attributes} = this.state;
    const {
      appSettings: {accent_color},
    } = this.props;

    return (
      <Container>
        <Toolbar backButton title="PRODUCTS" />
        <View style={styles.filterContainer}>
          <Button style={styles.button} onPress={this.openFilter}>
            <Icon name="menu-unfold" type="AntDesign" size={20} />
            <Text style={styles.btntext}>Categories</Text>
          </Button>
          <Button style={styles.button} onPress={this.openSort}>
            <Icon name="swap" type="AntDesign" size={20} />
            <Text style={styles.btntext}>Sort By</Text>
          </Button>
          <Button style={styles.button} onPress={this.openFilter}>
            <Icon name="filter" type="AntDesign" size={20} />
            <Text style={styles.btntext}>Filter</Text>
          </Button>
        </View>
        <FlatGrid
          items={products}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
          itemDimension={160}
          spacing={8}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.33}
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={!loading}
          itemContainerStyle={{justifyContent: "flex-start"}}
          ListHeaderComponent={this.listHeaderComponent}
          ListEmptyComponent={<EmptyList loading={loading} label="Products not available" />}
          ListFooterComponent={
            products.length > 0 && loading ? (
              <ActivityIndicator color={accent_color} size="large" style={{padding: 16}} />
            ) : null
          }
        />
        <Modal
          animationType="slide"
          isVisible={showFilter}
          useNativeDriver
          hideModalContentWhileAnimating
          style={{margin: 0}}
          onBackdropPress={this.closeFilter}>
          <Filter
            onBackPress={this.closeFilter}
            onFilter={this.onFilter}
            filterData={this.params}
            attributes={attributes}
            seletedAttr={this.attr}
          />
        </Modal>
        <Modal
          style={{justifyContent: "flex-end", margin: 0, marginTop: "auto"}}
          onBackButtonPress={this.closeSort}
          onBackdropPress={this.closeSort}
          hasBackdrop
          useNativeDriver
          hideModalContentWhileAnimating
          isVisible={showFilterSort}>
          <SortOptions
            data={products}
            sort={this.params.sort}
            onBackButtonPress={this.closeSort}
            sortData={this.sortData}
          />
        </Modal>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    elevation: 5,
    shadowRadius: 2,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
  },
  button: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  btntext: {
    marginStart: 5,
  },
});

const mapStateToProps = state => ({appSettings: state.appSettings});

export default connect(mapStateToProps)(ProductScreen);
