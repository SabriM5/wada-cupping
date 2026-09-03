// src/services/availability.service.ts
import prisma from "@/lib/prisma";
import { addMinutes, isBefore, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export async function getAvailableSlots(dateStr: string, serviceId: string) {
  const targetDate = new Date(dateStr); // Ex: "2026-09-15"
  const dayOfWeek = targetDate.getDay();

  // 1. Récupérer les paramètres
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  const practitioner = await prisma.practitioner.findFirst();
  if (!practitioner) return [];

  const workingHours = await prisma.availability.findFirst({ 
    where: { 
      dayOfWeek, 
      isActive: true,
      practitionerId: practitioner.id
    } 
  });

  // 2. Calculer le début et la fin de la journée en objets Date
  const [startHour, startMin] = workingHours.startTime.split(":").map(Number);
  const [endHour, endMin] = workingHours.endTime.split(":").map(Number);
  
  let currentSlot = new Date(targetDate);
  currentSlot.setHours(startHour, startMin, 0, 0);
  
  const endOfDayLimit = new Date(targetDate);
  endOfDayLimit.setHours(endHour, endMin, 0, 0);

  // 3. Récupérer tout ce qui bloque sur cette journée
  const startOfTargetDay = startOfDay(targetDate);
  const endOfTargetDay = endOfDay(targetDate);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: startOfTargetDay, lte: endOfTargetDay },
      status: { not: "CANCELLED" } // On ignore les RDV annulés
    }
  });

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: { startsAt: { gte: startOfTargetDay, lte: endOfTargetDay } }
  });

  // 4. Générer les créneaux
  const availableSlots: Date[] = [];
  const now = new Date();

  while (isBefore(currentSlot, endOfDayLimit)) {
    const slotEnd = addMinutes(currentSlot, service.durationMin);
    const slotEndWithBuffer = addMinutes(slotEnd, service.bufferMin); // Temps de trajet

    if (isBefore(endOfDayLimit, slotEnd)) break; // Dépasse l'heure de fin

    // Vérifier si la date est passée
    if (isBefore(currentSlot, now)) {
      currentSlot = addMinutes(currentSlot, 15);
      continue;
    }

    // Fonction utilitaire pour vérifier les chevauchements
    const isOverlapping = (events: any[]) => events.some(event => {
       // On vérifie si notre créneau + trajet empiète sur un événement existant
       return (
         (currentSlot >= event.startsAt && currentSlot < event.endsAt) ||
         (slotEndWithBuffer > event.startsAt && slotEndWithBuffer <= event.endsAt) ||
         (currentSlot <= event.startsAt && slotEndWithBuffer >= event.endsAt)
       );
    });

    if (!isOverlapping(existingAppointments) && !isOverlapping(blockedSlots)) {
      availableSlots.push(new Date(currentSlot));
    }

    // Avancer par pas de 30 minutes
    currentSlot = addMinutes(currentSlot, 30);
  }

  return availableSlots;
}