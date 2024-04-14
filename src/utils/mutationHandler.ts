import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";

export const mutationSuccessHandler = (data: any) => {
    const _data = data.data;

    if (_data.success) {
        Toast.show({
            type: 'success',
            text2: _data?.message,
        });
    }
}
export const mutationErrorHandler = (error: unknown) => {
    if (isAxiosError(error)) {
        const _data = error.response?.data;

        Toast.show({
            type: 'error',
            text2: _data?.message,
        });
    } else if (error instanceof Error) {
        Toast.show({
            type: 'error',
            text2: error.message,
        });
    } else {
        Toast.show({
            type: 'error',
            text2: '알 수 없는 오류가 발생했습니다.',
        });
    }
}