import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface PageProps {
    params: {
        id: string;
    };
}

export async function POST(
    req: NextRequest,
    props: PageProps
): Promise<Response> {
    try {
        const data = await req.json();
        const { date, premium, interest } = data;
        const loanId = props.params.id;

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
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create payment';
        console.error('Failed to create payment:', errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

export async function GET(
    req: NextRequest,
    props: PageProps
): Promise<Response> {
    try {
        const payments = await prisma.loanPayment.findMany({
            where: {
                loanId: props.params.id,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json(payments);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payments';
        console.error('Failed to fetch payments:', errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}