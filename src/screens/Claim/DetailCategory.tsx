import { useRef } from 'react';
import Step from '@/components/Step';
import {ClaimStackScreenProps} from '@/navigation/types';
import {useQuery} from '@tanstack/react-query';
import lockerAPI from '@/network/locker/api';
import { ILockerList } from '@/types/api/locker';
import { StackActions } from '@react-navigation/native';
import Locker from '@/components/Locker';

export default function DetailCategory({
  route,
  navigation,
}: ClaimStackScreenProps<'Detail'>) {
  const {buildingSelection, floorSelection} = route.params;
  const {data, refetch} = useQuery<ILockerList>(['lockers', buildingSelection, floorSelection], () =>
    lockerAPI().lockers(buildingSelection.buildingNumber, floorSelection),
  );

  const refresh = async() => {
    refetch()
  }

  const onDismiss = () => {
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('Home', { refresh: true });
  }

  return (
    <Step 
      title="보관함 번호를 선택하세요"
      breadcrumbs={[buildingSelection.buildingName, `${floorSelection.toString()}층`]}
      onRefresh={refresh}
    >
      {
        data?.data.value?.map(locker => <Locker key={locker.lockerNumber} lockerInfo={locker} dismiss={onDismiss}/>)
      }
    </Step>
  );
}
