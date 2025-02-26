import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';

async function getExpenses() {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: {
                date: 'desc',
            },
        });
        return expenses;
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }
}

export default async function ExpensesPage() {
    const expenses = await getExpenses();
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Extract unique categories for filtering
    const categories = Array.from(new Set(expenses.map(expense => expense.category)));

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                                Expenses
                            </h1>
                            <Link
                                href="/expenses/new"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Add New Expense
                            </Link>
                        </div>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        {/* Summary Card */}
                        <div className="mt-8 overflow-hidden rounded-lg bg-white shadow">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="truncate text-sm font-medium text-gray-500">Total Expenses</dt>
                                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                                    {formatCurrency(totalExpenses)}
                                </dd>
                            </div>
                        </div>

                        {/* Expenses Table */}
                        <div className="mt-8 flex flex-col">
                            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                                    >
                                                        Date
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                                    >
                                                        Category
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                                    >
                                                        Description
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                                                    >
                                                        Amount
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                                    >
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {expenses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="py-4 px-6 text-center text-sm text-gray-500">
                                                            No expenses found. Add your first expense!
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    expenses.map((expense) => (
                                                        <tr key={expense.id}>
                                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                                                                {formatDate(expense.date)}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                {expense.category}
                                                            </td>
                                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                                {expense.description}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                                                                {formatCurrency(expense.amount)}
                                                            </td>
                                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                                <Link
                                                                    href={`/expenses/${expense.id}`}
                                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                                >
                                                                    View
                                                                </Link>
                                                                <Link
                                                                    href={`/expenses/${expense.id}/edit`}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 