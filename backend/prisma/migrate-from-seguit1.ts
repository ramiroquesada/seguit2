/**
 * migrate-from-seguit1.ts
 *
 * Migrates data from a Seguit 1.0 MySQL dump (db_seguit1.sql) to Seguit 2.0 (PostgreSQL via Prisma).
 *
 * Updated to handle dynamic Category model.
 */

import { PrismaClient, Role, EquipmentStatus, HistoryAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseInsertValues(sql: string, tableName: string): string[][] {
    const allRows: string[][] = [];
    const blockRegex = new RegExp(`INSERT INTO \`${tableName}\`[^;]*?VALUES\\s*([\\s\\S]*?);`, 'gi');
    let blockMatch: RegExpExecArray | null;

    while ((blockMatch = blockRegex.exec(sql)) !== null) {
        const valuesBlock = blockMatch[1];
        const rowRegex = /\(([^)]*(?:'[^']*'[^)]*)*)\)/g;
        let rowMatch: RegExpExecArray | null;
        while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
            const raw = rowMatch[1];
            const cols = splitRow(raw);
            allRows.push(cols);
        }
    }
    return allRows;
}

function splitRow(row: string): string[] {
    const cols: string[] = [];
    let current = '';
    let inStr = false;
    for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === "'" && !inStr) { inStr = true; continue; }
        if (ch === "'" && inStr) {
            if (row[i + 1] === "'") { current += "'"; i++; continue; }
            inStr = false; continue;
        }
        if (ch === ',' && !inStr) { cols.push(current.trim()); current = ''; continue; }
        current += ch;
    }
    cols.push(current.trim());
    return cols;
}

function str(v: any): string {
    if (v === undefined || v === null || v === 'NULL') return '';
    return String(v).trim();
}
function num(v: any): number {
    if (v === undefined || v === null || v === 'NULL') return 0;
    const val = parseInt(String(v).trim(), 10);
    return isNaN(val) ? 0 : val;
}

// ─── Mapping Names ───────────────────────────────────────────────────────────

const tipoNombres: Record<number, string> = {
    1: 'PC', 2: 'Laptop', 3: 'Teléfono IP', 4: 'Impresora',
    5: 'Tablet', 6: 'Monitor', 7: 'Router', 9: 'Modem', 10: 'Antena',
    11: 'Celular', 12: 'Reloj', 13: 'Lector Cód. Barras', 14: 'Cámara Web',
    15: 'Kit Parlantes', 16: 'Auriculares', 17: 'DVR', 18: 'NVR', 19: 'XVR',
    21: 'Switch', 23: 'Fotocopiadora', 24: 'Switch Raqueable', 25: 'Antena WiFi USB',
    26: 'Cámara CVI', 27: 'Cámara IP', 28: 'UPS', 29: 'Batería UPS',
    30: 'Gabinete CCTV', 31: 'Rack', 33: 'Adaptador PoE', 34: 'Disco Externo',
    35: 'Patchera Raqueable',
};

function mapHistoryObservacion(observacion: string): HistoryAction {
    const obs = observacion.toLowerCase();
    if (obs.includes('creo') || obs.includes('creó') || obs.includes('creado') || obs.includes('ingres')) {
        return HistoryAction.CREATED;
    }
    if (obs.includes('traslad') || obs.includes('envio') || obs.includes('envió') || obs.includes('propietario') || obs.includes('transfer')) {
        return HistoryAction.TRANSFER;
    }
    if (obs.includes('reparacion') || obs.includes('service') || obs.includes('reparación') || obs.includes('entra') || obs.includes('ingreso a soporte')) {
        return HistoryAction.REPAIR_IN;
    }
    if (obs.includes('devuelto') || obs.includes('sale') || obs.includes('egreso') || obs.includes('reparado')) {
        return HistoryAction.REPAIR_OUT;
    }
    return HistoryAction.NOTE;
}

