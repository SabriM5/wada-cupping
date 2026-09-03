import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendReminderEmail } from '@/lib/mailer';

export async function GET(request: Request) {
  // Sécurité : S'assurer que la requête provient bien du planificateur Vercel
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Calculer la fenêtre de temps (entre H+23 et H+24 pour envoyer un rappel 24h avant)
    const now = new Date();
    const targetStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // +23h
    const targetEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);   // +24h

    // 2. Trouver tous les RDV confirmés dans cette fenêtre
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        status: 'CONFIRMED',
        startsAt: {
          gte: targetStart,
          lt: targetEnd,
        },
      },
      include: { service: true }
    });

    // 3. Envoyer les emails
    for (const appt of upcomingAppointments) {
      await sendReminderEmail(appt, appt.service);
    }

    return NextResponse.json({ success: true, count: upcomingAppointments.length });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}