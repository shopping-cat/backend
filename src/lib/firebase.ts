import * as admin from 'firebase-admin';

const userFirebase = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY_USER as string)),
}, 'user')

const sellerFirebase = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY_SELLER as string)),
}, 'seller')

export const userAuth = userFirebase.auth()
export const sellerAuth = sellerFirebase.auth()