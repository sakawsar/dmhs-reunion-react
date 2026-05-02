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
export function calculateTotal(guests: number): { baseAmount: number; guestCharge: number; totalAmount: number } {
    let baseAmount: number;
    baseAmount = 500
    const guestCharge = guests * 500;
    return { baseAmount, guestCharge, totalAmount: baseAmount + guestCharge };
}

