import { RootStackScreenProps } from '@/navigation/types';
import authAPI from '@/network/auth/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

interface IFormInput {
  id: string;
  password: string;
}
export default function Login(
  props: RootStackScreenProps<'Login'>,
): JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<IFormInput>({
    defaultValues: {
      id: '',
      password: '',
    },
    mode: 'onChange',
  });
  const id = useWatch({ control, name: 'id' });
  const password = useWatch({ control, name: 'password' });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => refetch();

  const { refetch } = useQuery(['auth'], () => authAPI().signIn(id, password), {
    enabled: false,
    retry: false,
  });

  return (
    <ScrollView
      style={{
        padding: 16,
      }}>
      <View
        style={{
          gap: 16,
        }}>
        <View
          style={{
            marginTop: 64,
            marginBottom: 16,
          }}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
            로그인
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Text variant="titleSmall">계정이 없으신가요?</Text>
            <Button
              onPress={() => {
                props.navigation.navigate('Register')
              }}
            >
              회원 가입
            </Button>
          </View>
        </View>
        <View
          style={{
            gap: 10,
          }}>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={'아이디'}
                placeholder="아이디"
                value={value}
                onChangeText={onChange}
              />
            )}
            name="id"
            rules={{ required: '아이디를 입력하세요.' }}
          />
          {errors.id && <HelperText type='error'>{errors.id.message}</HelperText>}
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={'비밀번호'}
                placeholder="비밀번호"
                secureTextEntry={true}
                value={value}
                onChangeText={onChange}
              />
            )}
            name="password"
            rules={{ required: '비밀번호를 입력하세요.' }}
          />
          {errors.password && <HelperText type='error'>{errors.password.message}</HelperText>}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
        </View>

        <View>
          <Button
            mode="contained-tonal"
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || !isValid}
          >
            로그인
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
