"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateAppointmentStatus(appointmentId: string, newStatus: "CONFIRMED" | "COMPLETED" | "CANCELLED") {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Non autorisé");

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: newStatus }
  });
  
  revalidatePath("/admin/calendrier");
}

export async function blockTimeSlot(startsAt: Date, endsAt: Date, reason: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Non autorisé");

  const practitioner = await prisma.practitioner.findFirst();
  if (!practitioner) throw new Error("Praticien introuvable");

  await prisma.blockedSlot.create({
    data: { 
       startsAt, 
       endsAt, 
       reason,
      practitionerId: practitioner.id 
    }
  });
  
  revalidatePath("/admin/calendrier");
}