import Locker from "@/components/Locker";
import { HomeTabScreenProps } from "@/navigation/types";
import lockerAPI from "@/network/locker/api";
import { ILockerSearchByItem } from "@/types/api/locker";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Button, Divider, Text, TextInput } from "react-native-paper";

export default function SearchLocker(
    props: HomeTabScreenProps<'SearchLocker'>,
): JSX.Element {
    const [ query, setQuery ] = useState('');
    const [lockerKey, setLockerKey] = useState(Date.now)
    const [refreshing, setRefreshing] = useState(false);
    const { data, refetch } = useQuery<ILockerSearchByItem>(
        ['lockersByItem', query], 
        () => lockerAPI().searchLockerByItem(query),
        {
            enabled: false,
        }
    );
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            refetch()
            setLockerKey(Date.now);
        } finally {
            setRefreshing(false);
        }
    };
    
    const value = data?.data.value;

    const searchBtnPressed = () => {
        if (!query || query.trim() === '') {
            return;
        }

        refetch()
    }

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            style={{
                padding: 16,
            }}>
            <View
                style={{
                    gap: 16,
                    paddingBottom: 10
                }}>
                <View
                    style={{
                        marginTop: 64,
                        marginBottom: 16,
                        gap: 8,
                    }}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                        보관함 검색
                    </Text>
                    <Text variant="titleSmall">{'원하는 물품을 찾을 수 있습니다.'}</Text>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8}}>
                    <TextInput
                        label="검색어"
                        value={query}
                        onChangeText={text => setQuery(text)}
                        mode="outlined"
                        style={{
                            flex: 1
                        }}
                    />
                    <Button onPress={searchBtnPressed} mode="contained">검색</Button>
                </View>

                <Divider />

                {
                    value?.map(locker => <Locker key={`${locker.buildingNumber}-${locker.floorNumber}-${locker.lockerNumber}-${lockerKey}`} lockerInfo={locker} dismiss={() => {}}/>)
                }

            </View>
        </ScrollView>
    )
}