function detectCity(locationName: string): string {
    const name = locationName.trim();
    if (name.startsWith('Dolores -') || name === 'Dolores') return 'Dolores';
    if (name.startsWith('Cardona -') || name === 'Cardona') return 'Cardona';
    if (name.startsWith('Palmar') || name === 'Palmar') return 'Palmar';
    if (name.startsWith('Risso') || name === 'Risso') return 'Risso';
    if (name.startsWith('Junta Local Sacachispas') || name === 'Sacachispas') return 'Sacachispas';
    if (name.startsWith('Egana') || name.startsWith('Egaña')) return 'Egaña';
    if (name.startsWith('Villa Soriano')) return 'Villa Soriano';
    if (name.startsWith('Santa Catalina')) return 'Santa Catalina';
    if (name.startsWith('Municipio - Rodo') || name === 'Rodo') return 'Rodo';
    if (name.startsWith('Municipio - Palmitas')) return 'Palmitas';
    if (name.startsWith('Cda Nieto') || name.startsWith('Cañada Nieto')) return 'Cañada Nieto';
    return 'Mercedes';
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🚀 Iniciando migración de Seguit 1.0 → 2.0 (Con Categorías Dinámicas)...\n');

    const sqlPath = path.resolve(__dirname, '../../db_seguit1.sql');
    if (!fs.existsSync(sqlPath)) throw new Error(`No se encontró el archivo SQL en: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'latin1');

    const ubicaciones = parseInsertValues(sql, 'ubicacion');
    const equipos = parseInsertValues(sql, 'equipo');
    const historialRows = parseInsertValues(sql, 'historial');
    const usuarios = parseInsertValues(sql, 'usuario');

    console.log('\n🗑️  Limpiando tablas...');
    await prisma.equipmentHistory.deleteMany({});
    await prisma.equipment.deleteMany({});
    await prisma.equipmentModel.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.office.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.city.deleteMany({});
    await prisma.user.deleteMany({ where: { username: { not: 'root' } } });

    // ── 1. Create Categories ──────────────────────────────────────────────────
    console.log('\n📂 Creando categorías...');
    const categoryMap = new Map<string, number>(); // name -> id
    const processedTypes = new Set<string>();

    for (const id in tipoNombres) {
        const name = tipoNombres[id];
        if (!processedTypes.has(name)) {
            const cat = await prisma.category.create({ data: { name } });
            categoryMap.set(name, cat.id);
            processedTypes.add(name);
        }
    }
    // Also ensure "Otro" exists if not already there
    if (!categoryMap.has('Otro')) {
        const cat = await prisma.category.create({ data: { name: 'Otro' } });
        categoryMap.set('Otro', cat.id);
    }

    // ── 2. Create cities & sections & offices ─────────────────────────────────
    console.log('\n🏙️  Creando ciudades, secciones y oficinas...');
    const cityNames = new Set<string>();
    for (const row of ubicaciones) cityNames.add(detectCity(str(row[1])));

    const cityMap = new Map<string, number>();
    for (const cityName of cityNames) {
        const city = await prisma.city.create({ data: { name: cityName } });
        cityMap.set(cityName, city.id);
    }

    const sectionMap = new Map<string, number>();
    for (const [cityName, cityId] of cityMap) {
        const section = await prisma.section.create({ data: { name: 'General', cityId } });
        sectionMap.set(cityName, section.id);
    }

    const officeMap = new Map<number, number>();
    const officeNameMap = new Map<string, number>();
    for (const row of ubicaciones) {
        const oldId = num(row[0]);
        const officeName = str(row[1]);
        const cityName = detectCity(officeName);
        const sectionId = sectionMap.get(cityName)!;
        const office = await prisma.office.create({ data: { name: officeName, sectionId } });
        officeMap.set(oldId, office.id);
        officeNameMap.set(officeName.toLowerCase(), office.id);
    }

    // ── 3. Migrate users ──────────────────────────────────────────────────────
    console.log('\n👥 Migrando usuarios...');
    const fichaToUserId = new Map<string, number>();
    const existingRoot = await prisma.user.findFirst({ where: { username: 'root' } });
    if (!existingRoot) {
        const rootHash = await bcrypt.hash('root1234', 10);
        const root = await prisma.user.create({ data: { username: 'root', fullName: 'Admin', role: Role.ROOT, passwordHash: rootHash } });
        fichaToUserId.set('9999', root.id);
    } else fichaToUserId.set('9999', existingRoot.id);

    for (const row of usuarios) {
        if (row.length < 6) continue;
        const username = str(row[3]);
        const passwordHash = await bcrypt.hash(username, 10);
        const user = await prisma.user.upsert({
            where: { username },
            update: {},
            create: { username, fullName: str(row[1]), role: num(row[5]) === 2 ? Role.TECHNICIAN : Role.ROOT, passwordHash, active: true }
        });
        fichaToUserId.set(username, user.id);
    }

    // ── 4. Migrate equipment ──────────────────────────────────────────────────
    console.log('\n🖥️  Migrando equipos...');
    const serieToEquipId = new Map<number, number>();
    let equipCount = 0;

    for (const row of equipos) {
        const eqId = num(row[0]);
        const serie = num(row[1]);
        const modelo = str(row[2]);
        const ubicacionId = num(row[3]);
        const tipoId = num(row[5]);
        const ip = str(row[8]);

        const catName = tipoNombres[tipoId] || 'Otro';
        const categoryId = categoryMap.get(catName)!;
        const officeId = officeMap.get(ubicacionId) || null;

        const specs: Record<string, string> = { tipoOld: catName };
        if (ip) specs['ip'] = ip;

        await prisma.equipment.create({
            data: {
                number: eqId,
                categoryId,
                brand: modelo || 'Genérico',
                model: modelo || 'Sin modelo',
                serial: serie > 0 ? String(serie) : null,
                status: EquipmentStatus.ACTIVE,
                officeId,
                specs,
                notes: str(row[7]) || null,
            },
        });
        serieToEquipId.set(serie, eqId);
        equipCount++;
    }

    // ── 5. Migrate history ────────────────────────────────────────────────────
    console.log('\n📜 Migrando historial...');
    let histCount = 0;
    const defaultUserId = (await prisma.user.findFirst({ where: { username: 'root' } }))?.id || null;

    for (const row of historialRows) {
        const serie = num(row[1]);
        const equipId = serieToEquipId.get(serie);
        if (!equipId) continue;

        const dateStr = str(row[3]);
        const action = mapHistoryObservacion(str(row[4]));
        const description = [str(row[4]), str(row[5])].filter(Boolean).join(' — ');
        const userId = fichaToUserId.get(str(row[6])) ?? defaultUserId;
        const toOfficeId = officeNameMap.get(str(row[2]).toLowerCase()) ?? null;

        let historyDate = new Date(dateStr);
        if (action === HistoryAction.CREATED) {
            historyDate = new Date(historyDate.getTime() - 60 * 60 * 1000); // Shift back 1h
        }

        await prisma.equipmentHistory.create({
            data: { equipmentId: equipId, action, description, userId, toOfficeId, date: historyDate }
        });
        histCount++;
    }

    console.log(`\n✅ Migración completada: ${equipCount} equipos, ${histCount} registros de historial.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
