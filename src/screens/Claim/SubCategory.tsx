import {useCallback} from 'react';
import Step from '@/components/Step';
import {Button, Text} from 'react-native-paper';
import {ClaimStackScreenProps} from '@/navigation/types';
import {useQuery} from '@tanstack/react-query';
import lockerAPI from '@/network/locker/api';
import { ILockerFloorList } from '@/types/api/locker';

export default function SubCategory({
  route,
  navigation,
}: ClaimStackScreenProps<'Sub'>) {
  const {buildingSelection} = route.params;

  const {data} = useQuery<ILockerFloorList>(['buildings', buildingSelection.buildingNumber], () =>
    lockerAPI().floors(buildingSelection.buildingNumber),
  );

  const onButtonPressed = useCallback(
    (selection: number) => {
      navigation.navigate('Detail', {
        buildingSelection,
        floorSelection: selection,
      });
    },
    [buildingSelection, navigation],
  );

  const floorList = useCallback(() => {
    if (!data) {
      return [];
    }

    const value = data.data.value;
    if(!value) return <Text>층 목록을 불러오지 못했습니다.</Text>;
    const sortedData = value.sort((a, b) => a - b);

    return sortedData.map(e => (
      <Button
        key={e}
        mode="contained"
        onPress={() => onButtonPressed(e)}>{`${e}층`}</Button>
    ));
  }, [data, onButtonPressed]);

  return (
    <Step title="층수를 선택하세요" breadcrumbs={[buildingSelection.buildingName]}>
      <>
        {floorList()}
      </>
    </Step>
  );
}
