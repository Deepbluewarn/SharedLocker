import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";

export default function Layout(props: {
  children: React.ReactNode,
  title?: string,
  subTitle?: string
}): JSX.Element {
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
            {props.title}
          </Text>
          <Text variant="titleSmall">{props.subTitle}</Text>
          {props.children}
        </View>
      </View>
    </ScrollView>
  );
}