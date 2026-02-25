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
      id: 2001,
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
      id: 2002,
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
      id: 2003,
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
      id: 2004,
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
      id: 2005,
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
      id: 2006,
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
      id: 2007,
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
      id: 2008,
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
      id: 2009,
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
      id: 2010,
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
    await prisma.equipment.upsert({
      where: { id: eq.id },
      update: eq as any,
      create: eq as any,
    });
    
    const historyExists = await prisma.equipmentHistory.findFirst({ where: { equipmentId: eq.id } });
    if (!historyExists) {
      await prisma.equipmentHistory.create({
        data: {
          equipmentId: eq.id,
          action: HistoryAction.CREATED,
          description: `Equipo registrado en el sistema. ${eq.notes ?? ''}`.trim(),
          userId: root.id,
          toOfficeId: eq.officeId ?? undefined,
        },
      });
    }
  }

  // Realistic Data Generation Helpers
  const generateRealisticData = (id: number, type: EquipmentType) => {
    const brands: Record<string, string[]> = {
      [EquipmentType.PC]: ['Dell', 'HP', 'Lenovo', 'Acer'],
      [EquipmentType.LAPTOP]: ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS'],
      [EquipmentType.PRINTER]: ['HP', 'Epson', 'Brother', 'Samsung', 'Lexmark'],
      [EquipmentType.ROUTER]: ['Cisco', 'MikroTik', 'TP-Link', 'Ubiquiti', 'Huawei'],
      [EquipmentType.MODEM]: ['Cisco', 'Motorola', 'Arris', 'Technicolor'],
      [EquipmentType.ANTENNA]: ['Ubiquiti', 'MikroTik', 'TP-Link'],
      [EquipmentType.OTHER]: ['Genérico', 'Varios'],
    };

    const brand = brands[type!] ? brands[type!][Math.floor(Math.random() * brands[type!].length)] : 'Genérico';
    
    const models: Record<string, string[]> = {
      'Dell': ['OptiPlex 7080', 'Latitude 5410', 'Precision 3640', 'PowerEdge R640'],
      'HP': ['EliteDesk 800', 'ProBook 450', 'LaserJet Pro M404', 'ProLiant DL360'],
      'Lenovo': ['ThinkCentre M720', 'ThinkPad T14', 'IdeaCentre 5', 'System x3550'],
      'Apple': ['MacBook Pro 14', 'MacBook Air M2', 'iMac 24'],
      'Epson': ['EcoTank L3250', 'WorkForce Pro', 'SureColor'],
      'Cisco': ['Catalyst 9200', 'RV340', 'Nexus 9300', 'ISR 4331'],
      'MikroTik': ['RB4011', 'hAP ac2', 'CCR1009', 'LHG 5'],
      'Ubiquiti': ['UniFi Dream Machine', 'EdgeRouter 4', 'NanoStation 5AC', 'LiteBeam M5'],
      'Brother': ['HL-L2350DW', 'MFC-L2710DW', 'DCP-L2550DW'],
      'Samsung': ['Xpress M2020', 'ProXpress M4020'],
      'TP-Link': ['Archer AX50', 'Omada EAP245', 'SafeStream TL-R605'],
      'Genérico': ['Modelo Base', 'Accesorio'],
      'Varios': ['Misceláneo'],
    };

    const model = (models[brand] || [`Model-${type}-${id}`])[Math.floor(Math.random() * (models[brand]?.length || 1))];

    const generateSpecs = (type: EquipmentType) => {
      switch (type) {
        case EquipmentType.PC:
        case EquipmentType.LAPTOP:
          return {
            cpu: ['Intel i3-10100', 'Intel i5-11400', 'Intel i7-12700', 'AMD Ryzen 5 5600', 'AMD Ryzen 7 5700X'][Math.floor(Math.random() * 5)],
            ram: ['8GB', '16GB', '32GB'][Math.floor(Math.random() * 3)],
            disk: ['256GB SSD', '512GB SSD', '1TB NVMe', '1TB HDD'][Math.floor(Math.random() * 4)],
            os: ['Windows 10 Pro', 'Windows 11 Pro', 'Ubuntu 22.04', 'macOS Sonoma'][Math.floor(Math.random() * 4)]
          };
        case EquipmentType.PRINTER:
          return {
            tecnologia: ['Láser', 'Inyección de tinta', 'Térmica'][Math.floor(Math.random() * 3)],
            color: Math.random() > 0.5 ? 'Color' : 'Monocromática',
            conexion: ['USB', 'Red (RJ45)', 'WiFi', 'USB + Red'][Math.floor(Math.random() * 4)],
            ppm: [20, 30, 40, 55][Math.floor(Math.random() * 4)] + ' ppm'
          };
        case EquipmentType.ROUTER:
        case EquipmentType.MODEM:
          return {
            puertos: [4, 8, 16, 24, 48][Math.floor(Math.random() * 5)] + ' Puertos',
            velocidad: ['100 Mbps', '1 Gbps', '10 Gbps'][Math.floor(Math.random() * 3)],
            wifi: Math.random() > 0.3 ? '802.11ax (WiFi 6)' : '802.11ac',
            backbone: Math.random() > 0.7 ? 'Fibra Óptica' : 'Cobre'
          };
        case EquipmentType.ANTENNA:
          return {
            frecuencia: ['2.4 GHz', '5 GHz', '60 GHz'][Math.floor(Math.random() * 3)],
            ganancia: [13, 23, 30][Math.floor(Math.random() * 3)] + ' dBi',
            rango: ['5km', '15km', '25km'][Math.floor(Math.random() * 3)],
            ip: `10.10.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`
          };
        default:
          return { notas: 'Especificaciones generales' };
      }
    };

    return {
      brand,
      model,
      serial: `${brand.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      specs: generateSpecs(type)
    };
  };

  // Bulk equipment (ids 1 to 2000)
  const types = Object.values(EquipmentType);
  const statuses = Object.values(EquipmentStatus);
  const officesList = [offIntendente.id, offContaduria.id, offSoporte.id, offDolores.id, offCardona.id];

  console.log('📦 Generating bulk equipment (1-2000) with history chains...');
  for (let id = 1; id <= 2000; id++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const officeId = status === EquipmentStatus.RETIRED ? null : officesList[Math.floor(Math.random() * officesList.length)];
    const realistic = generateRealisticData(id, type);
    const acquiredAt = new Date(Date.now() - Math.floor(Math.random() * 10000000000));

    await prisma.equipment.upsert({
      where: { id },
      update: {
        type,
        status,
        officeId,
        ...realistic,
        acquiredAt,
      } as any,
      create: {
        id,
        type,
        status,
        officeId,
        ...realistic,
        acquiredAt,
      } as any,
    });

    // History chain generation
    const historyEntries: any[] = [];
    
    // 1. Initial creation
    historyEntries.push({
      equipmentId: id,
      action: HistoryAction.CREATED,
      description: 'Ingreso inicial al inventario principal.',
      userId: root.id,
      date: new Date(acquiredAt.getTime() + 86400000), // +1 day
      toOfficeId: officeId || undefined,
    });

    // 2. Random transfers (30% chance)
    if (Math.random() > 0.7) {
      const pastOffice = officesList[Math.floor(Math.random() * officesList.length)];
      if (pastOffice !== officeId) {
        historyEntries.push({
          equipmentId: id,
          action: HistoryAction.TRANSFER,
          description: 'Traslado programado por rotación de personal.',
          userId: tech.id,
          date: new Date(acquiredAt.getTime() + 1000000000),
          fromOfficeId: pastOffice,
          toOfficeId: officeId || undefined,
        });
      }
    }

    // 3. Random repairs (20% chance)
    if (Math.random() > 0.8) {
      const repairReasons = [
        'Falla en fuente de poder', 
        'Limpieza preventiva y cambio de pasta térmica',
        'Pantalla con píxeles muertos',
        'No enciende - posible falla de placa madre',
        'Atasco de papel recurrente',
        'Configuración de red pendiente'
      ];
      const resolution = ['Reparado con cambio de piezas', 'Mantenimiento completado', 'Ajustes de software realizados'][Math.floor(Math.random() * 3)];

      const repairDate = new Date(acquiredAt.getTime() + 2000000000);
      
      historyEntries.push({
        equipmentId: id,
        action: HistoryAction.REPAIR_IN,
        description: `Ingreso a soporte: ${repairReasons[Math.floor(Math.random() * repairReasons.length)]}`,
        userId: tech.id,
        date: repairDate,
        fromOfficeId: officeId || undefined,
        toOfficeId: offSoporte.id,
      });

      // If not currently in REPAIR, add REPAIR_OUT
      if (status !== EquipmentStatus.REPAIR) {
        historyEntries.push({
          equipmentId: id,
          action: HistoryAction.REPAIR_OUT,
          description: `Reparación finalizada: ${resolution}`,
          userId: tech.id,
          date: new Date(repairDate.getTime() + 259200000), // +3 days
          fromOfficeId: offSoporte.id,
          toOfficeId: officeId || undefined,
        });
      }
    }

    // Upsert history (to avoid duplicates if re-running)
    for (const h of historyEntries) {
      const hash = `${id}-${h.action}-${h.date.getTime()}`;
      // Note: equipmentId is used here as a simple filter, we don't have a unique key for history other than ID
      // But since we are seeding, we'll just clear or check
      const exists = await prisma.equipmentHistory.findFirst({
        where: { equipmentId: id, action: h.action, date: h.date }
      });
      if (!exists) {
        await prisma.equipmentHistory.create({ data: h as any });
      }
    }
  }

  // Extra specific cases
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
