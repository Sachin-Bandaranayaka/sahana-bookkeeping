'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { getTodayDateInput } from '@/lib/utils';

// Common expense categories
const EXPENSE_CATEGORIES = [
    'Office Supplies',
    'Rent',
    'Utilities',
    'Salaries',
    'Travel',
    'Marketing',
    'Maintenance',
    'Insurance',
    'Professional Fees',
    'Miscellaneous'
];

export default function ExpenseForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        date: getTodayDateInput(),
        category: '',
        description: '',
        amount: 0,
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await apiPost('expenses', formData);
            router.push('/expenses');
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
                        Expense Date
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

                {/* Category Field */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                        Category
                    </label>
                    <div className="mt-2">
                        <select
                            id="category"
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                            <option value="">Select a category</option>
                            {EXPENSE_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Description Field */}
                <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                        Description
                    </label>
                    <div className="mt-2">
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                {/* Amount Field */}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">
                        Amount
                    </label>
                    <div className="mt-2">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">Rs</span>
                            </div>
                            <input
                                type="number"
                                name="amount"
                                id="amount"
                                required
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
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
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
} 