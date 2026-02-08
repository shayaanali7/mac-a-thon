import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

if (!admin.apps.length) {
    // In development: read from serviceAccountKey.json
    if (process.env.NODE_ENV !== 'production') {
        const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json');
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
    } else {
        // In production: use environment variables
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
    }
}

export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
export default admin;