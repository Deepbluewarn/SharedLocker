import Layout from "@/components/Layout";
import { SettingStackScreenProps } from "@/navigation/types";
import userAPI from "@/network/user/api";
import { IUser } from "@/types/api/user";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Card, Text } from "react-native-paper";
import { View } from 'react-native';
import { ProfileStyles } from "@/styles/profile";

export function Profile(props: SettingStackScreenProps<'Profile'>): JSX.Element {
  const {
    data: userData,
    isError
  } = useQuery<IUser>(['user'], () => userAPI().user());

  const admins = userData?.data?.value.admin;

  if (isError) {
    return (
      <Layout title="회원 등록 정보">
        <Text>회원 정보를 가져올 수 없습니다.</Text>
      </Layout>
    );
  }

  const userDataValue = userData?.data?.value;
  const dateStr = new Intl.DateTimeFormat('ko',
    { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(userDataValue.createdAt));

  return (
    <Layout title="회원 정보">
      <View style={[ ProfileStyles.profileContainer ]}>
        <View style={[ProfileStyles.profile]}>
          <Avatar.Text size={55} label={userDataValue.nickname[0]} />

          <View>
            <View style={[ProfileStyles.username]}>
              <Text style={[ProfileStyles.nickname]}>{userDataValue.nickname}</Text>
              <Text style={[ProfileStyles.userId]}>({userDataValue.userId})</Text>
            </View>
            <View style={[ProfileStyles.email]}>
              <Text>{userDataValue.email}</Text>
            </View>
          </View>
        </View>
        <Button mode="contained" onPress={() => {
          props.navigation.navigate('UpdateNickname')
        }}>수정</Button>
      </View>



      <Card mode='contained' style={[ProfileStyles.registerDateCard]}>
        <View style={[ProfileStyles.registerDateCardContainer]}>
          <View>
            <Text variant="titleMedium" style={[ProfileStyles.registerDateCardSubTitle]}>가입일</Text>
            <Text>{dateStr}</Text>
          </View>
          {
            admins && (
              <View>
                <Text variant="titleMedium" style={[ProfileStyles.registerDateCardSubTitle]}>관리자 권한</Text>
                <Text>{admins.role}</Text>
              </View>

            )
          }
        </View>

      </Card>

    </Layout>
  );
}
