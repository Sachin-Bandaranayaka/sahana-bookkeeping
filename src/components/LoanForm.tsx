'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
    id: string;
    name: string;
}

interface LoanFormProps {
    members: Member[];
}

const LOAN_TYPES = {
    MEMBER: { type: 'MEMBER', rate: 0.09 },
    SPECIAL: { type: 'SPECIAL', rate: 0.12 },
    BUSINESS: { type: 'BUSINESS', rate: 0.12 },
};

export default function LoanForm({ members }: LoanFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        memberId: '',
        type: 'MEMBER',
        principal: '',
        startDate: new Date().toISOString().split('T')[0],
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
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
            const response = await fetch('/api/loans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    principal: parseFloat(formData.principal),
                    interestRate: LOAN_TYPES[formData.type as keyof typeof LOAN_TYPES].rate,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create loan');
            }

            router.push('/loans');
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
                {/* Member Field */}
                <div className="sm:col-span-2">
                    <label htmlFor="memberId" className="block text-sm font-medium leading-6 text-gray-900">
                        Member
                    </label>
                    <div className="mt-2">
                        <select
                            id="memberId"
                            name="memberId"
                            required
                            value={formData.memberId}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                            <option value="">Select a member</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Loan Type Field */}
                <div>
                    <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-900">
                        Loan Type
                    </label>
                    <div className="mt-2">
                        <select
                            id="type"
                            name="type"
                            required
                            value={formData.type}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                            {Object.entries(LOAN_TYPES).map(([key, { type, rate }]) => (
                                <option key={key} value={type}>
                                    {type} ({(rate * 100).toFixed(1)}%)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Principal Amount Field */}
                <div>
                    <label htmlFor="principal" className="block text-sm font-medium leading-6 text-gray-900">
                        Principal Amount
                    </label>
                    <div className="mt-2">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                                type="number"
                                name="principal"
                                id="principal"
                                required
                                min="1000"
                                step="100"
                                value={formData.principal}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                </div>

                {/* Start Date Field */}
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium leading-6 text-gray-900">
                        Start Date
                    </label>
                    <div className="mt-2">
                        <input
                            type="date"
                            name="startDate"
                            id="startDate"
                            required
                            value={formData.startDate}
                            onChange={handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
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
                    {isSubmitting ? 'Saving...' : 'Issue Loan'}
                </button>
            </div>
        </form>
    );
} 