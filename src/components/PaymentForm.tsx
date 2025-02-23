'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

interface PaymentFormProps {
    loanId: string;
    pendingInterest: number;
    initialDate: string; // YYYY-MM-DD format from server
}

export default function PaymentForm({ loanId, pendingInterest, initialDate }: PaymentFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        date: initialDate,
        premium: '',
        interest: pendingInterest.toFixed(2),
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/loans/${loanId}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    premium: formData.premium ? parseFloat(formData.premium) : 0,
                    interest: formData.interest ? parseFloat(formData.interest) : 0,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create payment');
            }

            router.refresh();

            // Reset form
            setFormData({
                date: initialDate,
                premium: '',
                interest: '0',
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                {/* Date Field */}
                <div className="sm:col-span-2">
                    <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">
                        Payment Date
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

                {/* Premium Amount Field */}
                <div>
                    <label htmlFor="premium" className="block text-sm font-medium leading-6 text-gray-900">
                        Premium Amount
                    </label>
                    <div className="mt-2">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">Rs</span>
                            </div>
                            <input
                                type="number"
                                name="premium"
                                id="premium"
                                min="0"
                                step="0.01"
                                value={formData.premium}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                </div>

                {/* Interest Amount Field */}
                <div>
                    <label htmlFor="interest" className="block text-sm font-medium leading-6 text-gray-900">
                        Interest Amount
                        <span className="ml-2 text-sm text-gray-500">
                            (Pending: {formatCurrency(pendingInterest)})
                        </span>
                    </label>
                    <div className="mt-2">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">Rs</span>
                            </div>
                            <input
                                type="number"
                                name="interest"
                                id="interest"
                                min="0"
                                max={pendingInterest}
                                step="0.01"
                                value={formData.interest}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || (!formData.premium && !formData.interest)}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                >
                    {isSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
            </div>
        </form>
    );
}