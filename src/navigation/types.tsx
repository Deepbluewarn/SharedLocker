import {ILockerWithUserInfo} from '@/types/locker';
import {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ClaimLocker: undefined;
  ShareLocker: ILockerWithUserInfo;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

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
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
