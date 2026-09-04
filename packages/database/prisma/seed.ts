import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

async function main() {
  console.log('🌱 Starting Waani database seed...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { id: 'org_waani_default' },
    update: {},
    create: {
      id: 'org_waani_default',
      name: 'Acme Health & Tech',
    },
  });
  console.log('✅ Created Organization:', org.name);

  // 2. Create User
  const passwordHash = await bcrypt.hash('waani12345', 10);
  const user = await prisma.user.upsert({
    where: { email: 'developer@waani.ai' },
    update: {},
    create: {
      id: 'usr_waani_dev',
      email: 'developer@waani.ai',
      name: 'Dr. Dev Sharma',
      passwordHash,
      organizationId: org.id,
    },
  });
  console.log('✅ Created User:', user.email);

  // 3. Create Default API Key
  const rawKey = 'waani_live_demo123456789abcdef';
  const keyHash = hashApiKey(rawKey);
  const apiKey = await prisma.apiKey.upsert({
    where: { keyHash },
    update: {},
    create: {
      id: 'key_demo_01',
      organizationId: org.id,
      name: 'Default Development Key',
      keyPrefix: 'waani_live_demo123...',
      keyHash,
    },
  });
  console.log('✅ Created API Key:', apiKey.keyPrefix, '(Raw:', rawKey, ')');

  // 4. Create Demo Agent: Clinic Receptionist
  const agent = await prisma.agent.upsert({
    where: { id: 'agent_clinic_receptionist' },
    update: {},
    create: {
      id: 'agent_clinic_receptionist',
      organizationId: org.id,
      name: 'Clinic Receptionist',
      language: 'hi-IN',
      greeting: 'Namaste, main clinic assistant hoon. Main aapki kya madad kar sakti hoon?',
      instructions: `You are a professional clinic receptionist for Dr. Sharma's Clinic.
Your responsibilities:
- Greet callers warmly in Hindi or Hinglish.
- Understand their appointment request.
- Answer basic clinic questions (Clinic hours: Mon-Sat 10 AM - 7 PM).
- Collect appointment information (preferred doctor, date, and time).
- Keep responses concise, natural, and helpful. Always respond in Hindi/Hinglish unless the user speaks English.`,
      llmProvider: 'gemini',
      llmModel: 'gemini-2.5-flash',
      sttProvider: 'sarvam',
      ttsProvider: 'sarvam',
      voiceId: 'meera',
      status: 'active',
    },
  });
  console.log('✅ Created Agent:', agent.name);

  // 5. Create Phone Number
  const phone = await prisma.phoneNumber.upsert({
    where: { phoneNumber: '+918000123456' },
    update: {},
    create: {
      id: 'phone_demo_01',
      organizationId: org.id,
      phoneNumber: '+918000123456',
      provider: 'exotel',
      providerId: 'exo_num_98765',
      agentId: agent.id,
      status: 'active',
    },
  });
  console.log('✅ Created Phone Number:', phone.phoneNumber);

  // 6. Create Demo Call and Turns for History
  const existingCall = await prisma.call.findFirst({
    where: { organizationId: org.id },
  });

  if (!existingCall) {
    const call = await prisma.call.create({
      data: {
        id: 'call_demo_clinic_01',
        organizationId: org.id,
        agentId: agent.id,
        phoneNumberId: phone.id,
        direction: 'inbound',
        fromNumber: '+919876543210',
        toNumber: '+918000123456',
        status: 'completed',
        startedAt: new Date(Date.now() - 142000),
        answeredAt: new Date(Date.now() - 138000),
        endedAt: new Date(),
        durationSeconds: 142,
        turns: {
          create: [
            {
              sequence: 1,
              speaker: 'assistant',
              text: 'Namaste, main clinic assistant hoon. Main aapki kya madad kar sakti hoon?',
              latencyMs: 320,
            },
            {
              sequence: 2,
              speaker: 'user',
              text: 'Mujhe kal appointment chahiye.',
              latencyMs: 410,
            },
            {
              sequence: 3,
              speaker: 'assistant',
              text: 'Bilkul. Kis doctor se appointment chahiye?',
              latencyMs: 350,
            },
            {
              sequence: 4,
              speaker: 'user',
              text: 'Dr Sharma.',
              latencyMs: 380,
            },
            {
              sequence: 5,
              speaker: 'assistant',
              text: 'Dr Sharma ke saath kal 5 baje appointment available hai. Kya main book kar doon?',
              latencyMs: 340,
            },
          ],
        },
        events: {
          create: [
            { eventName: 'call.created' },
            { eventName: 'call.ringing' },
            { eventName: 'call.answered' },
            { eventName: 'call.connected' },
            { eventName: 'call.completed' },
          ],
        },
      },
    });
    console.log('✅ Created Demo Call:', call.id);
  }

  console.log('✨ Waani Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
