'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
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
        premium: 0,
        interest: 0,
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'date' ? value : parseFloat(value) || 0,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await apiPost(`loans/${loanId}/payments`, formData);
            router.push(`/loans/${loanId}`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {/* Date Field */}
                <div>
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

                {/* Premium Field */}
                <div>
                    <label htmlFor="premium" className="block text-sm font-medium leading-6 text-gray-900">
                        Premium Amount
                    </label>
                    <div className="mt-2">
                        <input
                            type="number"
                            name="premium"
                            id="premium"
                            min="0"
                            step="0.01"
                            value={formData.premium}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                {/* Interest Field */}
                <div>
                    <label htmlFor="interest" className="block text-sm font-medium leading-6 text-gray-900">
                        Interest Amount
                    </label>
                    <div className="mt-2">
                        <input
                            type="number"
                            name="interest"
                            id="interest"
                            min="0"
                            step="0.01"
                            value={formData.interest}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Pending interest: {formatCurrency(pendingInterest)}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                    type="button"
                    className="text-sm font-semibold leading-6 text-gray-900"
                    onClick={() => router.back()}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : 'Record Payment'}
                </button>
            </div>
        </form>
    );
}