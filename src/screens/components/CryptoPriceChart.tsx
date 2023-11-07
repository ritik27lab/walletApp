import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import axios from "axios";

const CryptoPriceChart = () => {
  const [data, setData] = useState();
  const fetchCoinData = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd"
      );

      setData(response.data);

      // console.log("response", response.data);
    } catch (error) {
      console.error("Error fetching cryptocurrency prices: ", error);
    }
  };

  useEffect(() => {
    fetchCoinData(); // Initial data fetch when the component mounts
  }, []);

  return (
    <View style={{ padding: 10, marginLeft: 5, flex: 1 }}>
      <FlatList
        data={data}
        style={{ flex: 0.6 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          console.log("ITEEEEEM", item);
          return (
            <View
              style={{
                flex: 0.6,
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 5,
              }}
            >
              <Image
                source={{ uri: item.image }}
                style={{ height: 20, width: 20, borderRadius: 10 }}
              ></Image>
              <Text style={{ marginLeft: 10, color: "white", width: "40%" }}>
                {item.name}
              </Text>
              <Text
                style={{
                  marginLeft: 10,
                  color: "white",
                  alignSelf: "flex-end",
                  textAlign: "right",
                }}
              >
                $ {item.current_price}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

export default CryptoPriceChart;
