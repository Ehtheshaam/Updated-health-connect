import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding providers...');

  await prisma.provider.deleteMany();

  await prisma.provider.createMany({
    data: [
      {
        hospital: 'Fortis Hospital, Mohali',
        doctor: 'Dr. Meera Sharma',
        specialty: 'General Medicine',
        city: 'Mohali',
        fee: 'Rs. 600 consult',
      },
      {
        hospital: 'PGIMER, Chandigarh',
        doctor: 'Dr. Arjun Patel',
        specialty: 'Internal Medicine',
        city: 'Chandigarh',
        fee: 'Rs. 500 consult',
      },
      {
        hospital: 'Dayanand Medical College',
        doctor: 'Dr. Nisha Verma',
        specialty: 'Women Health',
        city: 'Ludhiana',
        fee: 'Rs. 700 consult',
      },
      {
        hospital: 'Homi Bhabha Cancer Hospital',
        doctor: 'Dr. Sandeep Gill',
        specialty: 'Specialist Care',
        city: 'Sangrur',
        fee: 'Rs. 650 consult',
      },
    ],
  });

  console.log('✅ Seeded 4 providers.');

  // Create demo user
  const demoPhone = '1234567890';
  let demoUser = await prisma.user.findUnique({ where: { phone: demoPhone } });
  if (!demoUser) {
    const passwordHash = await bcrypt.hash('password', 10);
    demoUser = await prisma.user.create({
      data: {
        name: 'Demo Patient',
        phone: demoPhone,
        passwordHash,
        age: '30',
        gender: 'male',
        address: '123 Health Street',
      },
    });
    console.log(`✅ Seeded demo user: ${demoPhone} / password`);
  }

  // Clear existing records for demo user to avoid duplicates on multiple runs
  await prisma.healthRecord.deleteMany({ where: { userId: demoUser.id } });
  await prisma.prescription.deleteMany({ where: { userId: demoUser.id } });

  await prisma.healthRecord.createMany({
    data: [
      {
        userId: demoUser.id,
        type: 'Blood Test',
        date: new Date().toISOString(),
        doctor: 'Dr. Arjun Patel',
        results: 'Hemoglobin: 14.2 g/dL, WBC: 6.5 x10^3/uL',
      },
      {
        userId: demoUser.id,
        type: 'X-Ray (Chest)',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        doctor: 'Dr. Meera Sharma',
        results: 'No active lung lesions or pleural effusion seen.',
      }
    ]
  });
  console.log('✅ Seeded 2 health records.');

  await prisma.prescription.create({
    data: {
      userId: demoUser.id,
      doctor: 'Dr. Arjun Patel',
      date: new Date().toISOString(),
      medicines: JSON.stringify([
        { name: 'Paracetamol 500mg', dosage: '1 tablet twice a day', duration: '3 days' },
        { name: 'Amoxicillin 250mg', dosage: '1 capsule three times a day', duration: '5 days' }
      ]),
      instructions: 'Take medicines after meals. Drink plenty of water.',
    }
  });
  console.log('✅ Seeded 1 prescription.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
