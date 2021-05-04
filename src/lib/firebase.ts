import * as admin from 'firebase-admin';

const userFirebase = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY_USER || '{}')),
}, 'user')

const sellerFirebase = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY_SELLER || '{}')),
}, 'seller')

export const userAuth = userFirebase.auth()
export const userMessaging = userFirebase.messaging()
export const sellerAuth = sellerFirebase.auth()