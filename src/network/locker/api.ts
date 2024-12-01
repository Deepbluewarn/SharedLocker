import { ILockerBuildingList, ILockerFloorList, ILocker, ILockerCancel, ILockerList, ILockerRequestShare, ILockerShare, ILockerSearchByItem } from '@/types/api/locker';
import {axiosInstance} from '../client';

const lockerAPI = () => ({
  buildings: (): Promise<ILockerBuildingList> => {
    return axiosInstance.get('/api/locker/building');
  },
  floors: (buildingNumber: number): Promise<ILockerFloorList> => {
    return axiosInstance.get('/api/locker/floor', {
      params: {buildingNumber},
    });
  },
  lockers: (buildingNumber: number, floor: number): Promise<ILockerList> => {
    return axiosInstance.get('/api/lockers', {
      params: {buildingNumber, floor},
    });
  },
  claimLockers: (
    buildingNumber: number,
    floorNumber: number,
    lockerNumber: number,
  ): Promise<ILocker> => {
    return axiosInstance.post('/api/locker', {
      buildingNumber,
      floorNumber,
      lockerNumber,
    });
  },
  shareLocker: (
    buildingNumber: number,
    floorNumber: number,
    lockerNumber: number,
    sharedWith: string,
  ): Promise<ILockerShare> => {
    return axiosInstance.post('/api/locker/share', {
      buildingNumber: buildingNumber,
      floorNumber: floorNumber,
      lockerNumber: lockerNumber,
      sharedWith: sharedWith,
    });
  },
  requestShareLocker: (
    buildingNumber: number,
    floorNumber: number,
    lockerNumber: number,
  ): Promise<ILockerRequestShare> => {
    return axiosInstance.post('/api/locker/request-share', {
      buildingNumber,
      floorNumber,
      lockerNumber,
    });
  },
  cancelLocker: (
    buildingNumber: number,
    floorNumber: number,
    lockerNumber: number,
    isOwner: boolean,
    assigneeTo: string,
  ): Promise<ILockerCancel> => {
    return axiosInstance.post('/api/locker/cancel', {
      buildingNumber,
      floorNumber,
      lockerNumber,
      isOwner,
      assigneeTo,
    });
  },
  searchLockerByItem: (query: string): Promise<ILockerSearchByItem> => {
    return axiosInstance.get('/api/locker/search/item', {
      params: { query },
    })
  }
});

export default lockerAPI;
