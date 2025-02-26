import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

async function getMembersWithCashBook() {
    const members = await prisma.member.findMany({
        include: {
            cashBook: {
                orderBy: {
                    date: 'desc',
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });
    return members;
}

export default async function CashBookPage() {
    const members = await getMembersWithCashBook();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Cash Book</h1>
                            <Link
                                href="/cash-book/new"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Add Transaction
                            </Link>
                        </div>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mt-8">
                            {members.map((member) => (
                                <div key={member.id} className="mb-8">
                                    <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-gray-900">{member.name}</h2>
                                            <span className="text-sm text-gray-500">
                                                Total: {formatCurrency(member.cashBook.reduce((sum, entry) => sum + entry.amount, 0))}
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-300">
                                                <thead>
                                                    <tr>
                                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                            Date
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Description
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                            Amount
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                            Running Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {member.cashBook.map((entry, index) => {
                                                        const runningTotal = member.cashBook
                                                            .slice(0, member.cashBook.length - index)
                                                            .reduce((sum, e) => sum + e.amount, 0);
                                                        return (
                                                            <tr key={entry.id}>
                                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                                                                    {formatDate(entry.date)}
                                                                </td>
                                                                <td className="px-3 py-4 text-sm text-gray-500">{entry.description}</td>
                                                                <td className="px-3 py-4 text-right text-sm text-gray-900">
                                                                    {formatCurrency(entry.amount)}
                                                                </td>
                                                                <td className="px-3 py-4 text-right text-sm text-gray-900">
                                                                    {formatCurrency(runningTotal)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 