/*
Provides getters to proxy library imports.
This is used to make stubbing easier for unit tests.
*/

import * as admin from "firebase-admin";
import {cached} from "./cached";
import {Expo, ExpoPushMessage, ExpoPushToken} from "expo-server-sdk";

export const getAdmin = cached(() => admin);
export const getDb = cached(() => getAdmin().firestore());
export const getExpoInstance = cached(() => new Expo());
export const getExpo = cached(() => Expo);
