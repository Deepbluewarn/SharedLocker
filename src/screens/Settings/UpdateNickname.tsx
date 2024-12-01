import Layout from "@/components/Layout";
import userAPI from "@/network/user/api";
import { IUser, IUserNicknameUpdate } from "@/types/api/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Button, TextInput } from "react-native-paper";
import { View } from 'react-native';
import { UpdateNicknameStyles } from "@/styles/updateNickname";
import { useState } from "react";
import { IServerErrorResponse } from "@/types/api";
import Toast from "react-native-toast-message";
import { SettingStackScreenProps } from "@/navigation/types";

export default function UpdateNickname(props: SettingStackScreenProps<'UpdateNickname'>): JSX.Element {
    const {
        data: userData,
        refetch
    } = useQuery<IUser>(['user'], () => userAPI().user());

    const user = userData?.data.value
    const initialNickname = user.nickname
    const [newNickname, setNewNickname] = useState<string>(initialNickname)

    const nicknameMutation = useMutation<IUserNicknameUpdate, IServerErrorResponse<string>, string>({
        mutationFn: (nickname: string) => {
            return userAPI().updateNickname(nickname)
        },
        onSuccess: data => {
            if (!data) {
                return;
            }

            if (data.data.success) {
                Toast.show({
                    type: 'success',
                    text1: '성공',
                    text2: data.data.message,
                });

                refetch()

                props.navigation.goBack();
            }
        },
        onError(error: IServerErrorResponse<string>) {
            Toast.show({
                type: 'error',
                text2: error.response.data.message
            });
        },
    })

    

    return (
        <Layout title="닉네임 수정" subTitle="닉네임을 수정할 수 있습니다.">
            <View style={[UpdateNicknameStyles.container]}>
                <View>
                    <View style={[UpdateNicknameStyles.avatar]}>
                        <Avatar.Text size={64} label={user.nickname[0]} />
                    </View>
                    <TextInput 
                        defaultValue={user.nickname} 
                        value={newNickname} 
                        onChangeText={text => setNewNickname(text)} 
                        mode="outlined"
                    />
                </View>
                <Button 
                    mode="contained" 
                    disabled={initialNickname === newNickname}
                    onPress={() => {
                        nicknameMutation.mutate(newNickname)
                     }}
                >
                    수정
                </Button>
            </View>
        </Layout>
    )
}