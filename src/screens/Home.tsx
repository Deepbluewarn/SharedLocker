import {RootStackScreenProps} from '@/navigation/types';
import authAPI from '@/network/auth/api';
import userAPI from '@/network/user/api';
import {ILockerWithUserInfo} from '@/types/locker';
import {removeAllSecureToken} from '@/utils/keychain';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, Card} from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';

export default function Home(props: RootStackScreenProps<'Home'>): JSX.Element {
  const {
    status: authStatus,
    data: authData,
    refetch: authRefetch,
  } = useQuery(['auth'], () => authAPI().signOut(), {
    enabled: false,
    retry: false,
  });

  // 유저 소유 보관함.
  const {data: userLockerData, refetch: userLockerRefetch} = useQuery(
    ['userLocker'],
    () => userAPI().locker(),
  );

  // 유저가 공유받은 보관함.
  // TODO

  // 유저가 이용할 수 있는 보관함의 전체 목록입니다. 소유 보관함과 공유 보관함을 모두 포함합니다.
  const [userLocker, setUserLocker] = useState<
    Map<string, ILockerWithUserInfo>
  >(new Map());
  const [selectedLocker, setSelectedLocker] = useState<ILockerWithUserInfo>();
  const [showDropDown, setShowDropDown] = useState(false);
  const [selLocker, setSelLocker] = useState<string>();

  useFocusEffect(
    useCallback(() => {
      userLockerRefetch();
    }, [userLockerRefetch]),
  );

  useEffect(() => {
    const locker: ILockerWithUserInfo = userLockerData?.data.locker[0];

    if (!locker) {
      setUserLocker(new Map());
      setSelLocker('');
      return;
    }

    const lockerKey = `${locker.building}-${locker.floorNumber}-${locker.lockerNumber}`;

    setUserLocker(map => {
      return map.set(lockerKey, locker);
    });

    setSelLocker(lockerKey);
  }, [userLockerData]);

  useEffect(() => {
    if (authStatus === 'success' && authData) {
      const _data = authData.data;

      if (_data && _data.success) {
        const tokenExist = _data.token ? true : false;
        if (!tokenExist) {
          removeAllSecureToken();
        }
      }
    }
  }, [authStatus, authData]);

  const getLockerList = useCallback(() => {
    const res: any[] = [];

    userLocker.forEach((value, key) => {
      res.push({
        label: `${value.building} ${value.floorNumber}층 ${value.lockerNumber}번`,
        value: key,
      });
    });

    return res;
  }, [userLocker]);

  const getCurrentLockerString = useCallback(() => {
    if (typeof selectedLocker === 'undefined') {
      return;
    }
    return `${selectedLocker?.building}-${selectedLocker?.floorNumber}-${selectedLocker?.lockerNumber}`;
  }, [selectedLocker]);

  useEffect(() => {
    if (!selLocker || selLocker === '') {
      setSelectedLocker(undefined);
      return;
    }

    setSelectedLocker(userLocker.get(selLocker));
  }, [userLocker, selLocker]);

  return (
    <ScrollView
      style={{
        padding: 16,
      }}>
      <Card
        mode="contained"
        style={{
          padding: 8,
        }}>
        <Card.Title title="사용중인 보관함" />
        <Card.Content>
          <View
            style={{
              margin: 16,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
            }}>
            <QRCode
              value={getCurrentLockerString()}
              logoBackgroundColor="transparent"
            />
          </View>
          <View>
            <DropDown
              label={'보관함을 선택하세요'}
              mode={'outlined'}
              visible={showDropDown}
              showDropDown={() => setShowDropDown(true)}
              onDismiss={() => setShowDropDown(false)}
              value={selLocker}
              setValue={setSelLocker}
              list={getLockerList()}
            />
          </View>
        </Card.Content>
      </Card>
      {userLocker.size > 0 ? (
        <Button mode="outlined" onPress={() => {}}>
          보관함 삭제 (아직 구현 안됨)
        </Button>
      ) : (
        <Button
          mode="outlined"
          onPress={() => {
            props.navigation.navigate('ClaimLocker');
          }}>
          보관함 신청
        </Button>
      )}

      {userLocker.size > 0 ? (
        <Button
          mode="outlined"
          onPress={() => {
            if (!selectedLocker) {
              Toast.show({
                type: 'warning',
                text1: '오류',
                text2: '보관함 정보가 없습니다.',
              });
              return;
            }
            props.navigation.navigate('ShareLocker', selectedLocker);
          }}>
          보관함 공유
        </Button>
      ) : null}
      <Button
        mode="outlined"
        onPress={() => {
          authRefetch();
        }}>
        로그아웃
      </Button>
    </ScrollView>
  );
}
