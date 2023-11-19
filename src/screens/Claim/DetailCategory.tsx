import { useCallback, useEffect, useRef } from 'react';
import Step from '@/components/Step';
import { Button } from 'react-native-paper';
import { ClaimStackScreenProps } from '@/navigation/types';
import { useQuery } from '@tanstack/react-query';
import lockerAPI from '@/network/locker/api';
import { ILocker, ILockers } from '@/network/locker/types';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

export default function DetailCategory({ route, navigation }: ClaimStackScreenProps<'Detail'>) {
    const { buildingSelection, floorSelection } = route.params;
    const floorRef = useRef<number>(0);
    const { data } = useQuery(['lockers', buildingSelection, floorSelection], () => lockerAPI().lockers(buildingSelection, floorSelection));
    const { data: claimData, refetch: claimRefetch } = useQuery(
        ['userLocker'],
        () => lockerAPI().claimLockers(buildingSelection, floorSelection, floorRef.current),
        {
            enabled: false
        }
    )

    const floorList = useCallback(() => {
        if (!data) return [];

        const _data: ILockers = data.data;
        const sortedData = _data.sort((a, b) => a - b);

        return (
            sortedData.map(e => <Button key={e} mode='contained' onPress={() => onButtonPressed(e)}>{`${e}번`}</Button>)
        )
    }, [data]);

    useEffect(() => {
        if(!claimData) return;

        const data = claimData.data;
        const locker : ILocker = data.locker;

        if(data.success) {
            Toast.show({
                type: 'success',
                text2: data.message
            });
            navigation.navigate('Home');
        }
    }, [claimData])
    
    const onButtonPressed = (floor: number) => {
        Alert.alert('보관함 신청', `${buildingSelection} ${floorSelection}층 ${floor}번 보관함을 신청할까요?`, [
            {
                text: '취소',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            { text: '신청', onPress: () => {
                floorRef.current = floor;
                claimRefetch();
            } },
        ]);


    }

    return (
        <Step title='보관함 번호를 선택하세요'>
            {floorList()}
        </Step>
    )
}