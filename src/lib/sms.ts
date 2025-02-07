import { prisma } from './db';
import { config } from './config';

interface SMSResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Function to format phone number to international format
export function formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Validate and format Sri Lankan phone numbers
    if (cleaned.length === 10 && (cleaned.startsWith('07') || cleaned.startsWith('01'))) {
        return `94${cleaned.substring(1)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('947')) {
        return cleaned;
    }

    throw new Error('Invalid phone number format');
}

// Function to send SMS using notify.lk
async function sendSMS(to: string, message: string): Promise<SMSResponse> {
    try {
        const { userId, apiKey, senderId, baseUrl } = config.sms.notifyLk;

        if (!userId || !apiKey) {
            throw new Error('Notify.lk credentials not configured');
        }

        const formattedNumber = formatPhoneNumber(to);

        const params = new URLSearchParams({
            user_id: userId,
            api_key: apiKey,
            sender_id: senderId,
            to: formattedNumber,
            message: message,
        });

        const response = await fetch(`${baseUrl}?${params.toString()}`);
        const data = await response.json();

        if (data.status === 'success') {
            return {
                success: true,
                messageId: data.message_id,
            };
        } else {
            throw new Error(data.message || 'Failed to send SMS');
        }
    } catch (error) {
        console.error('SMS sending error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send SMS',
        };
    }
}

// Function to send interest due notification
export async function sendInterestDueNotification(
    memberId: string,
    loanId: string,
    amount: number,
    dueDate: Date
): Promise<void> {
    try {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
        });

        if (!member?.contactNumber) {
            throw new Error('Member has no contact number');
        }

        const message = `Dear ${member.name}, your loan interest payment of Rs.${amount.toFixed(2)} is due on ${dueDate.toLocaleDateString()}. Please pay to avoid deduction from dividends.`;

        // Create notification record
        const notification = await prisma.notification.create({
            data: {
                memberId,
                loanId,
                type: 'INTEREST_DUE',
                message,
                status: 'PENDING',
            },
        });

        // Send SMS
        const response = await sendSMS(member.contactNumber, message);

        // Update notification status
        await prisma.notification.update({
            where: { id: notification.id },
            data: {
                status: response.success ? 'SENT' : 'FAILED',
                sentAt: response.success ? new Date() : null,
            },
        });
    } catch (error) {
        console.error('Failed to send interest due notification:', error);
    }
}

// Function to send payment reminder
export async function sendPaymentReminder(
    memberId: string,
    loanId: string,
    amount: number
): Promise<void> {
    try {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
        });

        if (!member?.contactNumber) {
            throw new Error('Member has no contact number');
        }

        const message = `Dear ${member.name}, this is a reminder for your pending loan interest payment of Rs.${amount.toFixed(2)}. Please pay at your earliest convenience.`;

        // Create notification record
        const notification = await prisma.notification.create({
            data: {
                memberId,
                loanId,
                type: 'PAYMENT_REMINDER',
                message,
                status: 'PENDING',
            },
        });

        // Send SMS
        const response = await sendSMS(member.contactNumber, message);

        // Update notification status
        await prisma.notification.update({
            where: { id: notification.id },
            data: {
                status: response.success ? 'SENT' : 'FAILED',
                sentAt: response.success ? new Date() : null,
            },
        });
    } catch (error) {
        console.error('Failed to send payment reminder:', error);
    }
}

// Function to send dividend distribution notification
export async function sendDividendNotification(
    memberId: string,
    amount: number,
    deductions: number
): Promise<void> {
    try {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
        });

        if (!member?.contactNumber) {
            throw new Error('Member has no contact number');
        }

        const message = `Dear ${member.name}, your quarterly dividend of Rs.${amount.toFixed(2)} has been calculated. ${deductions > 0 ? `Interest deductions: Rs.${deductions.toFixed(2)}.` : ''
            } Net amount: Rs.${(amount - deductions).toFixed(2)}.`;

        // Create notification record
        const notification = await prisma.notification.create({
            data: {
                memberId,
                type: 'DIVIDEND_DISTRIBUTED',
                message,
                status: 'PENDING',
            },
        });

        // Send SMS
        const response = await sendSMS(member.contactNumber, message);

        // Update notification status
        await prisma.notification.update({
            where: { id: notification.id },
            data: {
                status: response.success ? 'SENT' : 'FAILED',
                sentAt: response.success ? new Date() : null,
            },
        });
    } catch (error) {
        console.error('Failed to send dividend notification:', error);
    }
} 