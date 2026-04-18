import type { FormData } from '../components/types';

interface SheetsPayload {
    formData: FormData;
    ticketId: string;
    packageName: string;
    totalAmount: number;
}

const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBAPP_URL as string | undefined;

/**
 * Syncs a registration record to Google Sheets via the deployed Apps Script Web App.
 * This is fire-and-forget — failures are logged but never thrown,
 * so the primary Firestore save is never affected.
 */
export async function syncToGoogleSheets(payload: SheetsPayload): Promise<void> {
    if (!SHEETS_URL) {
        console.warn('[Google Sheets] VITE_GOOGLE_SHEETS_WEBAPP_URL not set — skipping sync.');
        return;
    }

    const { formData, ticketId, packageName, totalAmount } = payload;

    const body = {
        ticketId,
        fullName: formData.fullName,
        batchYear: formData.batchYear,
        section: formData.section || '',
        phone: formData.phone,
        email: formData.email || '',
        currentCity: formData.currentCity,
        profession: formData.profession || '',
        packageName,
        guests: formData.guests,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        paymentTxId: formData.paymentTxId,
        paymentSenderPhone: formData.paymentSenderPhone,
        status: 'pending_verification',
        submittedAt: new Date().toISOString(),
    };

    try {
        // Google Apps Script Web Apps redirect POSTs through Google's servers.
        // mode: 'no-cors' lets the browser follow these redirects silently.
        // We can't read the response in no-cors mode, but that's fine for
        // fire-and-forget — the row still gets appended.
        await fetch(SHEETS_URL, {
            method: 'POST',
            body: JSON.stringify(body),
            redirect: 'follow',
            mode: 'no-cors',
        });
    } catch (err) {
        console.warn('[Google Sheets] Sync failed (non-blocking):', err);
    }
}
