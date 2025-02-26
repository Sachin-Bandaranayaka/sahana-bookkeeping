'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { classNames } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Members', href: '/members' },
    { name: 'Cash Book', href: '/cash-book' },
    { name: 'Loans', href: '/loans' },
    { name: 'Expenses', href: '/expenses' },
    { name: 'Profit & Loss', href: '/profit' },
    { name: 'Dividends', href: '/dividends' },
    { name: 'Banks', href: '/banks' },
    { name: 'Notifications', href: '/notifications' },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <h1 className="text-xl font-bold">Sahana Bookkeeping</h1>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={classNames(
                                            isActive
                                                ? 'border-indigo-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                            'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
} 