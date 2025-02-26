import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface DividendTotals {
    shareAmount: number;
    annualInterest: number;
    attendingBonus: number;
    deductibles: number;
    total: number;
}

interface Dividend {
    id: string;
    member: {
        name: string;
    };
    shareAmount: number;
    annualInterest: number;
    attendingBonus: number;
    deductibles: number;
    total: number;
}

interface GroupedDividend {
    period: string;
    dividends: Dividend[];
    totals: DividendTotals;
}

async function getDividendsWithMembers(): Promise<GroupedDividend[]> {
    const dividends = await prisma.dividend.findMany({
        include: {
            member: true,
        },
        orderBy: [
            {
                date: 'desc',
            },
            {
                member: {
                    name: 'asc',
                },
            },
        ],
    });

    // Group dividends by quarter
    const groupedDividends = dividends.reduce((groups: Record<string, GroupedDividend>, dividend) => {
        const date = new Date(dividend.date);
        const quarter = Math.floor(date.getMonth() / 3);
        const year = date.getFullYear();
        const key = `${year}-Q${quarter + 1}`;

        if (!groups[key]) {
            groups[key] = {
                period: key,
                dividends: [],
                totals: {
                    shareAmount: 0,
                    annualInterest: 0,
                    attendingBonus: 0,
                    deductibles: 0,
                    total: 0,
                },
            };
        }

        groups[key].dividends.push(dividend);
        groups[key].totals.shareAmount += dividend.shareAmount;
        groups[key].totals.annualInterest += dividend.annualInterest;
        groups[key].totals.attendingBonus += dividend.attendingBonus;
        groups[key].totals.deductibles += dividend.deductibles;
        groups[key].totals.total += dividend.total;

        return groups;
    }, {});

    return Object.values(groupedDividends);
}

export default async function DividendsPage() {
    const groupedDividends = await getDividendsWithMembers();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dividends</h1>
                            <Link
                                href="/dividends/calculate"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Calculate Quarterly Dividend
                            </Link>
                        </div>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mt-8 space-y-8">
                            {groupedDividends.map((group) => (
                                <div key={group.period} className="bg-white shadow sm:rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                            {group.period}
                                        </h2>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-300">
                                                <thead>
                                                    <tr>
                                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                            Member
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                            Share Amount
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                            Annual Interest
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                            Attending Bonus
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                            Deductibles
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {group.dividends.map((dividend) => (
                                                        <tr key={dividend.id}>
                                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                                {dividend.member.name}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                                {formatCurrency(dividend.shareAmount)}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                                {formatCurrency(dividend.annualInterest)}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                                {formatCurrency(dividend.attendingBonus)}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                                {formatCurrency(dividend.deductibles)}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                                {formatCurrency(dividend.total)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <th scope="row" colSpan={5} className="py-4 pl-4 pr-3 text-sm font-semibold text-gray-900 text-right">
                                                            Total Distribution:
                                                        </th>
                                                        <td className="px-3 py-4 text-sm text-right font-semibold text-gray-900">
                                                            {formatCurrency(group.totals.total)}
                                                        </td>
                                                    </tr>
                                                </tfoot>
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