import {RootStackScreenProps} from '@/navigation/types';
import lockerAPI from '@/network/locker/api';
import {ILocker} from '@/types/locker';
import {useMutation} from '@tanstack/react-query';
import {isAxiosError} from 'axios';
import React, {useCallback, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {Button, Divider, Text, TextInput} from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function ShareLocker(
  props: RootStackScreenProps<'ShareLocker'>,
): JSX.Element {
  const selectedLocker = props.route.params;
  const [sharedWith, setSharedWith] = useState('');

  const shareMutation = useMutation({
    mutationFn: (locker: ILocker) => {
      return lockerAPI().shareLocker(
        locker.building,
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
        props.navigation.navigate('Home');
      }
    },
    onError(error) {
      if (isAxiosError(error)) {
        console.log(error.toJSON());
        Toast.show({
          type: 'error',
          text2: error.response?.data.message,
        });
      }
    },
  });

  const onButtonPressed = useCallback(() => {
    shareMutation.mutate(selectedLocker);
  }, [shareMutation, selectedLocker]);

  const getSharedUserList = useCallback(() => {
    return selectedLocker.sharedWith.map(e => {
      return (
        <>
          <Text>{e.username}</Text>
          <Divider />
        </>
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
          <Text variant="titleSmall">{selectedLocker.building} {selectedLocker.floorNumber}층 {selectedLocker.lockerNumber}번 보관함을 함께 공유할 수 있습니다.</Text>
        </View>
        <View
          style={{
            gap: 14,
          }}>
          <TextInput
            placeholder="공유자 아이디를 입력하세요"
            onChangeText={newText => setSharedWith(newText)}
          />
        </View>

        <View>
          <Button mode="contained-tonal" onPress={() => onButtonPressed()}>
            등록
          </Button>
        </View>

        <Text variant="titleLarge" style={{fontWeight: 'bold'}}>
            공유자 목록
        </Text>
        <Text variant="titleSmall">{selectedLocker.building} {selectedLocker.floorNumber}층 {selectedLocker.lockerNumber}번 보관함의 공유 현황입니다.</Text>
        <View style={{
          gap: 14
        }}>
          {getSharedUserList()}
        </View>
      </View>
    </ScrollView>
  );
}
