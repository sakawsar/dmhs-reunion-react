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
        seats: formData.seats,
        totalAmount,
        bkashTxId: formData.bkashTxId,
        bkashPhone: formData.bkashPhone,
        status: 'pending_verification',
        submittedAt: new Date().toISOString(),
    };

    try {
        const res = await fetch(SHEETS_URL, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'text/plain' },
            // text/plain avoids CORS preflight with Apps Script
        });

        if (!res.ok) {
            console.warn(`[Google Sheets] HTTP ${res.status}: ${res.statusText}`);
        }
    } catch (err) {
        console.warn('[Google Sheets] Sync failed (non-blocking):', err);
    }
}
