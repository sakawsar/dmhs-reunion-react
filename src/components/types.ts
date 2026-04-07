export interface FormData {
    // Step 1
    fullName: string;
    batchYear: string;
    section: string;
    phone: string;
    email: string;
    currentCity: string;
    profession: string;
    bloodGroup: string;
    // Step 2
    packageId: string;
    seats: number;
    guestNames: string;
    dietaryPref: string;
    specialRequests: string;
    // Step 3
    bkashTxId: string;
    bkashPhone: string;
}

export interface FormErrors {
    [key: string]: string;
}

export interface Package {
    id: string;
    name: string;
    price: number;
    description: string;
    icon: string;
    popular?: boolean;
}
