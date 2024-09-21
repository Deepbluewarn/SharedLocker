import React from 'react';
import {ScrollView, View} from 'react-native';
import {Text} from 'react-native-paper';

export default function Step(props: {
  title: string;
  subTitle?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <ScrollView
      style={{
        
      }}>
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
          <Text variant="titleSmall">{props.subTitle}</Text>
        </View>
        {props.children}
      </View>
    </ScrollView>
  );
}
