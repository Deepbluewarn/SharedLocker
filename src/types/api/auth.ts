import { IServerInfoResponse } from ".";
import { Locker } from "./locker";

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface QRKey {
    key: string;
    expiredAt: number;
}

export interface QRKeyPost {
    data: Locker;
}
/**
 * API Response Types
 */
// GET /auth/register/
export interface IRegister extends IServerInfoResponse<string> {}
// DELETE /auth/delete/
export interface IDelete extends IServerInfoResponse<string> {}
// POST /auth/login/
export interface ILogin extends IServerInfoResponse<string, TokenResponse> {}
// POST /auth/logout/
export interface ILogout extends IServerInfoResponse<string> {}
// POST /auth/token/
export interface IToken extends IServerInfoResponse<string, TokenResponse> {}
// POST /auth/resolve-token/
export interface IResolveToken extends IServerInfoResponse<string, TokenResponse> {}
// GET /auth/qrkey/
export interface IQrKey extends IServerInfoResponse<string, QRKey> {}
// POST /auth/qrkey/
export interface IPostQrKey extends IServerInfoResponse<string, QRKeyPost> {}
