import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

async function getDashboardStats() {
  const [
    memberCount,
    activeLoans,
    totalBankBalance,
    totalFixedDeposits,
    totalCashBook,
  ] = await Promise.all([
    // Total Members
    prisma.member.count(),

    // Active Loans
    prisma.loan.count({
      where: {
        status: 'ACTIVE',
      },
    }),

    // Total Bank Balance
    prisma.bank.aggregate({
      _sum: {
        balance: true,
      },
    }),

    // Total Fixed Deposits
    prisma.fixedDeposit.aggregate({
      _sum: {
        amount: true,
      },
    }),

    // Total Cash Book Balance
    prisma.cashBook.aggregate({
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    memberCount,
    activeLoans,
    totalBankBalance: totalBankBalance._sum.balance || 0,
    totalFixedDeposits: totalFixedDeposits._sum.amount || 0,
    totalCashBook: totalCashBook._sum.amount || 0,
  };
}

export default async function Home() {
  const stats = await getDashboardStats();
  const totalAssets = stats.totalBankBalance + stats.totalFixedDeposits + stats.totalCashBook;

  return (
    <main className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dashboard</h1>

        {/* Overview Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Members Card */}
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Members</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {stats.memberCount}
              </dd>
            </div>

            {/* Active Loans Card */}
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Active Loans</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {stats.activeLoans}
              </dd>
            </div>

            {/* Total Assets Card */}
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Assets</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {formatCurrency(totalAssets)}
              </dd>
            </div>

            {/* Bank Balance Card */}
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Bank Balance</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {formatCurrency(stats.totalBankBalance)}
              </dd>
            </div>

            {/* Fixed Deposits Card */}
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Fixed Deposits</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {formatCurrency(stats.totalFixedDeposits)}
              </dd>
            </div>

            {/* Cash Book Balance Card */}
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Cash Book Balance</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {formatCurrency(stats.totalCashBook)}
              </dd>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/members/new"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add New Member
            </Link>
            <Link
              href="/cash-book/new"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Record Transaction
            </Link>
            <Link
              href="/loans/new"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Issue New Loan
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
