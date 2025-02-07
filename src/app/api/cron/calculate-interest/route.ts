import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // Get all active loans
        const activeLoans = await prisma.loan.findMany({
            where: {
                status: 'ACTIVE',
            },
            include: {
                payments: true,
            },
        });

        const today = new Date();
        const results = [];

        for (const loan of activeLoans) {
            const startDate = new Date(loan.startDate);
            const days = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const dailyInterest = (loan.principal * loan.interestRate * days) / 365;
            const totalPaidInterest = loan.payments.reduce((sum, payment) => sum + payment.interest, 0);
            const pendingInterest = dailyInterest - totalPaidInterest;

            // If there's significant pending interest (more than 1 rupee), log it
            if (pendingInterest > 1) {
                results.push({
                    loanId: loan.id,
                    memberId: loan.memberId,
                    pendingInterest: pendingInterest,
                    lastCalculated: today,
                });

                // Create an interest calculation record
                await prisma.interestCalculation.create({
                    data: {
                        loanId: loan.id,
                        calculationDate: today,
                        daysElapsed: days,
                        interestAmount: pendingInterest,
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            calculatedAt: today,
            results,
        });
    } catch (error) {
        console.error('Interest calculation error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate interest' },
            { status: 500 }
        );
    }
} 