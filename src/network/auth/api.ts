import { IDelete, ILogin, ILogout, IQrKey, IRegister, IToken } from '@/types/api/auth';
import {axiosInstance} from '../client';
import {getSecureToken} from '@/utils/keychain';

const authAPI = () => ({
  signIn: (id: string, password: string): Promise<ILogin> => {
    return axiosInstance.post('/auth/login', {
      id,
      password,
    });
  },
  signOut: (): Promise<ILogout> => {
    // Authorization 헤더는 요청 인터셉터에서 정의 됨.
    return axiosInstance.post('/auth/logout', {});
  },
  signUp: (id: string, password: string, nickname: string, email: string): Promise<IRegister> => {
    return axiosInstance.post('/auth/register', {
      id,
      password,
      nickname,
      email,
    });
  },
  deleteAccount: (): Promise<IDelete> => {
    return axiosInstance.delete('/auth/delete', {});
  },
  refreshToken: async (): Promise<IToken> => {
    const token = await getSecureToken('refreshToken');

    if (!token) {
      return Promise.reject('refresh token 값이 유효하지 않습니다.');
    }

    // refresh_token 은 Authorization Header 대신 body 에 추가.
    return await axiosInstance.post('/auth/token', {
      refresh_token: token,
    });
  },
  resolveAuthorizationCode: async (code: string): Promise<IToken> => {
    return axiosInstance.post('/auth/resolve-token', {
      code,
    });
  },
  qrKey: async (): Promise<IQrKey> => {
    return axiosInstance.get('/auth/qrkey');
  }
});

export default authAPI;
