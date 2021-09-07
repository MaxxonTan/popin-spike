import MapView, {PROVIDER_GOOGLE, Region} from "react-native-maps";
import React, {useState} from "react";
import ctw from "../../custom-tailwind";
import {Center, HStack, Input, VStack, Pressable, FlatList, useTheme} from "native-base";
import {DraggableMenu} from "../menu/DraggableMenu";
import Animated, {withTiming} from "react-native-reanimated";
import {useAnimatedStyle} from "react-native-reanimated";
import {useSharedValue} from "react-native-reanimated";
import FoundationIcon from "react-native-vector-icons/Foundation";
import {FlairButton} from "../buttons/FlairButton";
import firestore from "@react-native-firebase/firestore";
import {useEffect} from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {FirestoreEvent} from "../types/FirestoreClasses";
import {MinimizedEvent} from "../buttons/MinimizedEvent";
import {DiscoverStackNavProps} from "../types/ParamList";
import {flairsList} from "../data/flairsList";

export const DiscoverScreen: React.FC<DiscoverStackNavProps<"Discover">> = ({navigation}) => {
  const {colors} = useTheme();

  const [region, setRegion] = useState<Region>({
    latitude: 53.540936,
    longitude: -113.499203,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0521,
  });

  const [menuOpened, setMenuOpened] = useState(false);
  const [events, setEventsList] = useState<FirestoreEvent[]>([]);

  const dragMenuPercentage = useSharedValue(0);
  const headingStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - dragMenuPercentage.value,
    };
  });
  const mainViewStyle = useAnimatedStyle(() => {
    return {
      opacity: dragMenuPercentage.value,
    };
  });

  // When menu open, load data
  useEffect(() => {
    if (menuOpened && events.length === 0) {
      let eventsList: FirestoreEvent[] = [];
      firestore()
        .collection("events")
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(documentSnapshot => {
            const event: FirestoreEvent = documentSnapshot.data() as FirestoreEvent;
            event.id = documentSnapshot.id;
            eventsList.push(event);
          });
        })
        .finally(() => {
          setEventsList(eventsList);
        });
    }
  }, [menuOpened, events]);

  return (
    <Center bg="primary.300" flex={1}>
      {/* <MapView
                provider={PROVIDER_GOOGLE}
                style={ctw`w-full h-full`}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
                followsUserLocation
                region={region}
            /> */}

      {/* dragMenuPercentage will reach 1 when the menu is dragged halfway up */}
      {/* Min Height is how far you can drag up and vice versa */}
      <DraggableMenu
        onMenuDragged={percent => {
          dragMenuPercentage.value = withTiming(percent * 2, {duration: 400});
          // console.log('percent' + percent)
          setMenuOpened(percent > 0);
        }}
        minHeightOffset={6}
        maxHeightOffsetFromScreenHeight={17.5}
        snapPositionsInPercentage={[0, 0.25, 0.5, 1]}>
        <VStack
          padding={2}
          paddingTop={1}
          height={hp(85)}
          alignItems="center"
          justifyContent="flex-start">
          <Animated.Text
            style={[
              headingStyle,
              ctw`absolute top-0 w-full text-center text-4xl text-secondary-400 font-primary_400`,
            ]}>
            View event list
          </Animated.Text>
          <Animated.View
            pointerEvents={menuOpened ? "auto" : "none"}
            style={[mainViewStyle, ctw`w-full h-full`]}>
            <VStack>
              <HStack height={hp(5)} justifyContent="flex-start">
                <Input
                  flex={15}
                  height={hp(5)}
                  fontSize={hp(2)}
                  placeholder="Search event name..."
                  borderWidth={0}
                />
                <Pressable
                  flex={1}
                  height={hp(5)}
                  _pressed={{
                    bg: "transparent",
                  }}
                  padding={1}>
                  {({isPressed}) => (
                    <FoundationIcon
                      size={hp(4)}
                      name="filter"
                      style={ctw.style(`text-center`, {
                        color: isPressed ? colors["secondary"]["700"] : colors["secondary"]["400"],
                      })}
                    />
                  )}
                </Pressable>
              </HStack>
              <FlatList
                paddingTop={2}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={flairsList}
                renderItem={({item}) => (
                  <FlairButton
                    onClick={type => console.log(type)}
                    name={item.name}
                    iconSource={item.iconSource}></FlairButton>
                )}
                keyExtractor={item => item.name}
              />
              <FlatList
                paddingTop={5}
                onRefresh={() => setEventsList([])}
                refreshing={events.length === 0}
                data={events}
                keyExtractor={(event: FirestoreEvent) => event.id}
                renderItem={({item}) => (
                  <MinimizedEvent
                    onMapPinClick={() => null}
                    onEventClick={() =>
                      navigation.navigate("Event", {
                        event: item,
                      })
                    }
                    event={item}
                  />
                )}
              />
            </VStack>
          </Animated.View>
        </VStack>
      </DraggableMenu>
    </Center>
  );
};
