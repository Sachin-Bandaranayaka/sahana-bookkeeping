import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/expenses/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const expense = await prisma.expense.findUnique({
            where: { id: params.id },
        });

        if (!expense) {
            return NextResponse.json(
                { error: 'Expense not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(expense);
    } catch (error) {
        console.error('Error fetching expense:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expense' },
            { status: 500 }
        );
    }
}

// PUT /api/expenses/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json();
        const { date, category, description, amount } = data;

        // Validate required fields
        if (!date || !category || !description || amount === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const updatedExpense = await prisma.expense.update({
            where: { id: params.id },
            data: {
                date: new Date(date),
                category,
                description,
                amount,
            },
        });

        return NextResponse.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        return NextResponse.json(
            { error: 'Failed to update expense' },
            { status: 500 }
        );
    }
}

// DELETE /api/expenses/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.expense.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json(
            { error: 'Failed to delete expense' },
            { status: 500 }
        );
    }
} 