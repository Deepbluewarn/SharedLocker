import {ILockerWithUserInfo} from '@/types/locker';
import {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

export type WelcomeStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  HomeNavigator: {
    screen: keyof HomeTabParamList;
  };
  HomeMenu: {
    screen: keyof MenuStackParamList;
  };
}
export type HomeTabParamList = {
  Home: {refresh?: boolean};
  ClaimLocker: undefined;
  ShareLocker: ILockerWithUserInfo;
};

export type MenuStackParamList = {
  Profile: undefined;
  Test: undefined;
};

export type WelcomeStackScreenProps<T extends keyof WelcomeStackParamList> =
  NativeStackScreenProps<WelcomeStackParamList, T>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, T>;
  
export type HomeTabScreenProps<T extends keyof HomeTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<HomeTabParamList, T>,
    HomeStackScreenProps<keyof HomeStackParamList>
  >

export type HomeMenuStackScreenProps<T extends keyof MenuStackParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MenuStackParamList, T>,
    HomeStackScreenProps<keyof HomeStackParamList>
  >

export type ClaimStackParamList = {
  Main: undefined;
  Sub: {buildingSelection: string};
  Detail: {
    buildingSelection: string;
    floorSelection: number;
  };
};

export type ClaimStackScreenProps<T extends keyof ClaimStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ClaimStackParamList, T>,
    HomeTabScreenProps<keyof HomeTabParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends WelcomeStackParamList {}
  }
}
