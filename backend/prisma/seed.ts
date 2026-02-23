import { PrismaClient, Role, EquipmentType, EquipmentStatus, HistoryAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Root user
  const rootHash = await bcrypt.hash('root1234', 10);
  const root = await prisma.user.upsert({
    where: { username: 'root' },
    update: {},
    create: {
      username: 'root',
      fullName: 'Administrador Root',
      email: 'root@intendenciasoriano.gub.uy',
      role: Role.ROOT,
      passwordHash: rootHash,
      active: true,
    },
  });

  // Sample technician
  const techHash = await bcrypt.hash('tecnico1234', 10);
  const tech = await prisma.user.upsert({
    where: { username: 'tecnico1' },
    update: {},
    create: {
      username: 'tecnico1',
      fullName: 'Carlos Pérez',
      email: 'cperez@intendenciasoriano.gub.uy',
      role: Role.TECHNICIAN,
      passwordHash: techHash,
      active: true,
    },
  });

  // Cities in Soriano department
  const mercedes = await prisma.city.upsert({
    where: { name: 'Mercedes' },
    update: {},
    create: { name: 'Mercedes' },
  });
  const dolores = await prisma.city.upsert({
    where: { name: 'Dolores' },
    update: {},
    create: { name: 'Dolores' },
  });
  const cardona = await prisma.city.upsert({
    where: { name: 'Cardona' },
    update: {},
    create: { name: 'Cardona' },
  });

  // Sections
  const secAdm = await prisma.section.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Administración', cityId: mercedes.id },
  });
  const secInf = await prisma.section.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Informática', cityId: mercedes.id },
  });
  const secDolores = await prisma.section.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Administración', cityId: dolores.id },
  });
  const secCardona = await prisma.section.upsert({
    where: { id: 4 },
    update: {},
    create: { name: 'Administración', cityId: cardona.id },
  });

  // Offices
  const offIntendente = await prisma.office.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Intendente', sectionId: secAdm.id },
  });
  const offContaduria = await prisma.office.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Contaduría', sectionId: secAdm.id },
  });
  const offSoporte = await prisma.office.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Soporte Técnico', sectionId: secInf.id },
  });
  const offDolores = await prisma.office.upsert({
    where: { id: 4 },
    update: {},
    create: { name: 'Sucursal Dolores', sectionId: secDolores.id },
  });
  const offCardona = await prisma.office.upsert({
    where: { id: 5 },
    update: {},
    create: { name: 'Sucursal Cardona', sectionId: secCardona.id },
  });

  // Sample equipment
  const equipmentData = [
    {
      code: 2001,
      type: EquipmentType.PC,
      brand: 'Dell',
      model: 'OptiPlex 7090',
      serial: 'DL7090-001',
      status: EquipmentStatus.ACTIVE,
      officeId: offIntendente.id,
      specs: { cpu: 'Intel i7-11700', ram: '16GB', disk: '512GB SSD', os: 'Windows 11' },
      notes: 'PC principal del Intendente',
      acquiredAt: new Date('2022-03-15'),
    },
    {
      code: 2002,
      type: EquipmentType.LAPTOP,
      brand: 'HP',
      model: 'EliteBook 840 G8',
      serial: 'HP840G8-002',
      status: EquipmentStatus.ACTIVE,
      officeId: offContaduria.id,
      specs: { cpu: 'Intel i5-1135G7', ram: '8GB', disk: '256GB SSD', os: 'Windows 10' },
      acquiredAt: new Date('2021-07-20'),
    },
    {
      code: 2003,
      type: EquipmentType.PRINTER,
      brand: 'HP',
      model: 'LaserJet Pro M404dn',
      serial: 'HPLJ-M404-003',
      status: EquipmentStatus.ACTIVE,
      officeId: offContaduria.id,
      specs: { tipo: 'Láser', conexion: 'Red + USB', ppm: '38' },
      acquiredAt: new Date('2021-07-20'),
    },
    {
      code: 2004,
      type: EquipmentType.PC,
      brand: 'Lenovo',
      model: 'ThinkCentre M720q',
      serial: 'LN-M720-004',
      status: EquipmentStatus.REPAIR,
      officeId: offSoporte.id,
      specs: { cpu: 'Intel i5-8400T', ram: '8GB', disk: '256GB SSD', os: 'Windows 10' },
      notes: 'En reparación — falla fuente de alimentación',
      acquiredAt: new Date('2020-01-10'),
    },
    {
      code: 2005,
      type: EquipmentType.ROUTER,
      brand: 'MikroTik',
      model: 'RB3011UiAS-RM',
      serial: 'MT-RB3011-005',
      status: EquipmentStatus.ACTIVE,
      officeId: offSoporte.id,
      specs: { puertos: '10x Gigabit', rack: '1U', ip: '192.168.1.1' },
      acquiredAt: new Date('2021-03-01'),
    },
    {
      code: 2006,
      type: EquipmentType.MODEM,
      brand: 'Cisco',
      model: 'DPC3008',
      serial: 'CS-DPC3008-006',
      status: EquipmentStatus.ACTIVE,
      officeId: offDolores.id,
      specs: { conexion: 'DOCSIS 3.0', ip: '192.168.100.1' },
      acquiredAt: new Date('2022-06-12'),
    },
    {
      code: 2007,
      type: EquipmentType.LAPTOP,
      brand: 'Dell',
      model: 'Latitude 5420',
      serial: 'DL-LAT5420-007',
      status: EquipmentStatus.INACTIVE,
      officeId: offDolores.id,
      specs: { cpu: 'Intel i5-1145G7', ram: '8GB', disk: '256GB SSD', os: 'Windows 10' },
      notes: 'Sin uso — pendiente de reasignación',
      acquiredAt: new Date('2021-11-05'),
    },
    {
      code: 2008,
      type: EquipmentType.ANTENNA,
      brand: 'Ubiquiti',
      model: 'NanoStation M5',
      serial: 'UBQ-NSM5-008',
      status: EquipmentStatus.ACTIVE,
      officeId: offCardona.id,
      specs: { frecuencia: '5GHz', potencia: '23dBm', ip: '192.168.50.2' },
      acquiredAt: new Date('2020-08-30'),
    },
    {
      code: 2009,
      type: EquipmentType.PC,
      brand: 'HP',
      model: 'ProDesk 600 G6',
      serial: 'HP-PD600-009',
      status: EquipmentStatus.ACTIVE,
      officeId: offCardona.id,
      specs: { cpu: 'Intel i5-10500', ram: '8GB', disk: '256GB SSD', os: 'Windows 11' },
      acquiredAt: new Date('2023-02-14'),
    },
    {
      code: 2010,
      type: EquipmentType.PRINTER,
      brand: 'Epson',
      model: 'EcoTank L3250',
      serial: 'EP-L3250-010',
      status: EquipmentStatus.RETIRED,
      officeId: null,
      specs: { tipo: 'Tinta', conexion: 'WiFi + USB' },
      notes: 'Dada de baja — sin tinta y unidad averiada',
      acquiredAt: new Date('2019-06-01'),
    },
  ];

  // Process manual equipment first (with history)
  for (const eq of equipmentData) {
    const existing = await prisma.equipment.findUnique({ where: { code: eq.code } });
    if (!existing) {
      const created = await prisma.equipment.create({ data: eq as any });
      await prisma.equipmentHistory.create({
        data: {
          equipmentId: created.id,
          action: HistoryAction.CREATED,
          description: `Equipo registrado en el sistema. ${eq.notes ?? ''}`.trim(),
          userId: root.id,
          toOfficeId: eq.officeId ?? undefined,
        },
      });
    }
  }

  // Bulk equipment (codes 1 to 2000)
  const types = Object.values(EquipmentType);
  const statuses = Object.values(EquipmentStatus);
  const brands = ['Dell', 'HP', 'Lenovo', 'Cisco', 'MikroTik', 'Ubiquiti', 'Epson', 'Samsung'];
  const offices = [offIntendente.id, offContaduria.id, offSoporte.id, offDolores.id, offCardona.id];

  console.log('📦 Generating bulk equipment (1-2000)...');
  for (let code = 1; code <= 2000; code++) {
    const existing = await prisma.equipment.findUnique({ where: { code } });
    if (existing) continue;

    const type = types[Math.floor(Math.random() * types.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const officeId = status === EquipmentStatus.RETIRED ? null : offices[Math.floor(Math.random() * offices.length)];

    await prisma.equipment.create({
      data: {
        code,
        type,
        brand,
        model: `Model-${Math.random().toString(36).substring(7).toUpperCase()}`,
        serial: `SN-${Math.random().toString(36).substring(4).toUpperCase()}`,
        status,
        officeId,
        specs: { generated: true },
        acquiredAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      } as any,
    });
  }

  // Extra history entries for equipment 2004 (REPAIR)
  const eq2004 = await prisma.equipment.findUnique({ where: { code: 2004 } });
  if (eq2004) {
    const hCount = await prisma.equipmentHistory.count({ where: { equipmentId: eq2004.id, action: HistoryAction.REPAIR_IN } });
    if (hCount === 0) {
      await prisma.equipmentHistory.createMany({
        data: [
          {
            equipmentId: eq2004.id,
            action: HistoryAction.REPAIR_IN,
            description: 'Ingresó a taller técnico por falla en fuente de alimentación',
            userId: tech.id,
            fromOfficeId: offContaduria.id,
            toOfficeId: offSoporte.id,
            date: new Date('2024-10-15'),
          },
        ],
      });
    }
  }

  console.log('✅ Seed completed successfully');
  console.log('   👤 root / root1234');
  console.log('   👤 tecnico1 / tecnico1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
