import {useCallback} from 'react';
import Step from '@/components/Step';
import {Button, Surface, Text} from 'react-native-paper';
import {ClaimStackScreenProps} from '@/navigation/types';
import {useQuery} from '@tanstack/react-query';
import lockerAPI from '@/network/locker/api';
import { Building, ILockerBuildingList } from '@/types/api/locker';

export default function MainCategory({
  navigation,
}: ClaimStackScreenProps<'Main'>) {
  const {data} = useQuery<ILockerBuildingList>(['buildings'], () => lockerAPI().buildings());

  const onButtonPressed = useCallback(
    (buildingSelection: Building) => {
      navigation.navigate('Sub', { buildingSelection });
    },
    [navigation],
  );

  const buildingList = useCallback(() => {
    if (!data) {
      return [];
    }

    const value = data.data.value;

    if (!value) {
      return <Text>건물 목록이 없습니다.</Text>
    }

    return value.map(e => (
      <Button key={e.buildingNumber} mode="contained" onPress={() => onButtonPressed(e)}>
        {e.buildingName}
      </Button>
    ));
  }, [data, onButtonPressed]);

  return (
    <Step
      title="건물을 선택하세요"
      subTitle="신청하고자 하는 보관함의 건물 위치를 선택하세요">
      <Surface
        elevation={0}
        style={{
          gap: 18,
        }}>
        {buildingList()}
      </Surface>
    </Step>
  );
}
