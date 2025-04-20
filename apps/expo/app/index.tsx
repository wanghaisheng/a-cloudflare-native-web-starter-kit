import { useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { Text } from "react-native";

export default function Index() {
  return <Redirect href="/(gameui)" />;
}
