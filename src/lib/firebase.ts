import * as admin from 'firebase-admin';

const serviceAccountUser = require('../../serviceAccountKeyUser.json')
const serviceAccountSeller = require('../../serviceAccountKeySeller')

const userFirebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountUser),
}, 'user')

const sellerFirebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountSeller),
}, 'seller')

export const userAuth = userFirebase.auth()
export const sellerAuth = sellerFirebase.auth()