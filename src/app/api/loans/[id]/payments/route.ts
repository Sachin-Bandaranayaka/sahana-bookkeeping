import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json();
        const { date, premium, interest } = data;
        const loanId = params.id;

        if (!date || (premium === undefined && interest === undefined)) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get the loan
        const loan = await prisma.loan.findUnique({
            where: { id: loanId },
        });

        if (!loan) {
            return NextResponse.json(
                { error: 'Loan not found' },
                { status: 404 }
            );
        }

        // Create the payment
        const payment = await prisma.loanPayment.create({
            data: {
                loanId,
                date: new Date(date),
                premium: premium || 0,
                interest: interest || 0,
            },
        });

        // Update loan balance if premium was paid
        if (premium) {
            const newBalance = loan.balance - premium;
            await prisma.loan.update({
                where: { id: loanId },
                data: {
                    balance: newBalance,
                    status: newBalance <= 0 ? 'PAID' : 'ACTIVE',
                },
            });
        }

        return NextResponse.json(payment, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create payment' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const payments = await prisma.loanPayment.findMany({
            where: {
                loanId: params.id,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json(payments);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
} 