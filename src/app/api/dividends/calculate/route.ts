import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface DividendData {
    memberId: string;
    shareAmount: number;
    annualInterest: number;
    attendingBonus: number;
    deductibles: number;
    total: number;
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { dividends, date } = data;

        if (!dividends || !date) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create all dividends in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const createdDividends = await Promise.all(
                dividends.map((dividend: DividendData) =>
                    tx.dividend.create({
                        data: {
                            memberId: dividend.memberId,
                            date: new Date(date),
                            shareAmount: dividend.shareAmount,
                            annualInterest: dividend.annualInterest,
                            attendingBonus: dividend.attendingBonus,
                            deductibles: dividend.deductibles,
                            total: dividend.total,
                        },
                    })
                )
            );

            // If there are deductibles, create loan payments for the unpaid interest
            for (const dividend of dividends as DividendData[]) {
                if (dividend.deductibles > 0) {
                    // Get active loans for the member
                    const activeLoans = await tx.loan.findMany({
                        where: {
                            memberId: dividend.memberId,
                            status: 'ACTIVE',
                        },
                        include: {
                            interestCalculations: {
                                orderBy: {
                                    calculationDate: 'desc',
                                },
                                take: 1,
                            },
                            payments: true,
                        },
                    });

                    for (const loan of activeLoans) {
                        const lastCalculation = loan.interestCalculations[0];
                        if (lastCalculation) {
                            const paidInterest = loan.payments
                                .filter(payment => payment.date > lastCalculation.calculationDate)
                                .reduce((total, payment) => total + payment.interest, 0);

                            const unpaidInterest = Math.max(0, lastCalculation.interestAmount - paidInterest);

                            if (unpaidInterest > 0) {
                                await tx.loanPayment.create({
                                    data: {
                                        loanId: loan.id,
                                        date: new Date(date),
                                        premium: 0,
                                        interest: unpaidInterest,
                                    },
                                });
                            }
                        }
                    }
                }
            }

            return createdDividends;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Dividend calculation error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate dividends' },
            { status: 500 }
        );
    }
}