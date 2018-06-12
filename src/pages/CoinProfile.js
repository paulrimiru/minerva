import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { baseImageUrl, baseSocketUrl } from '../constants/axiosInstance';
import openSocket from 'socket.io-client';
import List from '../presentation/List';

class CoinProfile extends Component {
  static navigationOptions = {
    title: 'Profile',
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      coinPrice: [],
      loaded: false,
    };
    this.socket = openSocket(baseSocketUrl);
    this.socialInfo = [];
  }

  componentDidMount(){
    const { navigation, fetchProfile, fetchSocials } = this.props;
    const coin = navigation.getParam('coin');

    fetchProfile(coin.Id, () => {
      fetchSocials(coin.Id, () => {
        const { coinProfile } = this.props;
        this.processSocialInfo()
        this.socket.on('m', resp => this.updateCoinStatus(resp));
        this.socket.emit('SubAdd', { subs:  coinProfile.Subs } );
      });
    });
  }

  componentWillUnmount() {
    const { coinProfile } = this.props;
    this.socket.emit('SubRemove', { subs: coinProfile.Subs } );
    this.socket.close();
  }

  updateCoinStatus = (coin) => {
    const values = coin.split('~');
    const keys = ['Type', 'ExchangeName', 'FromCurrency', 'ToCurrency',
    'Flag', 'Price', 'LastUpdate', 'LastVolume', 'LastVolumeTo',
    'LastTradeId', 'Volume24h', 'Volume24hTo', 'MaskInt'];
    let priceSnapshot = {};
    for (let i = 0; i < values.length; i++){
      priceSnapshot[keys[i]] = values[i];
    }

    if (priceSnapshot.ToCurrency) {
      const allowedCurrencies = ['USD', 'BTC', 'ETH'];
      if (allowedCurrencies.includes(priceSnapshot.ToCurrency)) {
        this.setState({
          coinPrice: this.addOrReplace(this.state.coinPrice,
            {
              Id: Math.random(),
              currency: priceSnapshot.ToCurrency,
              price: priceSnapshot.Price,
              flag: priceSnapshot.Flag,
              exchange: priceSnapshot.ExchangeName,
            }),
          loaded: true,
        });
      }
    }
  }

  addOrReplace = (array, priceItem) => {
    const i = array.findIndex(item => item.currency === priceItem.currency);
    if (i > -1) {array[i] = priceItem;}
    else {array.push(priceItem);}

    return array;
  }

  processSocialInfo = () => {
    const { coinSocials } = this.props;
    Object.keys(coinSocials).length > 0 &&
      Object.keys(coinSocials).map((dataKey, index) => {
        const data = coinSocials[dataKey];
        switch (dataKey) {
          case 'CryptoCompare':
            this.socialInfo.push({
              name: dataKey,
              followers: data.Followers,
              url: '',
              icon: '',
              Id: Math.random(),
            });
            break;
          case 'Twitter':
            if (data.Points !== 0) {
              this.socialInfo.push({
                name: data.name,
                followers: data.followers,
                url: data.link,
                icon: 'twitter',
                Id: Math.random(),
              });
            }
            break;
          case 'Reddit':
            if (data.Points !== 0) {
              this.socialInfo.push({
                name: data.name,
                followers: data.subscribers,
                url: data.url,
                icon: 'reddit-alien',
                Id: Math.random(),
              });
            }
            break;
          case 'Facebook':
            if (data.Points !== 0) {
              this.socialInfo.push({
                name: data.name,
                followers: data.likes,
                url: data.link,
                icon: 'facebook-f',
                Id: Math.random(),
              });
            }
            break;
          default:
            break;
        }
    });
  }

  render() {
    const { navigation, coinProfile } = this.props;
    const coin = navigation.getParam('coin');

    const { coinPrice, loaded } = this.state;
    return (
        <View style={styles.container}>
          <Image source={{uri: baseImageUrl + coin.ImageUrl}} style={styles.image}/>

          <View style={styles.headLine}>
            <Text style={styles.mainText}>{coin.CoinName}</Text>
            <Text style={styles.subText}>{coin.Name}</Text>
          </View>

          {
            Object.keys(coinProfile).length > 0 &&
            <Text
              numberOfLines={5}
              ellipsizeMode={'tail'}
              style={styles.descriptionText}>{coinProfile.General.Description.replace(/<\/?[^>]+(>|$)/g, '')}</Text>
          }

          <List
            style={styles.socialsList}
            view={'coinSocials'}
            data={this.socialInfo} />

          <Text>Price against top currencies and coins</Text>

          {
            !loaded ? <ActivityIndicator size="large" color="#424242" style={styles.loader}/> :
            <List
              style={styles.list}
              view="coinProfile"
              data={coinPrice}
            />
          }
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  socialsContainer: {
    flexDirection: 'row',
  },
  image: {
    height: 200,
    width: '100%',
    resizeMode: Image.resizeMode.contain,
    marginTop: 4,
  },
  mainText: {
    fontSize: 32,
    fontWeight: '400',
  },
  subText: {
    fontSize: 14,
    fontWeight: '200',
    alignSelf: 'center',
  },
  descriptionText: {
    margin: 8,
    fontSize: 14,
    fontWeight: '100',
    alignContent: 'center',
    justifyContent: 'center',
  },
  headLine: {
    marginTop: 12,
    marginBottom: 12,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 16,
  },
  socialsList: {
    marginTop: 8,
    marginBottom: 8,
    justifyContent: 'center',
  },
});

export default CoinProfile;
