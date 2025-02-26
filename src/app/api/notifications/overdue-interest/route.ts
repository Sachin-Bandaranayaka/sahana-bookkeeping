import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendInterestDueNotification } from '@/lib/sms';

// Function to calculate days between two dates
function daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
    return diffDays;
}

// GET endpoint to send notifications for overdue interest
export async function GET() {
    try {
        const today = new Date();
        const activeLoans = await prisma.loan.findMany({
            where: {
                status: 'ACTIVE',
            },
            include: {
                member: true,
                interestCalculations: {
                    orderBy: {
                        calculatedAt: 'desc',
                    },
                    take: 1,
                },
                payments: {
                    orderBy: {
                        date: 'desc',
                    },
                    take: 1,
                },
            },
        });

        const notificationResults = [];

        for (const loan of activeLoans) {
            try {
                // Get the last interest calculation
                const lastCalculation = loan.interestCalculations[0];
                if (!lastCalculation) continue;

                // Get the last payment
                const lastPayment = loan.payments[0];
                const lastPaymentDate = lastPayment?.date || loan.startDate;

                // Calculate days since last payment
                const daysSincePayment = daysBetween(today, lastPaymentDate);

                // If more than 30 days since last payment, send notification
                if (daysSincePayment >= 30) {
                    await sendInterestDueNotification(
                        loan.memberId,
                        loan.id,
                        lastCalculation.pendingInterest,
                        today
                    );

                    notificationResults.push({
                        memberId: loan.memberId,
                        memberName: loan.member.name,
                        loanId: loan.id,
                        pendingInterest: lastCalculation.pendingInterest,
                        daysSincePayment,
                    });
                }
            } catch (error) {
                console.error(`Failed to process loan ${loan.id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            notificationsSent: notificationResults.length,
            details: notificationResults,
        });
    } catch (error) {
        console.error('Failed to send overdue interest notifications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send notifications' },
            { status: 500 }
        );
    }
} 