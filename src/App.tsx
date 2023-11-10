import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Intro from './screens/Intro';
import { PaperProvider, configureFonts } from 'react-native-paper';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const msg = query.meta ? query.meta.errorMessage as string : '';

      console.log('[QueryClient] error: ', error);

      Toast.show({
        type: 'error',
        text1: '문제가 발생했습니다.',
        text2: msg
      });
    }
  }),
})

export default function App(): JSX.Element {
  useEffect(() => {
    console.log('[App] started');
  })
  const baseFont = {
    fontFamily: 'PretendardVariable',
  }

  const baseVariants = configureFonts({ config: baseFont });

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={{
          fonts: baseVariants
        }}>
          <Intro />
        </PaperProvider>
      </QueryClientProvider>
      <Toast />
    </>
  );
}
