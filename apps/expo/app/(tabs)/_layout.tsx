import React from "react";
import { Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { useColorScheme } from "react-native";

import Colors from "../../utils/api";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
      }}
    >
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          // This tab should redirect to sign-in when the user is not authenticated
          tabBarLabel: ({ focused, children, color }) => {
            // @ts-ignore - we're manually defining props based on source code examination
            return (
              <Link href="/account" asChild>
                <Pressable>
                  {/* @ts-ignore - we're manually defining props based on source code examination */}
                  {({ pressed }) => (
                    <FontAwesome
                      name="user"
                      size={25}
                      color={focused ? Colors.light.tint : Colors.dark.tint}
                      style={{ marginBottom: -3, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            );
          },
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,
        }}
      />
      <Tabs.Screen
        name="lore"
        options={{
          title: "Lore",
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="gameui"
        options={{
          title: "Game UI",
          tabBarIcon: ({ color }) => <TabBarIcon name="gamepad" color={color} />,
          href: "/(gameui)",
        }}
      />
    </Tabs>
  );
}
