import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const members = await prisma.member.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        return NextResponse.json(members);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch members' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { name, contactNumber, email } = data;

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        const member = await prisma.member.create({
            data: {
                name,
                contactNumber,
                email,
            },
        });

        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create member' },
            { status: 500 }
        );
    }
} 