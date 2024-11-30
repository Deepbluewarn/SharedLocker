import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function Step(props: {
  title: string;
  subTitle?: string;
  breadcrumbs?: string[];
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}): JSX.Element {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (props.onRefresh) {
        await props.onRefresh();
      }
    } finally {
      setRefreshing(false);
    }
  }, [props.onRefresh]);
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View
        style={{
          gap: 16,
          padding: 16,
        }}>
        <View
          style={{
            marginTop: 64,
            marginBottom: 16,
            gap: 4,
          }}>
          <Text variant="titleLarge" style={{fontWeight: 'bold'}}>
            {props.title}
          </Text>
          {
            props.breadcrumbs ? (
              <View style={{
                display: 'flex',
                flexDirection: 'row',
              }}>
                {
                  props.breadcrumbs.map((b, idx) => {
                    return (
                      <Text variant='titleMedium'>{b}{idx === props.breadcrumbs!.length - 1 ? '' : '/'}</Text>
                    )
                  })
                }
              </View>
            ) : null
          }
          <Text variant="titleSmall">{props.subTitle}</Text>
        </View>
        {props.children}
      </View>
    </ScrollView>
  );
}
