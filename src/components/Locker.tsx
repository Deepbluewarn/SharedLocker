import lockerAPI from '@/network/locker/api';
import { ILocker, ILockerRequestShare, LockerStatus, LockerWithStatus } from '@/types/api/locker';
import { LockerStatusAttributes, LockerStatusAttrMapper } from '@/utils/mapper';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Image, Pressable, View } from 'react-native';
import { Button, Chip, Divider, Modal, Portal, Surface, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function Locker(props: { lockerInfo: LockerWithStatus, dismiss?: () => void }) {
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [visible, setVisible] = useState(false);
  const [imageUrlState, ] = useState(Date.now);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const floorRef = useRef<number>(0);
  const claimMutation = useMutation<ILocker>({
    mutationFn: () =>
      lockerAPI().claimLockers(
        props.lockerInfo.buildingNumber,
        props.lockerInfo.floorNumber,
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
          text2: `${props.lockerInfo.buildingName} ${props.lockerInfo.floorNumber}층 ${locker.lockerNumber}번 보관함을 신청하였습니다.`,
        });

        if (props.dismiss) {
          props.dismiss();
        }
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
        props.lockerInfo.buildingNumber,
        props.lockerInfo.floorNumber,
        floorRef.current,
      ),
    onSuccess: shareRequestData => {
      const _data = shareRequestData.data;

      if (_data?.success) {
        Toast.show({
          type: 'success',
          text2: _data?.message,
        });
        if (props.dismiss) {
          props.dismiss();
        }
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
        message = `${props.lockerInfo.buildingName} ${props.lockerInfo.floorNumber}층 ${floor}번 보관함을 공유 신청할까요?`
      } else if (lockerAttr.status === LockerStatus.Empty) {
        message = `${props.lockerInfo.buildingName} ${props.lockerInfo.floorNumber}층 ${floor}번 보관함을 신청할까요?`
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
              } else if (lockerAttr.status === LockerStatus.Empty) {
                claimMutation.mutate();
              }
            },
          },
        ],
      );
    },
    [ claimMutation ],
  );

  const statusAttr = LockerStatusAttrMapper(props.lockerInfo.status);

  return (
    <Surface
      key={props.lockerInfo.lockerNumber}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: 10,
        marginLeft: 3,
        marginRight: 3,
        borderRadius: 8,
      }}
    >
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={{
          }}
          theme={{
            colors: {
              backdrop: 'rgba(0, 0, 0, .2)'
            }
          }}
        >
          <Image source={{ uri: `${modalImageUrl}?${imageUrlState}` }} style={{ width: '100%', minHeight: 300, resizeMode: 'contain' }} />
        </Modal>
      </Portal>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
        <View style={{
          width: 4,
          backgroundColor: statusAttr.color,
        }}></View>

        <View style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <View>
            <Text variant='titleSmall'>{`${props.lockerInfo.buildingName} ${props.lockerInfo.floorNumber}층`}</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row', gap: 8, flex: 1, alignItems: 'center' }}>
            <Button
              key={props.lockerInfo.lockerNumber}
              mode="outlined"
              onPress={() => onLockerButtonPressed(props.lockerInfo.lockerNumber, statusAttr)}
              disabled={statusAttr.disabled}
              style={{ flex: 1 }}
            >
              {`${props.lockerInfo.lockerNumber}번`}
            </Button>
            {
              props.lockerInfo.imageUrl ? (
                <Pressable onPress={() => { showModal(); setModalImageUrl(props.lockerInfo.imageUrl) }}>
                  <Image
                    source={{ uri: `${props.lockerInfo.imageUrl}?${imageUrlState}` }}
                    style={{
                      borderRadius: 8,
                      width: 40, height: 40, resizeMode: 'cover'
                    }}

                  />
                </Pressable>

              ) : null
            }
            <Chip
              icon='information'
              mode='outlined'
            >
              {statusAttr.statusText}
            </Chip>
          </View>

          {
            props.lockerInfo.items && props.lockerInfo.items.length > 0 ? (
              <>
                <Divider />

                <View style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {props.lockerInfo.items.map(e => <Chip key={e}>{e}</Chip>)}
                </View>
              </>
            ) : (
              null
            )
          }

        </View>
      </View>
    </Surface>
  );
}
