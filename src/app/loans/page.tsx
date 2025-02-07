import { prisma } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

async function getLoansWithMembers() {
    const loans = await prisma.loan.findMany({
        include: {
            member: true,
            payments: {
                orderBy: {
                    date: 'desc',
                },
            },
        },
        orderBy: [
            {
                status: 'asc',
            },
            {
                startDate: 'desc',
            },
        ],
    });
    return loans;
}

function calculateInterest(loan: any) {
    const today = new Date();
    const startDate = new Date(loan.startDate);
    const days = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyInterest = (loan.principal * loan.interestRate * days) / 365;
    const totalPaidInterest = loan.payments.reduce((sum: number, payment: any) => sum + payment.interest, 0);
    return dailyInterest - totalPaidInterest;
}

export default async function LoansPage() {
    const loans = await getLoansWithMembers();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Loans</h1>
                            <Link
                                href="/loans/new"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Issue New Loan
                            </Link>
                        </div>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mt-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                Member
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Type
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                Principal
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                Interest Rate
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                Balance
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                Pending Interest
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                                                Status
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {loans.map((loan) => {
                                            const pendingInterest = calculateInterest(loan);
                                            return (
                                                <tr key={loan.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                        {loan.member.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {loan.type}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                        {formatCurrency(loan.principal)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                        {(loan.interestRate * 100).toFixed(1)}%
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                        {formatCurrency(loan.balance)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                        {formatCurrency(pendingInterest)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${loan.status === 'ACTIVE'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : loan.status === 'PAID'
                                                                        ? 'bg-gray-100 text-gray-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}
                                                        >
                                                            {loan.status}
                                                        </span>
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <Link href={`/loans/${loan.id}`} className="text-indigo-600 hover:text-indigo-900">
                                                            View<span className="sr-only">, {loan.member.name}</span>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 