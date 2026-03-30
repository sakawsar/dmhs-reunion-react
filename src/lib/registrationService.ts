import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { FormData, Package } from '../components/types';

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
        status: 'pending_verification', // set to 'confirmed' after bKash is verified

        // Personal info
        fullName: formData.fullName,
        batchYear: formData.batchYear,
        section: formData.section || null,
        phone: formData.phone,
        email: formData.email || null,
        currentCity: formData.currentCity,
        profession: formData.profession || null,

        // Attendance
        seats: formData.seats,
        guestNames: formData.guestNames || null,
        dietaryPref: formData.dietaryPref,
        specialRequests: formData.specialRequests || null,

        // Payment
        bkashTxId: formData.bkashTxId,
        bkashPhone: formData.bkashPhone,

        // Timestamps
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
}

/**
 * Helper: resolve package details for a given packageId.
 */
export function resolvePackage(
    packageId: string,
    packages: Package[],
    seats: number,
): { packageName: string; totalAmount: number } {
    const pkg = packages.find(p => p.id === packageId);
    return {
        packageName: pkg ? `${pkg.name} (${pkg.icon})` : packageId,
        totalAmount: (pkg?.price ?? 0) * seats,
    };
}
