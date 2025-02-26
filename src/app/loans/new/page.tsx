import { prisma } from '@/lib/prisma';
import LoanForm from '@/components/LoanForm';

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

export default async function NewLoanPage() {
    const members = await getMembers();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Issue New Loan</h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="mt-8">
                            <LoanForm members={members} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 