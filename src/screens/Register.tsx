import { RootStackScreenProps } from '@/navigation/types';
import authAPI from '@/network/auth/api';
import { mutationErrorHandler, mutationSuccessHandler } from '@/utils/mutationHandler';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { Button, Checkbox, HelperText, Text, TextInput } from 'react-native-paper';

interface IFormInput {
  id: string;
  password: string;
  passwordCheck: string;
  name: string;
  checkTerms: boolean;
}
export default function Register(
  props: RootStackScreenProps<'Register'>,
): JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<IFormInput>({
    defaultValues: {
      id: '',
      password: '',
      passwordCheck: '',
      name: '',
      checkTerms: false,
    },
    mode: 'onChange',
  });
  const id = useWatch({ control, name: 'id' });
  const password = useWatch({ control, name: 'password' });
  const name = useWatch({ control, name: 'name' });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    mutation.mutate();
  }

  const mutation = useMutation({
    mutationFn: () => {
      return authAPI().signUp(id, password, name);
    },
    onSuccess: data => () => {
      mutationSuccessHandler(data)
      props.navigation.navigate('Main');
    },
    onError: error => mutationErrorHandler
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
            gap: 8,
          }}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
            새로운 계정 생성
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Text variant="titleSmall">이미 계정이 있으신가요?</Text>
            <Button
              onPress={() => {
                props.navigation.navigate('Login')
              }}
            >
              로그인
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
                label={'이름'}
                placeholder="이름"
                value={value}
                onChangeText={onChange}
              />
            )}
            name="name"
            rules={{ required: '이름을 입력하세요.' }}
          />
          {errors.name && <HelperText type='error'>{errors.name.message}</HelperText>}

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
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={'비밀번호 재입력'}
                placeholder="비밀번호 재입력"
                secureTextEntry={true}
                value={value}
                onChangeText={onChange}
              />
            )}
            name="passwordCheck"
            rules={{
              required: '비밀번호를 한번 더 입력하세요.',
              validate: (value) => value === password || '비밀번호가 일치하지 않습니다.'
            }}
          />
          {errors.passwordCheck && <HelperText type='error'>{errors.passwordCheck.message}</HelperText>}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                status={value ? 'checked' : 'unchecked'}
                onPress={() => onChange(!value)}
              />
            )}
            name="checkTerms"
            rules={{ required: '이용약관에 동의해주세요.' }}
          />
          <Text>이용약관에 동의합니다.</Text>
        </View>

        <View>
          <Button
            mode="contained-tonal"
            disabled={!isValid || !isDirty}
            onPress={handleSubmit(onSubmit)}>
            회원가입
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
