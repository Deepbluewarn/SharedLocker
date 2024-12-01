import { LockerContext } from '@/Intro';
import {HomeTabScreenProps} from '@/navigation/types';
import lockerAPI from '@/network/locker/api';
import { IServerErrorResponse } from '@/types/api';
import { ILockerShare, ILockerWithUserInfo } from '@/types/api/locker';
import {useMutation} from '@tanstack/react-query';
import {isAxiosError} from 'axios';
import React, {useCallback, useContext, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, Divider, Text, TextInput} from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function ShareLocker(
  props: HomeTabScreenProps<'ShareLocker'>,
): JSX.Element {
  const { selectedLocker } = useContext(LockerContext);
  const [sharedWith, setSharedWith] = useState('');

  const shareMutation = useMutation<ILockerShare, IServerErrorResponse<string>, ILockerWithUserInfo>({
    mutationFn: (locker) => {
      return lockerAPI().shareLocker(
        locker.buildingNumber,
        locker.floorNumber,
        locker.lockerNumber,
        sharedWith,
      );
    },
    onSuccess: shareLockerData => {
      if (!shareLockerData) {
        return;
      }

      console.log('[ShareLocker] shareLockerData.data: ', shareLockerData);

      const data = shareLockerData.data;

      if (data.success) {
        Toast.show({
          type: 'success',
          text1: '성공',
          text2: data?.message,
        });
        props.navigation.navigate('Home', {refresh: true});
      }
    },
    onError(error: IServerErrorResponse<string>) {
      Toast.show({
        type: 'error',
        text2: error.response.data.message
      });
    },
  });

  const onButtonPressed = useCallback(() => {
    if(typeof selectedLocker === 'undefined') return;

    shareMutation.mutate(selectedLocker);
  }, [shareMutation, selectedLocker]);

  const getSharedUserList = useCallback(() => {
    if(typeof selectedLocker === 'undefined') return null;

    return selectedLocker.sharedWithUsers?.map((user) => {
      return (
        <View key={user.userId}>
          <Text>{`${user.nickname} (${user.userId})`}</Text>
          <Divider />
        </View>
      )
    });
  }, [selectedLocker]);

  return (
    <ScrollView
      style={{
        padding: 16,
      }}>
      <View
        style={{
          gap: 16,
        }}>
        <View
          style={{
            marginTop: 64,
            marginBottom: 16,
            gap: 8,
          }}>
          <Text variant="titleLarge" style={{fontWeight: 'bold'}}>
            공유자 추가
          </Text>
          {
            typeof selectedLocker === 'undefined' ? (
              <Text>보관함을 선택하세요.</Text>
            ) : (
              selectedLocker.owned ? (
                  <View style={{
                    gap: 16,
                  }}>
                    <Text variant="titleSmall">{selectedLocker.buildingName} {selectedLocker.floorNumber}층 {selectedLocker.lockerNumber}번 보관함을 함께 공유할 수 있습니다.</Text>
                    <View
                      style={{
                        gap: 14,
                      }}>
                      <TextInput
                        placeholder="공유자 아이디를 입력하세요"
                        onChangeText={newText => setSharedWith(newText)}
                        mode="outlined"
                      />
                      <Button mode="contained-tonal" onPress={() => onButtonPressed()}>
                        등록
                      </Button>
                    </View>
                  </View>
              ) : (
                <Text variant="titleSmall">소유중인 보관함만 공유할 수 있습니다.</Text>
              )
              
            )
          }
          
        </View>

        <Text variant="titleLarge" style={{fontWeight: 'bold'}}>
            공유자 목록
        </Text>
        {
          typeof selectedLocker === 'undefined' ? (
            <Text>보관함을 선택하세요.</Text>
          ) : (
            <Text variant="titleSmall">{selectedLocker.buildingName} {selectedLocker.floorNumber}층 {selectedLocker.lockerNumber}번 보관함의 공유 현황입니다.</Text>
          )
        }
        <View style={{
          gap: 14
        }}>
          {getSharedUserList()}
        </View>
      </View>
    </ScrollView>
  );
}
