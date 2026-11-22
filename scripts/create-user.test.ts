import { describe, expect, it } from 'vitest';
import { buildInsertSql, CODE_ALPHABET, CODE_LENGTH, generateCode, parseArgs, sha256Hex, sqlString } from './create-user';

describe('generateCode', () => {
  it('fait 8 caracteres, tous dans un alphabet sans ambigus', () => {
    expect(CODE_LENGTH).toBe(8);
    for (let i = 0; i < 200; i++) {
      const c = generateCode();
      expect(c).toHaveLength(8);
      for (const ch of c) expect(CODE_ALPHABET).toContain(ch);
    }
    for (const bad of '01OIL') expect(CODE_ALPHABET).not.toContain(bad);
  });

  it('couvre tout l alphabet sans biais de modulo (octets >= limite rejetes)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 400; i++) for (const ch of generateCode()) seen.add(ch);
    expect(seen.size).toBe(CODE_ALPHABET.length);
    // 255 est rejete : le generateur redemande des octets.
    let calls = 0;
    const code = generateCode((n) => {
      calls++;
      return calls === 1 ? new Uint8Array(n).fill(255) : new Uint8Array(n).fill(0);
    });
    expect(code).toBe('A'.repeat(8));
    expect(calls).toBe(2);
  });
});

describe('sha256Hex', () => {
  it('donne le SHA-256 hexadecimal', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('buildInsertSql', () => {
  it('echappe les apostrophes', () => {
    expect(sqlString("L'a'")).toBe("'L''a'''");
    const sql = buildInsertSql({ id: 'u1', name: "O'Brien'; DROP TABLE users;--", role: 'eleve', codeHash: 'h', createdAt: 5 });
    expect(sql).toBe(
      "INSERT INTO users (id, name, role, code_hash, created_at) VALUES ('u1', 'O''Brien''; DROP TABLE users;--', 'eleve', 'h', 5);",
    );
  });

  it('ajoute la ligne follows pour un suiveur', () => {
    const sql = buildInsertSql({ id: 's1', name: 'Prof', role: 'suiveur', codeHash: 'h', createdAt: 5, follows: "e'1" });
    expect(sql).toContain("INSERT INTO follows (suiveur_id, eleve_id) VALUES ('s1', 'e''1');");
  });
});

describe('parseArgs', () => {
  it('lit les options', () => {
    expect(parseArgs(['--name', 'Alice', '--role', 'eleve'])).toEqual({ name: 'Alice', role: 'eleve', follows: undefined, remote: false });
    expect(parseArgs(['--name', 'P', '--role', 'suiveur', '--follows', 'u1', '--remote'])).toEqual({
      name: 'P', role: 'suiveur', follows: 'u1', remote: true,
    });
  });
  it('refuse les entrees invalides', () => {
    expect(() => parseArgs(['--role', 'eleve'])).toThrow();
    expect(() => parseArgs(['--name', 'A', '--role', 'admin'])).toThrow();
    expect(() => parseArgs(['--name', 'A', '--role', 'eleve', '--follows', 'u1'])).toThrow();
  });
});
