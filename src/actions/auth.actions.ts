"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

export async function registerCustomer(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const parsed = registerSchema.parse(data);

    const existingUser = await prisma.user.findUnique({ 
      where: { email: parsed.email } 
    });

    const passwordHash = await bcrypt.hash(parsed.password, 12);

    // CAS 1 : La cliente a déjà réservé (Compte fantôme sans mot de passe)
    if (existingUser) {
      if (!existingUser.passwordHash || existingUser.passwordHash === "") {
        await prisma.user.update({
          where: { email: parsed.email },
          data: { passwordHash }
        });
        return { success: true };
      } else {
        return { error: "Un compte sécurisé existe déjà avec cet e-mail." };
      }
    }

    // CAS 2 : Toute nouvelle cliente (Création complète)
    await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        role: "CUSTOMER",
        customerProfile: {
          create: {
            firstName: parsed.firstName,
            lastName: parsed.lastName,
            phone: "", address: "", city: "", zipCode: ""
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la validation. Vérifiez vos informations." };
  }
}