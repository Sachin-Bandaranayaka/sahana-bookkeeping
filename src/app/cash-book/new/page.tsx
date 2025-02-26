import { prisma } from '@/lib/prisma';
import TransactionForm from '@/components/TransactionForm';

async function getMembers() {
    const members = await prisma.member.findMany({
        orderBy: {
            name: 'asc',
        },
        select: {
            id: true,
            name: true,
        },
    });
    return members;
}

export default async function NewTransactionPage() {
    const members = await getMembers();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Add Transaction</h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mt-8">
                            <TransactionForm members={members} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 