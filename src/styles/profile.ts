import { StyleSheet } from "react-native";

export const ProfileStyles = StyleSheet.create({
    profileContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    profile: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    username: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    nickname: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userId: {
        fontSize: 14,
        color: 'gray'
    },
    email: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        color: 'gray',
    },
    registerDateCard: {
        margin: 4,
    },
    registerDateCardContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
    },
    registerDateCardSubTitle: {
        fontWeight: 'bold',
    }
})