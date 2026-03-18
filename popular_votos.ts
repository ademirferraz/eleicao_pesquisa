import { db } from '/home/ademir/projetos/eleicao_pesquisa/db.ts'; 
import { votos } from '/home/ademir/projetos/eleicao_pesquisa/drizzle/schema.ts';

async function operacaoCoroneis() {
  console.log("🗳️ Acessando a urna em: /home/ademir/projetos/eleicao_pesquisa");
  try {
    for (let i = 0; i < 15; i++) await db.insert(votos).values({ candidatoId: 1, localidadeId: 1 });
    for (let i = 0; i < 8; i++) await db.insert(votos).values({ candidatoId: 2, localidadeId: 1 });
    for (let i = 0; i < 77; i++) await db.insert(votos).values({ candidatoId: 3, localidadeId: 1 });
    
    console.log("-----------------------------------------");
    console.log("✅ SUCESSO: Votos computados na base bruta!");
    console.log("📊 Placar: Bilica 15 x 8 Boanerges");
    console.log("-----------------------------------------");
  } catch (erro) {
    console.error("❌ ERRO:", erro.message);
  }
  process.exit(0);
}
operacaoCoroneis();
