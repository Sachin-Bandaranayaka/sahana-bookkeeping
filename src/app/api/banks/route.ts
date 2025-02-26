import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const banks = await prisma.bank.findMany({
            include: {
                fixedDeposits: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return NextResponse.json(banks);
    } catch (error) {
        console.error('Error fetching banks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banks' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { name, accountNumber, balance } = data;

        if (!name || !accountNumber || balance === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const bank = await prisma.bank.create({
            data: {
                name,
                accountNumber,
                balance,
            },
        });

        return NextResponse.json(bank, { status: 201 });
    } catch (error) {
        console.error('Error creating bank:', error);
        return NextResponse.json(
            { error: 'Failed to create bank' },
            { status: 500 }
        );
    }
}