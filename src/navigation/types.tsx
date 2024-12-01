import { Building, ILockerWithUserInfo } from '@/types/api/locker';
import {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

export type WelcomeStackParamList = {
  Welcome: {
    code: string;
  };
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
  SearchLocker: undefined;
  Admin: undefined;
};

export type MenuStackParamList = {
  SettingStack: {
    screen: keyof SettingStackParamList;
  };
};

export type SettingStackParamList = {
  Settings: undefined;
  Profile: undefined;
  LockerManagement: undefined;
  UpdateNickname: undefined;
}

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

export type SettingStackScreenProps<T extends keyof SettingStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingStackParamList, T>,
    HomeMenuStackScreenProps<keyof MenuStackParamList>
  >

export type ClaimStackParamList = {
  Main: undefined;
  Sub: {buildingSelection: Building};
  Detail: {
    buildingSelection: Building;
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
