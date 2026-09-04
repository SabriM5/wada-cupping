import prisma from "@/lib/prisma";
import { addMinutes, isBefore, startOfDay, endOfDay } from "date-fns";

// 1. LA SOLUTION : Cette fonction force le calcul sur le fuseau de Paris
function createParisDate(dateStr: string, timeStr: string) {
  // On crée la date en heure universelle (Z)
  const dateUTC = new Date(`${dateStr}T${timeStr}:00Z`);
  
  // On demande à Javascript le décalage exact de Paris à cette date (Été = +2h, Hiver = +1h)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    hourCycle: 'h23'
  });
  
  const parts = formatter.formatToParts(new Date(`${dateStr}T12:00:00Z`));
  const parisHour = parseInt(parts.find(p => p.type === 'hour')?.value || "12");
  const offset = parisHour - 12; 
  
  // On soustrait ce décalage pour que le navigateur du client affiche la bonne heure
  dateUTC.setUTCHours(dateUTC.getUTCHours() - offset);
  return dateUTC;
}

export async function getAvailableSlots(dateStr: string, serviceId: string) {
  const targetDate = new Date(dateStr); 
  const dayOfWeek = targetDate.getDay();

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return []; 

  const practitioner = await prisma.practitioner.findFirst();
  if (!practitioner) return [];

  const workingHours = await prisma.availability.findFirst({
     where: {
       dayOfWeek,
       isActive: true,
       practitionerId: practitioner.id
     }
   });
   
  if (!workingHours) return []; 

  // 2. ON UTILISE LA FONCTION POUR LE DÉBUT ET LA FIN
  let currentSlot = createParisDate(dateStr, workingHours.startTime);
  const endOfDayLimit = createParisDate(dateStr, workingHours.endTime);

  const startOfTargetDay = startOfDay(targetDate);
  const endOfTargetDay = endOfDay(targetDate);
  
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: startOfTargetDay, lte: endOfTargetDay },
      status: { not: "CANCELLED" }
    }
  });

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: { startsAt: { gte: startOfTargetDay, lte: endOfTargetDay } }
  });

  const availableSlots: Date[] = [];
  const now = new Date();

  while (isBefore(currentSlot, endOfDayLimit)) {
    const slotEnd = addMinutes(currentSlot, service.durationMin);
    const slotEndWithBuffer = addMinutes(slotEnd, service.bufferMin); 

    if (isBefore(endOfDayLimit, slotEnd)) break; 

    if (isBefore(currentSlot, now)) {
      currentSlot = addMinutes(currentSlot, 15);
      continue;
    }

    const isOverlapping = (events: any[]) => events.some(event => {
       return (
         (currentSlot >= event.startsAt && currentSlot < event.endsAt) ||
         (slotEndWithBuffer > event.startsAt && slotEndWithBuffer <= event.endsAt) ||
         (currentSlot <= event.startsAt && slotEndWithBuffer >= event.endsAt)
       );
    });

    if (!isOverlapping(existingAppointments) && !isOverlapping(blockedSlots)) {
      availableSlots.push(new Date(currentSlot));
    }

    currentSlot = addMinutes(currentSlot, 30);
  }

  return availableSlots;
}