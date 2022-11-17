import {IUser} from "../IUser";

export interface AuthResponse { //после логина регистрации и рефреша возврашает обьект
    accessToken: string;
    refreshToken: string;
    user: IUser; //юзер ДТО
}
