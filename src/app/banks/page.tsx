import { prisma } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

async function getBanks() {
    const banks = await prisma.bank.findMany({
        include: {
            fixedDeposits: {
                orderBy: {
                    endDate: 'asc',
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });
    return banks;
}

export default async function BanksPage() {
    const banks = await getBanks();
    const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);
    const totalFixedDeposits = banks.reduce(
        (sum, bank) => sum + bank.fixedDeposits.reduce((fdSum, fd) => fdSum + fd.amount, 0),
        0
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Banks</h1>
                            <Link
                                href="/banks/new"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Add New Bank
                            </Link>
                        </div>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        {/* Summary Cards */}
                        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                                <dt className="truncate text-sm font-medium text-gray-500">Total Bank Balance</dt>
                                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                                    {formatCurrency(totalBalance)}
                                </dd>
                            </div>
                            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                                <dt className="truncate text-sm font-medium text-gray-500">Total Fixed Deposits</dt>
                                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                                    {formatCurrency(totalFixedDeposits)}
                                </dd>
                            </div>
                        </div>

                        {/* Banks List */}
                        <div className="mt-8">
                            {banks.map((bank) => (
                                <div key={bank.id} className="mb-8">
                                    <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900">{bank.name}</h2>
                                                <p className="text-sm text-gray-500">Account: {bank.accountNumber}</p>
                                            </div>
                                            <span className="text-lg font-medium text-gray-900">
                                                {formatCurrency(bank.balance)}
                                            </span>
                                        </div>

                                        {bank.fixedDeposits.length > 0 && (
                                            <div className="mt-6">
                                                <h3 className="text-sm font-medium text-gray-900">Fixed Deposits</h3>
                                                <div className="mt-2 overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-300">
                                                        <thead>
                                                            <tr>
                                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                                    Start Date
                                                                </th>
                                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                                    End Date
                                                                </th>
                                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                                    Amount
                                                                </th>
                                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                                    Interest Rate
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                            {bank.fixedDeposits.map((fd) => (
                                                                <tr key={fd.id}>
                                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                                                                        {formatDate(fd.startDate)}
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                                        {formatDate(fd.endDate)}
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                                        {formatCurrency(fd.amount)}
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                                        {(fd.interestRate * 100).toFixed(2)}%
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
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