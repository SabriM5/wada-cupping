import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// Configuration de l'adaptateur pour Prisma V7
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Démarrage de l\'initialisation du catalogue WADA...');

  // 1. Nettoyage sécurisé de l'ancienne base de données de test
  await prisma.appointment.deleteMany();
  await prisma.blockedSlot.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.service.deleteMany();
  await prisma.practitioner.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Anciennes données de test supprimées.');

  // 2. Création de votre compte Administratrice WADA
  const passwordHash = await bcrypt.hash('WadaAdmin2026!', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'wada.cupping@gmail.com', // L'email de contact officiel
      passwordHash,
      role: 'ADMIN',
    },
  });

  const practitioner = await prisma.practitioner.create({
    data: {
      userId: adminUser.id,
      firstName: 'Amira',
      lastName: 'Messaoudi',
      phone: '0600000000',
    },
  });

  // 3. Configuration de vos VRAIES disponibilités (Horaires Canva)
  // Lundi au Vendredi : 19h00 - 21h00
  const weekDays = [1, 2, 3, 4, 5];
  for (const day of weekDays) {
    await prisma.availability.create({
      data: { practitionerId: practitioner.id, dayOfWeek: day, startTime: '19:00', endTime: '21:00' }
    });
  }
  
  // Samedi et Dimanche : 09h00 - 21h00
  await prisma.availability.create({
    data: { practitionerId: practitioner.id, dayOfWeek: 6, startTime: '09:00', endTime: '21:00' }
  });
  await prisma.availability.create({
    data: { practitionerId: practitioner.id, dayOfWeek: 0, startTime: '09:00', endTime: '21:00' }
  });

  console.log('🕒 Horaires WADA configurés.');

  // 4. Intégration des Rituels WADA
  const services = [
    {
      name: "Rituel Décompression & Récupération",
      description: "Dédié aux tensions musculaires profondes.",
      durationMin: 60,
      bufferMin: 30, // Temps d'installation / échange inclus (1h30 de blocage au total)
      price: 80,
      isActive: true,
    },
    {
      name: "Rituel Féminité, Équilibre & Confort Pelvien",
      description: "Accompagnement doux dédié au bien-être gynécologique.",
      durationMin: 60,
      bufferMin: 30,
      price: 90,
      isActive: true,
    },
    {
      name: "Rituel Glow & Lift Facial",
      description: "Soin d’exception avec mini-ventouses en verre médical.",
      durationMin: 60,
      bufferMin: 30,
      price: 70,
      isActive: true,
    },
    {
      name: "L'Expérience Sur-Mesure Haut de Gamme",
      description: "Soin Combo Grand Cru WADA. Combinaison sur-mesure de deux rituels.",
      durationMin: 90,
      bufferMin: 30, // 2h de blocage au total
      price: 110,
      isActive: true,
    }
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
  }

  console.log('✨ Les 4 Rituels WADA ont été ajoutés avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });