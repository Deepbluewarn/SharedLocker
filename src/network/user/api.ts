import {axiosInstance} from '../client';
import { IUser, IUserNicknameUpdate, IUsersLocker, IUsersSharedLocker } from '@/types/api/user';

const userAPI = () => ({
  user: (): Promise<IUser> => {
    return axiosInstance.get('/api/user');
  },
  locker: (): Promise<IUsersLocker> => {
    return axiosInstance.get('/api/user/locker');
  },
  sharedLocker: (): Promise<IUsersSharedLocker> => {
    return axiosInstance.get('/api/user/sharedLocker');
  },
  updateNickname: (nickname: string): Promise<IUserNicknameUpdate> => {
    return axiosInstance.post('/api/user/nickname', { nickname });
  }
});

export default userAPI;
