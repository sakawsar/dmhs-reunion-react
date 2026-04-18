import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { syncToGoogleSheets } from './googleSheetsService';
import type { FormData } from '../components/types';

export interface RegistrationPayload {
    formData: FormData;
    ticketId: string;
    packageName: string;
    totalAmount: number;
}

/**
 * Saves a completed reunion registration to Firestore.
 * Returns the Firestore document ID on success.
 */
export async function saveRegistration(
    payload: RegistrationPayload,
): Promise<string> {
    const { formData, ticketId, packageName, totalAmount } = payload;

    const docRef = await addDoc(collection(db, 'registrations'), {
        // Ticket meta
        ticketId,
        packageName,
        totalAmount,
        status: 'pending_verification',

        // Personal info
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        batchYear: formData.batchYear,
        section: formData.section || null,
        phone: formData.phone,
        email: formData.email || null,
        currentCity: formData.currentCity,
        profession: formData.profession || null,
        bloodGroup: formData.bloodGroup || null,
        tshirtSize: formData.tshirtSize || null,

        // Attendance
        guests: formData.guests,

        // Payment
        paymentMethod: formData.paymentMethod,
        paymentTxId: formData.paymentTxId,
        paymentSenderPhone: formData.paymentSenderPhone,

        // Timestamps
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    // Fire-and-forget: sync to Google Sheets for finance tracking
    syncToGoogleSheets({ formData, ticketId, packageName, totalAmount }).catch(() => {});

    return docRef.id;
}
