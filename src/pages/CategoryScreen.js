import React from "react";
import {ScrollView} from "react-native";
import {connect} from "react-redux";
import {Text, Toolbar, Icon, TreeView} from "components";
import {getAllCategories} from "store/actions";

class CategoryScreen extends React.PureComponent {
  static navigationOptions = {
    header: <Toolbar backButton title="Category" />,
  };

  constructor(props) {
    super(props);
    this.props.getAllCategories();
  }

  _renderCategoryItem = (item, level) => {
    return (
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginStart: 16 * level,
            height: 40,
          }}>
          <Text style={{fontSize: 16}}>{item.name}</Text>
          {item.collapsed !== null && (
            <Icon name={item.collapsed ? "ios-add" : "ios-remove"} size={24} />
          )}
        </View>
      </View>
    );
  };

  gotoPage = id => {
    this.props.navigation.navigate("ProductScreen", {params: id});
  };

  render() {
    return (
      <>
        <Toolbar title="Categories" backButton />
        <ScrollView style={{paddingHorizontal: 10}}>
          {this.props.categories.data != undefined && (
            <TreeView
              data={this.props.categories.data}
              collapsedItemHeight={40}
              onpress={this.gotoPage}
            />
          )}
        </ScrollView>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    categories: state.categories,
  };
};

const mapDispatchToProps = {
  getAllCategories,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CategoryScreen);
