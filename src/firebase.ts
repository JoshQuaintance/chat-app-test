import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebase_config from './firebase_config';

const firebaseApp = getApps().length == 0 ? initializeApp(firebase_config) : getApp();

const db = getFirestore();

export { firebaseApp, db };
