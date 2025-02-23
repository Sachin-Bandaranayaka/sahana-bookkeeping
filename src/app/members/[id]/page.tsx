import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';

interface PageProps {
    params: {
        id: string;
    };
}

async function getMember(id: string) {
    const member = await prisma.member.findUnique({
        where: { id },
        include: {
            loans: {
                orderBy: { startDate: 'desc' },
                include: {
                    payments: true,
                },
            },
            cashBook: {
                orderBy: { date: 'desc' },
            },
            dividends: {
                orderBy: { date: 'desc' },
            },
        },
    });

    if (!member) notFound();
    return member;
}

export default async function MemberPage({ params }: PageProps) {
    const member = await getMember(params.id);

    return (
        <div className="space-y-6 p-6">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                        Member Details
                    </h3>
                    <div className="mt-4 space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Name</h4>
                            <p className="mt-1 text-sm text-gray-900">{member.name}</p>
                        </div>
                        {member.contactNumber && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Contact Number</h4>
                                <p className="mt-1 text-sm text-gray-900">{member.contactNumber}</p>
                            </div>
                        )}
                        {member.email && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                <p className="mt-1 text-sm text-gray-900">{member.email}</p>
                            </div>
                        )}
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Join Date</h4>
                            <p className="mt-1 text-sm text-gray-900">
                                {new Date(member.joinDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loans Section */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">Loans</h3>
                    <div className="mt-4">
                        {member.loans.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Type</th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Principal</th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Balance</th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {member.loans.map((loan) => (
                                            <tr key={loan.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{loan.type}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                                                    Rs. {loan.principal.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                                                    Rs. {loan.balance.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">{loan.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No loans found</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">Recent Transactions</h3>
                    <div className="mt-4">
                        {member.cashBook.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {member.cashBook.map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                                                    {new Date(transaction.date).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{transaction.description}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                                                    Rs. {transaction.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No transactions found</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Dividends Section */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">Dividends</h3>
                    <div className="mt-4">
                        {member.dividends.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Share Amount</th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Annual Interest</th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Attending Bonus</th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Deductibles</th>
                                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {member.dividends.map((dividend) => (
                                            <tr key={dividend.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                                                    {new Date(dividend.date).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                                                    Rs. {dividend.shareAmount.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                                                    Rs. {dividend.annualInterest.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                                                    Rs. {dividend.attendingBonus.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                                                    Rs. {dividend.deductibles.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                                                    Rs. {dividend.total.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No dividends found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}