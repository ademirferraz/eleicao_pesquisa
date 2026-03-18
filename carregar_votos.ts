import { db } from './db';
import { votos } from './drizzle/schema';

async function rodar() {
  console.log("🗳️ Iniciando Carga de Dados Direta...");
  try {
    // 15 para Bilica, 8 para Boanerges, 77 outros
    const dados = [
      ...Array(15).fill({ candidatoId: 1, localidadeId: 1 }),
      ...Array(8).fill({ candidatoId: 2, localidadeId: 1 }),
      ...Array(77).fill({ candidatoId: 3, localidadeId: 1 })
    ];

    for (const voto of dados) {
      await db.insert(votos).values(voto);
    }
    console.log("-----------------------------------------");
    console.log("✅ SUCESSO ABSOLUTO!");
    console.log("📊 Placar: Bilica 15 x 8 Boanerges");
    console.log("-----------------------------------------");
  } catch (e) {
    console.error("❌ Erro na inserção:", e.message);
  }
  process.exit(0);
}
rodar();
