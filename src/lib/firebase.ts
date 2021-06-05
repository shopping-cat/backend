import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config()

const catUserFirebase = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY_USER_CAT as string)),
}, 'catUser')

const dogUserFirebase = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY_USER_DOG as string)),
}, 'dogUser')

const sellerFirebase = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY_SELLER as string)),
}, 'seller')

export const catUserAuth = catUserFirebase.auth()
export const dogUserAuth = dogUserFirebase.auth()
export const sellerAuth = sellerFirebase.auth()

export const catMessaging = catUserFirebase.messaging()
export const dogMessaging = dogUserFirebase.messaging()