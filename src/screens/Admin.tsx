import authAPI from "@/network/auth/api";
import userAPI from "@/network/user/api";
import { DropdownStyles } from "@/styles/dropdown";
import { IQrKey } from "@/types/api/auth";
import { ISimpleLockerInfo, Locker } from "@/types/api/locker";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Card, Text } from "react-native-paper";
import { QrCodeSvg } from "react-native-qr-svg";

interface DropdownItem {
    label: any;
    value: any;
}
export default function Admin(): JSX.Element {
    const [selBuildingNumber, setSelBuildingNumber] = useState<number>();
    const { data: userData } = useQuery(['user'], () => userAPI().user());
    const [assignedBuildingList, setAssignedBuildingList] = useState<DropdownItem[]>([]);

    // 건물 별 보관함 리스트 맵
    const [lockerListMap, setLockerListMap] = useState<Map<number, ISimpleLockerInfo[]>>(new Map());

    // 선택된 건물의 보관함 목록
    const [lockerList, setLockerList] = useState<ISimpleLockerInfo[]>([]);

    // 선택한 보관함
    const [selLocker, setSelLocker] = useState<ISimpleLockerInfo>();

    const { data: qrKeyData } = useQuery<IQrKey>(
        ['qrKey'],
        () => authAPI().qrKey(),
        {
            enabled: userData?.data.value?.assignedLocker?.length! > 0,
            refetchInterval: (data, query) => {
                if (!data || !data.data.success || !data.data.value) return false;

                const value = data.data.value;
                const currentTime = new Date().getTime();
                const expiresIn = value.expiredAt - currentTime;

                return expiresIn;
            }
        }
    );

    useEffect(() => {
        const res: any[] = [];

        const assignedLockerList = userData?.data.value.assignedLocker;

        if (!assignedLockerList) {
            return;
        }

        if (!Array.isArray(assignedLockerList)) {
            return;
        }

        setAssignedBuildingList(assignedLockerList.map((locker) => {
            return {
                label: locker.buildingName,
                value: locker.buildingNumber
            }
        }));

        const newMap = new Map<number, ISimpleLockerInfo[]>();

        assignedLockerList.forEach((locker) => {
            if (!locker.buildingName) {
                return;
            }

            newMap.set(locker.buildingNumber, locker.lockers);
        });

        setLockerListMap(newMap);

    }, [userData])

    useEffect(() => {
        if (!selBuildingNumber) return;

        setLockerList(lockerListMap.get(selBuildingNumber) || []);
    }, [lockerListMap, selBuildingNumber])

    const getlockerList = useCallback(() => {
        const res: DropdownItem[] = [];

        lockerList.forEach((locker) => {
            res.push({
                label: `${locker.floorNumber}층 ${locker.lockerNumber}번`,
                value: `${selBuildingNumber} ${locker.floorNumber} ${locker.lockerNumber}`
            });
        });

        return res;
    }, [lockerList, selBuildingNumber])

    const generateQRCode = useCallback(() => {
        if (!selLocker) return;
        if (!qrKeyData?.data.value) return;

        return `${qrKeyData?.data.value?.key} ${selLocker}`
    }, [qrKeyData, selLocker])

    return (
        <ScrollView>
            <View
                style={{
                    margin: 16,
                    gap: 16,
                }}>
                <View
                    style={{
                        marginTop: 64,
                        marginBottom: 16,
                        gap: 10,
                    }}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                        마스터 키
                    </Text>
                    <Text variant="titleSmall">
                        마스터 키를 사용하여 보관함을 열 수 있습니다.
                    </Text>

                    <Card style={{
                        padding: 8
                    }}>
                        <Card.Title title="마스터 키 QR 코드" />
                        <Card.Content>
                            <View
                                style={{
                                    margin: 16,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                {
                                    generateQRCode() ? (
                                        <QrCodeSvg
                                            value={generateQRCode()!}
                                            frameSize={200}
                                            backgroundColor='#00000000'
                                            contentCells={5}
                                        />
                                    ) : <Text>보관함을 선택하세요.</Text>
                                }
                            </View>
                        </Card.Content>
                    </Card>

                    <Text variant="titleSmall">
                        관리 건물을 선택하세요.
                    </Text>

                    <Dropdown
                        style={DropdownStyles.dropdown}
                        placeholderStyle={DropdownStyles.placeholderStyle}
                        selectedTextStyle={DropdownStyles.selectedTextStyle}
                        inputSearchStyle={DropdownStyles.inputSearchStyle}
                        iconStyle={DropdownStyles.iconStyle}
                        placeholder={'관리 건물을 선택하세요'}
                        data={assignedBuildingList}
                        labelField="label"
                        valueField="value"
                        value={selBuildingNumber}
                        onChange={(item: any) => {
                            setSelBuildingNumber(item.value);
                        }}
                    />

                    <Text variant="titleSmall">
                        보관함을 선택하세요.
                    </Text>

                    <Dropdown
                        style={DropdownStyles.dropdown}
                        placeholderStyle={DropdownStyles.placeholderStyle}
                        selectedTextStyle={DropdownStyles.selectedTextStyle}
                        inputSearchStyle={DropdownStyles.inputSearchStyle}
                        iconStyle={DropdownStyles.iconStyle}
                        placeholder={'사물함 선택'}
                        data={getlockerList()}
                        labelField="label"
                        valueField="value"
                        value={selLocker}
                        onChange={(item: any) => {
                            setSelLocker(item.value);
                        }}
                    />


                </View>
            </View>
        </ScrollView>
    )

    return (
        <View style={{
            margin: 20,
        }}>
            <Text>관리자 페이지입니다.</Text>
            
        </View>
    )
}
