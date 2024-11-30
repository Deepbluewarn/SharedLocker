import {useCallback, useRef, useState} from 'react';
import Step from '@/components/Step';
import {Button, Chip, Divider, Surface, Text} from 'react-native-paper';
import {ClaimStackScreenProps} from '@/navigation/types';
import {useMutation, useQuery} from '@tanstack/react-query';
import lockerAPI from '@/network/locker/api';
import {Alert, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {isAxiosError} from 'axios';
import { LockerStatusAttrMapper, LockerStatusAttributes } from '@/utils/mapper';
import { ILocker, ILockerList, ILockerRequestShare, LockerStatus } from '@/types/api/locker';
import { StackActions } from '@react-navigation/native';

export default function DetailCategory({
  route,
  navigation,
}: ClaimStackScreenProps<'Detail'>) {
  const {buildingSelection, floorSelection} = route.params;
  const floorRef = useRef<number>(0);
  const {data, refetch} = useQuery<ILockerList>(['lockers', buildingSelection, floorSelection], () =>
    lockerAPI().lockers(buildingSelection.buildingNumber, floorSelection),
  );

  const refresh = async() => {
    refetch()
  }

  const claimMutation = useMutation<ILocker>({
    mutationFn: () =>
      lockerAPI().claimLockers(
        buildingSelection.buildingNumber,
        floorSelection,
        floorRef.current,
      ),
    onSuccess: claimData => {
      const _data = claimData.data;
      const locker = _data?.value;

      if (!locker) {
        return;
      }

      if (_data?.success) {
        Toast.show({
          type: 'success',
          text2: `${buildingSelection.buildingName} ${floorSelection}층 ${locker.lockerNumber}번 보관함을 신청하였습니다.`,
        });

        // Home 스크린으로 돌아가기 전에 Claim 스택을 초기화.
        navigation.dispatch(StackActions.popToTop());
        navigation.navigate('Home', {refresh: true});
      }
    },
    onError(error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: 'error',
          text2: error.response?.data.message,
        });
      }
    },
  });

  const requestShareLocker = useMutation<ILockerRequestShare>({
    mutationFn: () =>
      lockerAPI().requestShareLocker(
        buildingSelection.buildingNumber,
        floorSelection,
        floorRef.current,
      ),
    onSuccess: shareRequestData => {
      const _data = shareRequestData.data;

      if (_data?.success) {
        Toast.show({
          type: 'success',
          text2: _data?.message,
        });
        navigation.navigate('Home', {refresh: true});
      }
    },
    onError(error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: 'error',
          text2: error.response?.data.message,
        });
      }
    },
  });

  const onLockerButtonPressed = useCallback(
    (floor: number, lockerAttr: LockerStatusAttributes) => {
      let message = '';
      
      if (lockerAttr.status === LockerStatus.Share_Available) {
        message = `${buildingSelection.buildingName} ${floorSelection}층 ${floor}번 보관함을 공유 신청할까요?`
      } else if (lockerAttr.status === LockerStatus.Empty) {
        message = `${buildingSelection.buildingName} ${floorSelection}층 ${floor}번 보관함을 신청할까요?`
      }
      Alert.alert(
        '보관함 신청',
        message,
        [
          {
            text: '취소',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: '신청',
            onPress: () => {
              floorRef.current = floor;

              if (lockerAttr.status === LockerStatus.Share_Available) {
                requestShareLocker.mutate();
              }else if (lockerAttr.status === LockerStatus.Empty) {
                claimMutation.mutate();
              }
            },
          },
        ],
      );
    },
    [buildingSelection, claimMutation, floorSelection],
  );

  const floorList = useCallback(() => {
    if (!data) {
      return [];
    }

    const value = data.data.value;
    if(!value) return <Text>보관함 목록을 불러오지 못했습니다.</Text>;

    const sortedData = value.sort((a, b) => a.lockerNumber - b.lockerNumber);

    return sortedData.map(e => {
      const statusAttr = LockerStatusAttrMapper(e.status);

      return (
        <Surface
          elevation={1}
          key={e.lockerNumber}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: 10,
            borderRadius: 8,
          }}
        >
          <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
            <View style={{
              width: 4,
              backgroundColor: statusAttr.color,
            }}></View>

            <View style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
              <View style={{ display: 'flex', flexDirection: 'row', gap: 8, flex: 1 }}>
                <Button
                  key={e.lockerNumber}
                  mode="outlined"
                  onPress={() => onLockerButtonPressed(e.lockerNumber, statusAttr)}
                  disabled={statusAttr.disabled}
                  style={{ flex: 1 }}
                >
                  {`${e.lockerNumber}번`}
                </Button>
                <Chip
                  icon='information'
                  mode='outlined'
                >
                  {statusAttr.statusText}
                </Chip>
              </View>

              {
                e.items && e.items.length > 0 ? (
                  <>
                    <Divider />

                    <View style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      {e.items.map(e => <Chip key={e}>{e}</Chip>)}
                    </View>
                  </>
                ) : (
                  null
                )
              }

            </View>
          </View>


        </Surface>
      )
    });
  }, [data, onLockerButtonPressed]);

  return (
    <Step 
      title="보관함 번호를 선택하세요"
      breadcrumbs={[buildingSelection.buildingName, `${floorSelection.toString()}층`]}
      onRefresh={refresh}
    >
      {floorList()}
    </Step>
  );
}
