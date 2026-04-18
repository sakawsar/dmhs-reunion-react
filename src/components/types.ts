export interface FormData {
    // Step 1
    fullName: string;
    fatherName: string;
    batchYear: string;
    section: string;
    phone: string;
    email: string;
    currentCity: string;
    profession: string;
    bloodGroup: string;
    tshirtSize: string;
    guests: number;
    // Step 3
    paymentMethod: string;
    paymentTxId: string;
    paymentSenderPhone: string;
}

export interface FormErrors {
    [key: string]: string;
}

/**
 * Pricing helper: base charge depends on batch year.
 * "ছাত্র ছিলাম" (Was Student) → ৳1000
 * 1945–2017 → ৳1000, 2018–2025 → ৳700
 * Each guest adds ৳500.
 */
export function calculateTotal(batchYear: string, guests: number): { baseAmount: number; guestCharge: number; totalAmount: number } {
    const year = parseInt(batchYear, 10);
    let baseAmount: number;
    if (batchYear === 'ছাত্র ছিলাম') {
        baseAmount = 1000;
    } else if (!isNaN(year) && year >= 2018 && year <= 2025) {
        baseAmount = 700;
    } else {
        baseAmount = 1000;
    }
    const guestCharge = guests * 500;
    return { baseAmount, guestCharge, totalAmount: baseAmount + guestCharge };
}

