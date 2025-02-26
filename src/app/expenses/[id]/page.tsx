import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';

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

export default async function ExpenseDetailPage({ params }: { params: { id: string } }) {
    const expense = await getExpense(params.id);

    if (!expense) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                                Expense Details
                            </h1>
                            <Link
                                href={`/expenses/${expense.id}/edit`}
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Edit Expense
                            </Link>
                        </div>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="px-4 py-8 sm:px-0">
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        {expense.description}
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                        {expense.category}
                                    </p>
                                </div>
                                <div className="border-t border-gray-200">
                                    <dl>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Date</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {formatDate(expense.date)}
                                            </dd>
                                        </div>
                                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Category</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {expense.category}
                                            </dd>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {expense.description}
                                            </dd>
                                        </div>
                                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {formatCurrency(expense.amount)}
                                            </dd>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {formatDate(expense.createdAt)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    href="/expenses"
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    ← Back to Expenses
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 