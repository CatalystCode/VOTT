import { ActionTypes } from "./actionTypes";
import { IPayloadAction, createPayloadAction, createAction } from "./actionCreators";
import { IAuth } from "../../models/applicationState";
import { Dispatch, Action } from "redux";
import { IpcRendererProxy } from "../../common/ipcRendererProxy";

/**
 * Actions which manage users auth
 * @member signIn - Allows to sign in to the application
 * @member signOut - Allows to sign out from the application
 */
export default interface IAuthActions {
    signIn(accessToken: IAuth): Promise<void>;
    signOut(): Promise<void>;
}

/**
 * Sign in to the application
 * @param accessToken - Auth to the application
 */
<<<<<<< HEAD
export function signIn(auth: IAuth): (disptach: Dispatch) => Promise<void> {
||||||| parent of 956f99c... login appears when user not logged, token correctly received
export function signIn(accessToken: string): (disptach: Dispatch) => Promise<void> {
=======
export function signIn(accessToken: string): (dispatch: Dispatch) => Promise<void> {
>>>>>>> 956f99c... login appears when user not logged, token correctly received
    return (dispatch: Dispatch) => {
        return IpcRendererProxy.send("SIGN_IN", auth)
        .then(() => {
            dispatch(signInAction(auth));
        });
    };
}

/**
 * Sign out from the application
 */
export function signOut(): (dispatch: Dispatch) => Promise<void> {
    return (dispatch: Dispatch) => {
        return IpcRendererProxy.send("SIGN_OUT")
        .then(() => {
            dispatch(signOutAction());
        });
    };
}

/**
 * Sign in action type
 */
export interface ISignInAction extends IPayloadAction<string, IAuth> {
    type: ActionTypes.SIGN_IN_SUCCESS;
}

/**
 * Sign out action type
 */
export interface ISignOutAction extends Action<string> {
    type: ActionTypes.SIGN_OUT_SUCCESS;
}

/**
 * Instance of sign in action
 */
export const signInAction = createPayloadAction<ISignInAction>(ActionTypes.SIGN_IN_SUCCESS);
/**
 * Instance of sign out action
 */
export const signOutAction = createAction<ISignOutAction>(ActionTypes.SIGN_OUT_SUCCESS);
