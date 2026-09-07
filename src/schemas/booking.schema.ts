import { z } from "zod";

export const BookingSchema = z.object({
  serviceId: z.string().uuid("Service invalide"),
  startsAt: z.string().datetime({ message: "Format de date invalide (ISO 8601 requis)" }),
  clientName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  clientEmail: z.string().email("Email invalide"),
  clientPhone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Numéro de téléphone français invalide"),
  
  // Les 3 nouveaux champs d'adresse :
  clientAddress: z.string().min(5, "L'adresse est requise"),
  clientZipCode: z.string().regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres)"),
  clientCity: z.string().min(2, "La ville est requise"),
  
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions pour la réservation",
  }),
  stripeIntentId: z.string().optional(),
  promoCodeUsed: z.string().optional(),
});

export type BookingFormData = z.infer<typeof BookingSchema>;