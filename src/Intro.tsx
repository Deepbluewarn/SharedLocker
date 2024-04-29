import React, {createContext, useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {HomeStackParamList, WelcomeStackParamList} from '@/navigation/types';
import { HomeNavigator } from './screens/Home';
import Welcome from './screens/Welcome';
import Login from './screens/Login';
import Register from './screens/Register';
import authAPI from '@/network/auth/api';
import {getSecureToken, setSecureTokens} from '@/utils/keychain';
import HomeMenu from './screens/Settings/HomeMenu';
import { NavigationContainer } from '@react-navigation/native';
import { IToken } from './types/api/auth';
import { ILockerWithUserInfo } from './types/api/locker';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';

interface ILockerScreenContext {
  selectedLocker: ILockerWithUserInfo | undefined,
  setSelectedLocker: React.Dispatch<React.SetStateAction<ILockerWithUserInfo | undefined>>
}
export const LockerContext = createContext<ILockerScreenContext>({
  selectedLocker: undefined,
  setSelectedLocker: () => {}
});

export default function Intro(): JSX.Element {
  const Stack = createNativeStackNavigator<WelcomeStackParamList>();
  const HomeStack = createNativeStackNavigator<HomeStackParamList>();
  const [rfToken, setRfToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>();
  const [selectedLocker, setSelectedLocker] = useState<ILockerWithUserInfo>();

  const {
    status: authState,
    data: authData,
    isLoading,
    isSuccess,
    isError,
  } = useQuery<IToken>(['auth'], () => authAPI().refreshToken(), {
    // 캐시 유효기간을 4초로 설정하여 비슷한 시간에 여러번 요청되는 경우를 방지.
    staleTime: 1000 * 4,
    enabled: rfToken !== '',
    retry: false,
  });

  useEffect(() => {
    getSecureToken('refreshToken').then(res => {
      if (res) {
        setRfToken(res);
      } else{
        // 토큰 없음
        setIsLoggedIn(false);
      }
    });
  }, []);

  useEffect(() => {
    if (isError) {
      Toast.show({
        type: 'error',
        text1: '오류가 발생했어요',
        text2: '잠시 후 다시 시도해주세요.',
      });
      
      setIsLoggedIn(false);
    }
    if (isSuccess && authData) {
      const _data = authData.data;
      const success = _data.success;
      const token = _data.value;
      const tokenExist = typeof token !== 'undefined' ? true : false;

      const accessToken = tokenExist ? token!.accessToken : '';
      const refreshToken = tokenExist ? token!.refreshToken : '';

      console.log(
        '[App] useQuery refresh Token authData.data: ',
        authData.data,
      );

      if (success && !tokenExist) {
        setIsLoggedIn(false);
      }
      if (success && tokenExist) {
        setIsLoggedIn(true);
        setSecureTokens(accessToken, refreshToken).then(() => {
          console.log('[Intro] 토큰이 KeyChain 에 저장되었습니다.');
        });
      }
    }
  }, [authState, isLoading, isSuccess, isError, authData]);

  useEffect(() => {
    if (typeof isLoggedIn === 'undefined') {
      return;
    }
    SplashScreen.hide();
  }, [isLoggedIn, rfToken]);

  
  return (
    <LockerContext.Provider value={{ selectedLocker, setSelectedLocker }}>
      <NavigationContainer>
        {
          isLoggedIn ? (
            <HomeStack.Navigator initialRouteName='HomeNavigator' >
              <HomeStack.Screen name="HomeNavigator" component={HomeNavigator} options={{headerShown: false}}/>
              <HomeStack.Screen name="HomeMenu" component={HomeMenu} options={{headerShown: false}} />
            </HomeStack.Navigator>
          ) : (
            <Stack.Navigator initialRouteName="Welcome">
              <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
            </Stack.Navigator>
          )
        }
      </NavigationContainer>
    </LockerContext.Provider>
  );
}
