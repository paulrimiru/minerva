import React from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { baseImageUrl } from '../../constants/axiosInstance';
import List from '../../presentation/List';
import RNPickerSelect from 'react-native-picker-select';

export default function render (styles, pickerSelectStyles) {
  const { navigation, coinAggregate } = this.props;
    const coin = navigation.getParam('coin');
    return (
      <ParallaxScrollView
            renderBackground={
              () => <Image source={{uri: baseImageUrl + coin.ImageUrl}} style={styles.image}/>
            }
            backgroundColor={'#ffffff'}
            parallaxHeaderHeight={180}
          >
        <View style={styles.container}>
          <View style={styles.headLine}>
            <Text style={styles.mainText}>{coin.CoinName}</Text>
            <Text style={styles.subText}>{coin.Name}</Text>
          </View>
          <View style={styles.socialList}>
            <List
              view="coinSocials"
              data={this.socialInfo} />
          </View>
          <Text>Select a coin to compare {coin.CoinName} to:</Text>
          <View style={{flex: 1, alignItems: 'center',}}>
            <RNPickerSelect
              placeholder={{
                  label: 'Select a currency or coin',
                  value: null,
              }}
              items={this.state.items}
              onValueChange={(value) => {
                  this.setState({
                      selection: value,
                  });
              }}
              onUpArrow={() => {
                  this.inputRefs.name.focus();
              }}
              onDownArrow={() => {
                  this.inputRefs.picker2.togglePicker();
              }}
              value={this.state.selection}
              ref={(el) => {
                  this.inputRefs.picker = el;
              }}
              style={{...pickerSelectStyles}}
            />
          </View>
          <View style={styles.list}>
            {
              Object.keys(coinAggregate).length > 0 ?
                <List
                  view="coinAggregate"
                  data={coinAggregate.Exchanges}
                  /> :
                <ActivityIndicator size={'large'} color={'#424242'} style={styles.loader} />
            }
          </View>
        </View>
        </ParallaxScrollView>
    );
}
