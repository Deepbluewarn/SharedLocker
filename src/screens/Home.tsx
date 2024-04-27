import { LockerContext } from '@/Intro';
import { HomeTabParamList, HomeTabScreenProps } from '@/navigation/types';
import authAPI from '@/network/auth/api';
import lockerAPI from '@/network/locker/api';
import userAPI from '@/network/user/api';
import { ILockerWithUserInfo } from '@/types/locker';
import { removeAllSecureToken } from '@/utils/keychain';
import { mutationErrorHandler } from '@/utils/mutationHandler';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Appbar, Button, Card, Divider, Menu } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import { DropdownStyles } from '@/styles/dropdown';
import ClaimLocker from './Claim/ClaimLocker';
import ShareLocker from './ShareLocker';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';

export default function Home(props: HomeTabScreenProps<'Home'>): JSX.Element {
  // 유저가 이용할 수 있는 보관함의 전체 목록입니다. 소유 보관함과 공유 보관함을 모두 포함합니다.
  const [userLocker, setUserLocker] = useState<
    Map<string, ILockerWithUserInfo>
  >(new Map());
  const { selectedLocker, setSelectedLocker } = useContext(LockerContext);
  const [showDropDown, setShowDropDown] = useState(false);
  const [selLocker, setSelLocker] = useState<string>();
  const [selLockerDesc, setSelLockerDesc] = useState<string>('');
  const [dropdownPlaceholder, setDropdownPlaceholder] = 
    useState<string>(userLocker.size > 0 ? '보관함 선택' : '보관함이 없습니다.');
  const params = props.route.params;
  const {
    status: authStatus,
    data: authData,
    refetch: authRefetch,
  } = useQuery(['auth'], () => authAPI().signOut(), {
    enabled: false,
    retry: false,
  });

  // 유저 소유 보관함.
  const { data: userLockerData, refetch: userLockerRefetch } = useQuery(
    ['userLocker'],
    () => userAPI().locker(),
  );

  // 유저가 공유받은 보관함.
  const { data: sharedLockerData, refetch: sharedLockerRefetch } = useQuery(
    ['sharedLocker'],
    () => userAPI().sharedLocker(),
  )

  // QR Key 요청
  const { data: qrKeyData } = useQuery(
    ['qrKey'],
    () => authAPI().qrKey(),
    {
      enabled: userLocker.size > 0,
      refetchInterval: (data, query) => {
        if (!data || !data.data.success) return false;

        const _data = data.data;

        const currentTime = new Date().getTime();
        const expiresIn = _data.qrKey.expiredAt - currentTime;

        return expiresIn;
      }
    }
  );

  const cancelLockerMutation = useMutation({
    mutationFn: (data: {
      building: string,
      floorNumber: number,
      lockerNumber: number,
      isOwner: boolean,
    }) => {
      return lockerAPI().cancelLocker(
        data.building,
        data.floorNumber,
        data.lockerNumber,
        data.isOwner,
      );
    },
    onSuccess: (data) => {
      if (data.data.success) {
        Toast.show({
          type: 'success',
          text1: '성공',
          text2: '보관함 취소가 완료되었습니다.',
        });
        userLockerRefetch();
        sharedLockerRefetch();
      }
    },
    onError: (error) => {
      mutationErrorHandler(error);
    }
  })

  useFocusEffect(
    useCallback(() => {
      if (typeof params === 'undefined') return;

      if (params.refresh) {
        userLockerRefetch();
        sharedLockerRefetch();
      }
    }, [userLockerRefetch, sharedLockerRefetch, params]),
  );

  useEffect(() => {
    const locker: ILockerWithUserInfo = userLockerData?.data.locker[0];
    const sharedLocker: ILockerWithUserInfo[] = sharedLockerData?.data.locker || [];
    const combinedLocker = [...sharedLocker, locker].filter((locker) => {
      return locker !== undefined;
    });
    let lockerKey = '';
    let lockerDesc = '';

    if (!combinedLocker || combinedLocker.length === 0) {
      setUserLocker(new Map());
      setSelLockerDesc('');
      setSelLocker('');
      return;
    }

    if (!locker) {
      lockerKey = `${combinedLocker[0].building}-${combinedLocker[0].floorNumber}-${combinedLocker[0].lockerNumber}`;
      lockerDesc = `${combinedLocker[0].building} ${combinedLocker[0].floorNumber}층 ${combinedLocker[0].lockerNumber}번`;
    } else {
      lockerKey = `${locker.building}-${locker.floorNumber}-${locker.lockerNumber}`;
      lockerDesc = `${locker.building} ${locker.floorNumber}층 ${locker.lockerNumber}번`;
    }

    setUserLocker(map => {
      const newMap = new Map(map);

      combinedLocker.forEach((locker) => {
        newMap.set(`${locker.building}-${locker.floorNumber}-${locker.lockerNumber}`, locker);
      });
      return newMap;
    });
    setSelLockerDesc(lockerDesc);
    setSelLocker(lockerKey);
  }, [userLockerData, sharedLockerData]);

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
        label: `[${value.owned ? '소유' : '공유'}] ${value.building} ${value.floorNumber}층 ${value.lockerNumber}번`,
        value: key,
      });
    });

    return res;
  }, [userLocker]);

  const generateQRCode = useCallback(() => {
    if (typeof selectedLocker === 'undefined') {
      return;
    }

    if (!qrKeyData || !qrKeyData.data.success) return;

    const lockerInfo = `${selectedLocker?.building}-${selectedLocker?.floorNumber}-${selectedLocker?.lockerNumber}`;

    if (!lockerInfo) return;

    return `${qrKeyData.data.qrKey.key}-${lockerInfo}`;
  }, [selectedLocker, qrKeyData]);

  const cancelLocker = useCallback(() => {
    if (!selectedLocker) return;

    Alert.alert(
      '보관함 취소',
      `${selLockerDesc} 보관함 신청을 취소하시겠습니까?`,
      [
        {
          text: '취소',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            cancelLockerMutation.mutate({
              building: selectedLocker.building,
              floorNumber: selectedLocker.floorNumber,
              lockerNumber: selectedLocker.lockerNumber,
              isOwner: selectedLocker.owned,
            });
          },
        },
      ],
    );
  }, [selLockerDesc, selectedLocker, cancelLockerMutation]);

  useEffect(() => {
    if (!selLocker || selLocker === '') {
      setSelectedLocker(undefined);
      return;
    }

    setSelectedLocker(userLocker.get(selLocker));
  }, [userLocker, selLocker]);

  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const beforeLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            authRefetch();
          },
        },
      ],
    )
  }

  
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="스마트 공유 보관함" />
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <Appbar.Action icon='dots-vertical' onPress={openMenu}/>
          }
          anchorPosition='bottom'
        >
          <Menu.Item onPress={() => {props.navigation.navigate('HomeMenu', {screen: 'Profile'})}} title="프로필" />
          <Menu.Item onPress={() => {}} title="보관함 관리" />
          <Divider />
          <Menu.Item onPress={() => {beforeLogout()}} title="로그아웃" />
        </Menu>
      </Appbar.Header>

      <ScrollView>
        <View style={{
          margin: 16,
          gap: 16,
        }}>
          <Card
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
                {
                  generateQRCode() ? (
                    <QRCode
                      value={generateQRCode()}
                      logoBackgroundColor="transparent"
                    />
                  ) : null
                }
              </View>
              <View>
                <Dropdown
                  style={DropdownStyles.dropdown}
                  placeholderStyle={DropdownStyles.placeholderStyle}
                  selectedTextStyle={DropdownStyles.selectedTextStyle}
                  inputSearchStyle={DropdownStyles.inputSearchStyle}
                  iconStyle={DropdownStyles.iconStyle}
                  placeholder={dropdownPlaceholder}
                  data={getLockerList()}
                  labelField="label"
                  valueField="value"
                  value={selLocker}
                  onChange={(item) => {
                    setSelLocker(item.value);
                  }}
                />
              </View>
            </Card.Content>
          </Card>

          {userLocker.size > 0 ? (
            <>
              <Button mode="outlined" onPress={() => { cancelLocker() }}>
                보관함 취소
              </Button>
            </>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}


export function HomeNavigator(): JSX.Element {
  const Tab = createMaterialBottomTabNavigator<HomeTabParamList>();

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="ClaimLocker" component={ClaimLocker} />
      <Tab.Screen name="ShareLocker" component={ShareLocker} />
    </Tab.Navigator>
  )
}