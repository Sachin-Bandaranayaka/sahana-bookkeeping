'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

interface Member {
    id: string;
    name: string;
    attendanceBonus: number;
    unpaidInterest: number;
}

interface DividendCalculationFormProps {
    members: Member[];
}

export default function DividendCalculationForm({ members }: DividendCalculationFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        totalProfit: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const calculateDividends = () => {
        const totalProfit = parseFloat(formData.totalProfit);
        if (!totalProfit || totalProfit <= 0) return [];

        const totalMembers = members.length;
        const baseShareAmount = totalProfit / totalMembers;

        return members.map(member => {
            const shareAmount = baseShareAmount;
            const annualInterest = shareAmount * 0.05; // 5% annual interest
            const attendingBonus = member.attendanceBonus;
            const deductibles = member.unpaidInterest;
            const total = shareAmount + annualInterest + attendingBonus - deductibles;

            return {
                memberId: member.id,
                date: formData.date,
                shareAmount,
                annualInterest,
                attendingBonus,
                deductibles,
                total,
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const dividends = calculateDividends();

            const response = await fetch('/api/dividends/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dividends,
                    date: formData.date,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to calculate dividends');
            }

            router.push('/dividends');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const previewDividends = calculateDividends();
    const totalDistribution = previewDividends.reduce((sum, d) => sum + d.total, 0);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {/* Total Profit Field */}
                <div>
                    <label htmlFor="totalProfit" className="block text-sm font-medium leading-6 text-gray-900">
                        Total Quarterly Profit
                    </label>
                    <div className="mt-2">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">Rs</span>
                            </div>
                            <input
                                type="number"
                                name="totalProfit"
                                id="totalProfit"
                                required
                                min="0"
                                step="0.01"
                                value={formData.totalProfit}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                </div>

                {/* Date Field */}
                <div>
                    <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">
                        Distribution Date
                    </label>
                    <div className="mt-2">
                        <input
                            type="date"
                            name="date"
                            id="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>
            </div>

            {formData.totalProfit && (
                <div className="mt-8">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
                        Distribution Preview
                    </h3>
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
                                {previewDividends.map((dividend, index) => (
                                    <tr key={dividend.memberId}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                            {members[index].name}
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
                                        {formatCurrency(totalDistribution)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-end gap-x-4">
                <button
                    type="button"
                    className="text-sm font-semibold leading-6 text-gray-900"
                    onClick={() => router.back()}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !formData.totalProfit}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                >
                    {isSubmitting ? 'Calculating...' : 'Calculate and Save'}
                </button>
            </div>
        </form>
    );
}