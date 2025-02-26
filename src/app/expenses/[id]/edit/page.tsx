import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ExpenseEditForm from '@/components/ExpenseEditForm';

async function getExpense(id: string) {
    try {
        const expense = await prisma.expense.findUnique({
            where: { id },
        });

        if (!expense) {
            return null;
        }

        return expense;
    } catch (error) {
        console.error('Error fetching expense:', error);
        return null;
    }
}

export default async function EditExpensePage({ params }: { params: { id: string } }) {
    const expense = await getExpense(params.id);

    if (!expense) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                            Edit Expense
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="px-4 py-8 sm:px-0">
                            <ExpenseEditForm expense={expense} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 