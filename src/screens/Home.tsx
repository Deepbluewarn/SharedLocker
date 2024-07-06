import { LockerContext } from '@/Intro';
import { HomeTabParamList, HomeTabScreenProps } from '@/navigation/types';
import authAPI from '@/network/auth/api';
import lockerAPI from '@/network/locker/api';
import userAPI from '@/network/user/api';
import { removeAllSecureToken } from '@/utils/keychain';
import { mutationErrorHandler } from '@/utils/mutationHandler';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Appbar, Button, Card, Divider, Menu, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import { DropdownStyles } from '@/styles/dropdown';
import ClaimLocker from './Claim/ClaimLocker';
import ShareLocker from './ShareLocker';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { ILockerCancel, ILockerWithUserInfo } from '@/types/api/locker';
import { IServerErrorResponse } from '@/types/api';
import { IUser, IUsersLocker, IUsersSharedLocker } from '@/types/api/user';
import { ILogout, IQrKey } from '@/types/api/auth';
import RequestList from '@/components/RequestList';
import Admin from './Admin';

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
  } = useQuery<ILogout>(['auth'], () => authAPI().signOut(), {
    enabled: false,
    retry: false,
  });

  // 유저 소유 보관함.
  const { data: userLockerData, refetch: userLockerRefetch } = 
    useQuery<IUsersLocker>(
      ['userLocker'],
      () => userAPI().locker(),
  );

  // 유저가 공유받은 보관함.
  const { data: sharedLockerData, refetch: sharedLockerRefetch } = useQuery<IUsersSharedLocker>(
    ['sharedLocker'],
    () => userAPI().sharedLocker(),
  )

  // QR Key 요청
  const { data: qrKeyData } = useQuery<IQrKey>(
    ['qrKey'],
    () => authAPI().qrKey(),
    {
      enabled: userLocker.size > 0,
      refetchInterval: 20000
    }
  );

  interface ICancelLockerMutation {
    buildingNumber: number,
    floorNumber: number,
    lockerNumber: number,
    isOwner: boolean,
    assigneeTo: string
  }

  const cancelLockerMutation = 
    useMutation<ILockerCancel, IServerErrorResponse<string>, ICancelLockerMutation>({
    mutationFn: (data: {
      buildingNumber: number,
      floorNumber: number,
      lockerNumber: number,
      isOwner: boolean,
      assigneeTo: string,
    }) => {
      return lockerAPI().cancelLocker(
        data.buildingNumber,
        data.floorNumber,
        data.lockerNumber,
        data.isOwner,
        data.assigneeTo
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
    if(typeof userLockerData === 'undefined' || typeof sharedLockerData === 'undefined') return;
    
    const locker: ILockerWithUserInfo[] = userLockerData.data.value || [];
    const sharedLocker: ILockerWithUserInfo[] = sharedLockerData.data.value || [];
    const combinedLocker: ILockerWithUserInfo[] = [...sharedLocker, ...locker].filter((locker) => {
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

    if (typeof locker !== 'undefined' && locker.length === 0) {
      lockerKey = `${combinedLocker[0].buildingName}-${combinedLocker[0].floorNumber}-${combinedLocker[0].lockerNumber}`;
      lockerDesc = `${combinedLocker[0].buildingName} ${combinedLocker[0].floorNumber}층 ${combinedLocker[0].lockerNumber}번`;
    } else {
      lockerKey = `${locker[0].buildingName}-${locker[0].floorNumber}-${locker[0].lockerNumber}`;
      lockerDesc = `${locker[0].buildingName} ${locker[0].floorNumber}층 ${locker[0].lockerNumber}번`;
    }

    setUserLocker(map => {
      const newMap = new Map(map);

      combinedLocker.forEach((locker) => {
        newMap.set(`${locker.buildingName}-${locker.floorNumber}-${locker.lockerNumber}`, locker);
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
        const tokenExist = _data.value ? true : false;
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
        label: `[${value.owned ? '소유' : '공유'}] ${value.buildingName} ${value.floorNumber}층 ${value.lockerNumber}번`,
        value: key,
      });
    });

    return res;
  }, [userLocker]);

  const generateQRCode = useCallback(() => {
    if (typeof selectedLocker === 'undefined') {
      return;
    }

    if (!qrKeyData || !qrKeyData.data.success || !qrKeyData.data.value) return;

    const lockerInfo = `${selectedLocker?.buildingNumber} ${selectedLocker?.floorNumber} ${selectedLocker?.lockerNumber}`;

    if (!lockerInfo) return;

    return `${qrKeyData.data.value.key} ${lockerInfo}`;
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
              buildingNumber: selectedLocker.buildingNumber,
              floorNumber: selectedLocker.floorNumber,
              lockerNumber: selectedLocker.lockerNumber,
              isOwner: selectedLocker.owned,
              assigneeTo: selectedLocker.sharedWithUsers[0].userId
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

  useEffect(() => {
    const unsubscribeBlur = props.navigation.addListener('blur', () => {
      closeMenu();
    });

    return () => {
      unsubscribeBlur();
    };
  }, [props.navigation]);
  
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
          <Menu.Item onPress={() => {props.navigation.navigate('HomeMenu', {screen: 'SettingStack'})}} title="설정" />
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

          {
            selectedLocker?.owned ? (
              <>
                <Divider />

                <Text variant='bodyLarge'>
                  공유 요청 목록
                </Text>
                <RequestList locker={selectedLocker}/>
              </>
            ) : null
          }

        </View>
      </ScrollView>
    </>
  );
}


export function HomeNavigator(): JSX.Element {
  const Tab = createMaterialBottomTabNavigator<HomeTabParamList>();
  const {
    data: userData,
    isError: userIsError
  } = useQuery<IUser>(['user'], () => userAPI().user());

  const admin = userData?.data?.value.admin;

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} options={{
        tabBarLabel: '홈',
        tabBarIcon: 'home',
      }} />
      <Tab.Screen name="ClaimLocker" component={ClaimLocker} options={{
        tabBarLabel: '신청',
        tabBarIcon: 'plus',
      }}/>
      <Tab.Screen name="ShareLocker" component={ShareLocker} options={{
        tabBarLabel: '공유',
        tabBarIcon: 'share-variant',
      }}/>
      {
        admin && admin.role === 'worker' && (
          <Tab.Screen name="Admin" component={Admin} options={{
            tabBarLabel: '관리자',
            tabBarIcon: 'shield-account',
          }}/>
        )
      }
    </Tab.Navigator>
  )
}