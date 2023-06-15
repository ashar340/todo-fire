import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import {
  PaperProvider,
  MD3DarkTheme,
  AnimatedFAB,
  Snackbar,
  Appbar,
} from "react-native-paper";
import { useValtioFirestore } from "./useFirestore";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createUserByEmailAndPassword,
  useFirebaseAuth,
} from "./useFirebaseAuth";
import { App2 } from "./AuthC";
import { TodoAccordionList, TodoAccordionListIds } from "./TodoAccordionList";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { TodoCreateModal } from "./TodoCreateModal";
import { handlePresentPress } from "./TodoCreateBottomSheetUtils";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TodoDetail } from "./TodoDetail";
import { UserContext, snackbarProxy, userProxy } from "./proxies";
import { useProxy } from "valtio/utils";
import auth from "@react-native-firebase/auth";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  fabStyle: {
    bottom: 16,
    right: 16,
    position: "absolute",
  },
});

function HomeScreen() {
  const [isExtended, setIsExtended] = React.useState(true);
  const _ = useValtioFirestore();
  const _handleMore = () =>
    auth()
      .signOut()
      .then(() => console.log("User signed out22!"));

  const onScroll = ({ nativeEvent }) => {
    const currentScrollPosition =
      Math.floor(nativeEvent?.contentOffset?.y) ?? 0;

    setIsExtended(currentScrollPosition <= 0);
  };

  return (
    <>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="Todos" />
        <Appbar.Action icon="logout" onPress={_handleMore} />
      </Appbar.Header>
      <ScrollView onScroll={onScroll} style={styles.container}>
        <TodoAccordionListIds />
      </ScrollView>

      <AnimatedFAB
        icon={"plus"}
        label={" New Todo"}
        extended={isExtended}
        onPress={() => {
          // open add bottom sheet...
          handlePresentPress();
        }}
        visible={true}
        animateFrom={"right"}
        iconMode={"dynamic"}
        style={styles.fabStyle}
      />

      <BottomSheetModalProvider>
        <TodoCreateModal />
      </BottomSheetModalProvider>
    </>
  );
}
const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { initializing } = useFirebaseAuth();
  const userState = useProxy(userProxy);

  const snackbarState = useProxy(snackbarProxy);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 0));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <PaperProvider>
            <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
              {userState.user.uid !== null ? (
                <>
                  <Stack.Navigator
                    initialRouteName="StartScreen"
                    screenOptions={{
                      headerShown: false,
                    }}
                  >
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="TodoDetail" component={TodoDetail} />
                  </Stack.Navigator>
                </>
              ) : (
                <>
                  <App2 />
                </>
              )}

              <Snackbar
                onDismiss={() => {
                  snackbarState.content = "";
                  snackbarState.isVisible = false;
                }}
                duration={3000}
                visible={snackbarState.isVisible}
              >
                {snackbarState.content}
              </Snackbar>
            </SafeAreaView>
          </PaperProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    </>
  );
}
