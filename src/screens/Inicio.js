import * as React from "react";
import { View, Text } from "react-native";

export default function InicioScreen(navigation) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text
        onPress={() => alert("Principal")}
        style={{ fontSize: 26, fontWeight: "bold" }}
      >
        Vista Principal
      </Text>
    </View>
  );
}
