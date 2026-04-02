import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

void firestore().settings({ persistence: true });

export const db = firestore();

export const firebaseStorage = storage();
