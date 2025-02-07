export function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function calculateDailyInterest(principal: number, annualRate: number, days: number) {
    return (principal * annualRate * days) / 365;
}

// Format date for display (e.g., "January 15, 2024")
export function formatDate(date: Date | string) {
    const d = new Date(date);
    // Force UTC to avoid timezone issues
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    return new Intl.DateTimeFormat('en-IN', options).format(d);
}

// Format date for input fields (e.g., "2024-01-15")
export function formatDateInput(date: Date | string) {
    const d = new Date(date);
    // Force UTC to avoid timezone issues
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Get today's date in YYYY-MM-DD format
export function getTodayDateInput() {
    return formatDateInput(new Date());
} 