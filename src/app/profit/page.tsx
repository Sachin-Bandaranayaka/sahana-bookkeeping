import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

async function getNetProfitData() {
    // Get loan interest income (from loan payments)
    const loanInterestIncome = await prisma.loanPayment.aggregate({
        _sum: {
            interest: true,
        },
    });

    // Get total expenses
    const totalExpenses = await prisma.expense.aggregate({
        _sum: {
            amount: true,
        },
    });

    // Get total dividends distributed
    const totalDividends = await prisma.dividend.aggregate({
        _sum: {
            total: true,
        },
    });

    // Get recent expenses for display
    const recentExpenses = await prisma.expense.findMany({
        orderBy: {
            date: 'desc',
        },
        take: 5,
    });

    // Get recent loan payments for display
    const recentLoanPayments = await prisma.loanPayment.findMany({
        where: {
            interest: {
                gt: 0,
            },
        },
        include: {
            loan: {
                include: {
                    member: true,
                },
            },
        },
        orderBy: {
            date: 'desc',
        },
        take: 5,
    });

    // Calculate net profit
    const totalIncome = (loanInterestIncome._sum.interest || 0);
    const totalExpensesAmount = (totalExpenses._sum.amount || 0);
    const totalDividendsAmount = (totalDividends._sum.total || 0);
    const netProfit = totalIncome - totalExpensesAmount - totalDividendsAmount;

    return {
        totalIncome,
        totalExpensesAmount,
        totalDividendsAmount,
        netProfit,
        recentExpenses,
        recentLoanPayments,
    };
}

export default async function ProfitPage() {
    const {
        totalIncome,
        totalExpensesAmount,
        totalDividendsAmount,
        netProfit,
        recentExpenses,
        recentLoanPayments,
    } = await getNetProfitData();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                            Profit & Loss
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        {/* Summary Cards */}
                        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Total Income Card */}
                            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                                <dt className="truncate text-sm font-medium text-gray-500">Total Income</dt>
                                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                                    {formatCurrency(totalIncome)}
                                </dd>
                            </div>

                            {/* Total Expenses Card */}
                            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                                <dt className="truncate text-sm font-medium text-gray-500">Total Expenses</dt>
                                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                                    {formatCurrency(totalExpensesAmount)}
                                </dd>
                            </div>

                            {/* Total Dividends Card */}
                            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                                <dt className="truncate text-sm font-medium text-gray-500">Total Dividends</dt>
                                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                                    {formatCurrency(totalDividendsAmount)}
                                </dd>
                            </div>

                            {/* Net Profit Card */}
                            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                                <dt className="truncate text-sm font-medium text-gray-500">Net Profit</dt>
                                <dd className={`mt-1 text-3xl font-semibold tracking-tight ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(netProfit)}
                                </dd>
                            </div>
                        </div>

                        {/* Recent Income & Expenses */}
                        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {/* Recent Loan Interest Income */}
                            <div className="bg-white shadow sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Interest Income</h3>
                                </div>
                                <div className="border-t border-gray-200">
                                    <div className="overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                        Date
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Member
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                        Interest Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {recentLoanPayments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="py-4 px-6 text-center text-sm text-gray-500">
                                                            No recent interest payments found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    recentLoanPayments.map((payment) => (
                                                        <tr key={payment.id}>
                                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                                                                {formatDate(payment.date)}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                {payment.loan.member.name}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                                {formatCurrency(payment.interest)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-4 py-3 text-right">
                                        <Link
                                            href="/loans"
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            View all loans →
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Expenses */}
                            <div className="bg-white shadow sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Expenses</h3>
                                </div>
                                <div className="border-t border-gray-200">
                                    <div className="overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                        Date
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Category
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {recentExpenses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="py-4 px-6 text-center text-sm text-gray-500">
                                                            No recent expenses found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    recentExpenses.map((expense) => (
                                                        <tr key={expense.id}>
                                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                                                                {formatDate(expense.date)}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                {expense.category}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                                {formatCurrency(expense.amount)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-4 py-3 text-right">
                                        <Link
                                            href="/expenses"
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            View all expenses →
                                        </Link>
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