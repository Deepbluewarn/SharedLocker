import Layout from "@/components/Layout";
import { SettingStackParamList, SettingStackScreenProps } from "@/navigation/types";
import authAPI from "@/network/auth/api";
import { ILogout } from "@/types/api/auth";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import { Appbar, Button, Text } from "react-native-paper";
import { Profile } from "./Profile";
import LockerManagement from "./LockerManagement";
import UpdateNickname from "./UpdateNickname";

export default function Settings(props: SettingStackScreenProps<'Settings'>) {
  const { refetch } = useQuery<ILogout>(['auth'], () => authAPI().signOut(), {
    enabled: false,
    retry: false,
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
