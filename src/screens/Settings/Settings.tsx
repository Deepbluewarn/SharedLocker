import Layout from "@/components/Layout";
import { SettingStackParamList, SettingStackScreenProps } from "@/navigation/types";
import authAPI from "@/network/auth/api";
import { IDelete, ILogout } from "@/types/api/auth";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { Appbar, Button, Text } from "react-native-paper";
import { Profile } from "./Profile";
import LockerManagement from "./LockerManagement";
import Toast from "react-native-toast-message";
import { IServerErrorResponse } from "@/types/api";
import UpdateNickname from "./UpdateNickname";

export default function Settings(props: SettingStackScreenProps<'Settings'>) {
  const queryClient = useQueryClient();
  const removeCache = () => {
    queryClient.setQueryData(['auth'], null);
  };
  const { refetch } = useQuery<ILogout>(['auth'], () => authAPI().signOut(), {
    enabled: false,
    retry: false,
  });

  const deleteMutation = useMutation<IDelete, IServerErrorResponse<string>>({
    mutationFn: () => {
      return authAPI().deleteAccount();
    },
    onSuccess: deleteData => {
      if (!deleteData) {
        return;
      }

      const _data = deleteData.data;

      if (_data.success) {
        removeCache();
        
        Toast.show({
          type: 'success',
          text1: '성공',
          text2: _data?.message,
        });
      }
    },
    onError(error: IServerErrorResponse<string>) {
      console.log('error.response.data.message: ', error.response.data.message)
      Toast.show({
        type: 'error',
        text2: error.response.data.message
      });
    },
  });

  const beforeLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            refetch();
          },
        },
      ],
    )
  }

  const beforeQuit = () => {
    Alert.alert(
      '회원 탈퇴',
      '회원 탈퇴 하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            deleteMutation.mutate()
          },
        },
      ],
    )
  }
  
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="설정" />
      </Appbar.Header>
      <Layout>
        <Button mode="contained" onPress={() => { props.navigation.navigate('Profile') }}>회원 정보</Button>
        <Button mode="contained" onPress={() => { props.navigation.navigate('LockerManagement') }}>보관함 관리</Button>
        <Button
          mode='contained-tonal'
          onPress={() => { beforeLogout() }}
          buttonColor="#db4455"
        >
          로그아웃
        </Button>

        <Button
          mode='contained-tonal'
          onPress={() => { beforeQuit() }}
          buttonColor="#db4455"
        >
          회원 탈퇴
        </Button>
      </Layout>
    </>
  )
}

export function SettingStack(): JSX.Element {
  const Stack = createNativeStackNavigator<SettingStackParamList>();

  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen name='Settings' component={Settings} options={{headerShown: false}}/>
      <Stack.Screen name='Profile' component={Profile} options={{headerShown: false}} />
      <Stack.Screen name='LockerManagement' component={LockerManagement} options={{headerShown: false}} />
      <Stack.Screen name='UpdateNickname' component={UpdateNickname} options={{headerShown: false}} />
    </Stack.Navigator>
  )
}
