import React from 'react';
import {Linking, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {WelcomeStackScreenProps} from '@/navigation/types';
import {removeAllSecureToken} from '@/utils/keychain';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { useQuery } from '@tanstack/react-query';
import { IToken } from '@/types/api/auth';
import authAPI from '@/network/auth/api';

export default function Welcome(props: WelcomeStackScreenProps<'Welcome'>): JSX.Element {  
  const authorizationCode = props.route.params?.code
  const { 
    status: tokenResolveStatus, data: tokenResolveData 
  } = useQuery<IToken>(['auth'], () => authAPI().resolveAuthorizationCode(authorizationCode), {
    enabled: authorizationCode !== undefined,
  });
  
  const kakaoLoginBtn = async () => {
    const url = `${process.env.API_BASE_URL}/auth/native/kakao`
    try {
      if (await InAppBrowser.isAvailable()) {
        InAppBrowser.openAuth(url, 'sharedlocker://', {
          // iOS Properties
          ephemeralWebSession: false,
          // Android Properties
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false
        }).then((response) => {
          if (
            response.type === 'success' &&
            response.url
          ) {
            Linking.openURL(response.url)
          }
        })
      } else Linking.openURL(url)
    } catch (error) {
      Linking.openURL(url)
    }
  }
  
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        gap: 64,
        padding: 16,
      }}>
      <View
        style={{
          alignItems: 'center',
          gap: 4,
        }}>
        <Text variant="displayLarge">공유 사물함</Text>
        <Text variant="titleLarge">SHARED LOCKER</Text>
      </View>
      <View
        style={{
          gap: 8,
        }}>
          <Button mode="contained-tonal" onPress={kakaoLoginBtn}>
            카카오 로그인
          </Button>
        <Button
          mode="contained-tonal"
          onPress={() => {
            props.navigation.navigate('Login');
          }}>
          로그인
        </Button>
        <Button
          mode="elevated"
          onPress={() => {
            props.navigation.navigate('Register');
          }}>
          회원가입
        </Button>

        {/* <Button
          mode="elevated"
          onPress={() => {
            removeAllSecureToken().then(() => {
              console.log('토큰이 모두 제거되었습니다.');
            });
          }}>
          removeAllSecureToken
        </Button> */}
      </View>
    </View>
  );
}
