import * as admin from 'firebase-admin';

const serviceAccount = require('../../serviceAccountKey.json')

const userFirebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

export const userAuth = userFirebase.auth()