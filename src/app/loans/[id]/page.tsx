import { prisma } from '@/lib/db';
import { formatCurrency, formatDate, formatDateInput } from '@/lib/utils';
import PaymentForm from '@/components/PaymentForm';
import { notFound } from 'next/navigation';

async function getLoanDetails(id: string) {
    const loan = await prisma.loan.findUnique({
        where: { id },
        include: {
            member: true,
            payments: {
                orderBy: {
                    date: 'desc',
                },
            },
        },
    });

    if (!loan) {
        notFound();
    }

    return loan;
}

function calculateInterest(loan: any) {
    const today = new Date();
    const startDate = new Date(loan.startDate);
    const days = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyInterest = (loan.principal * loan.interestRate * days) / 365;
    const totalPaidInterest = loan.payments.reduce((sum: number, payment: any) => sum + payment.interest, 0);
    return dailyInterest - totalPaidInterest;
}

export default async function LoanDetailsPage({ params }: { params: { id: string } }) {
    const loan = await getLoanDetails(params.id);
    const pendingInterest = calculateInterest(loan);

    // Calculate today's date on the server
    const today = new Date();
    today.setMinutes(today.getMinutes() + today.getTimezoneOffset()); // Adjust for timezone
    const initialDate = formatDateInput(today);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                            Loan Details - {loan.member.name}
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Loan Details Card */}
                            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                                <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Loan Information</h2>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Type</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{loan.type}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatDate(loan.startDate)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Principal</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatCurrency(loan.principal)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{(loan.interestRate * 100).toFixed(1)}%</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Current Balance</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatCurrency(loan.balance)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Pending Interest</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatCurrency(pendingInterest)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="mt-1">
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
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Payment Form Card */}
                            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                                <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Record Payment</h2>
                                <PaymentForm
                                    loanId={loan.id}
                                    pendingInterest={pendingInterest}
                                    initialDate={initialDate}
                                />
                            </div>

                            {/* Payment History Card */}
                            <div className="lg:col-span-2 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                                <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Payment History</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                    Premium
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                    Interest
                                                </th>
                                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {loan.payments.map((payment) => (
                                                <tr key={payment.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                                                        {formatDate(payment.date)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                        {formatCurrency(payment.premium)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                        {formatCurrency(payment.interest)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900">
                                                        {formatCurrency(payment.premium + payment.interest)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th scope="row" className="py-4 pl-4 pr-3 text-sm font-semibold text-gray-900 text-left">
                                                    Total
                                                </th>
                                                <td className="px-3 py-4 text-sm text-right font-semibold text-gray-900">
                                                    {formatCurrency(loan.payments.reduce((sum, p) => sum + p.premium, 0))}
                                                </td>
                                                <td className="px-3 py-4 text-sm text-right font-semibold text-gray-900">
                                                    {formatCurrency(loan.payments.reduce((sum, p) => sum + p.interest, 0))}
                                                </td>
                                                <td className="px-3 py-4 text-sm text-right font-semibold text-gray-900">
                                                    {formatCurrency(loan.payments.reduce((sum, p) => sum + p.premium + p.interest, 0))}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 