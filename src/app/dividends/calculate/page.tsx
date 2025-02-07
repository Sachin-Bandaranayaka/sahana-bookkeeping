import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import DividendCalculationForm from '@/components/DividendCalculationForm';

async function getCalculationData() {
    // Get all members with their attendance and active loans
    const members = await prisma.member.findMany({
        include: {
            attendance: {
                where: {
                    date: {
                        gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                    },
                },
            },
            loans: {
                where: {
                    status: 'ACTIVE',
                },
                include: {
                    payments: true,
                    interestCalculations: {
                        where: {
                            calculationDate: {
                                gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });

    // Calculate total attendance bonus and unpaid interest for each member
    const membersWithCalculations = members.map(member => {
        const totalBonus = member.attendance.reduce((sum, record) => sum + record.bonus, 0);

        const unpaidInterest = member.loans.reduce((sum, loan) => {
            const lastCalculation = loan.interestCalculations[loan.interestCalculations.length - 1];
            if (lastCalculation) {
                const paidInterest = loan.payments
                    .filter(payment => payment.date > lastCalculation.calculationDate)
                    .reduce((total, payment) => total + payment.interest, 0);
                return sum + Math.max(0, lastCalculation.interestAmount - paidInterest);
            }
            return sum;
        }, 0);

        return {
            id: member.id,
            name: member.name,
            attendanceBonus: totalBonus,
            unpaidInterest,
        };
    });

    return membersWithCalculations;
}

export default async function CalculateDividendPage() {
    const membersData = await getCalculationData();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                            Calculate Quarterly Dividend
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mt-8">
                            <div className="bg-white shadow sm:rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h2 className="text-base font-semibold leading-6 text-gray-900 mb-4">
                                        Member Summary
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead>
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                        Member
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                        Attendance Bonus
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                        Unpaid Interest
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {membersData.map((member) => (
                                                    <tr key={member.id}>
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                            {member.name}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                            {formatCurrency(member.attendanceBonus)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                            {formatCurrency(member.unpaidInterest)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-8">
                                        <DividendCalculationForm members={membersData} />
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