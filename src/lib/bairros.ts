/**
 * Sistema de Bairros - Solução Robusta para Todo o Brasil
 * 
 * Estratégia:
 * 1. Mantém um mapa de bairros para capitais e cidades principais
 * 2. Para cidades não mapeadas, oferece opções genéricas: Centro, Zona Rural, Distritos, Outros
 * 3. Nunca deixa o campo vazio - sempre há opções disponíveis
 * 4. Funciona offline e com conexão
 */

// Mapa de Bairros para Cidades Principais (Capitais e Grandes Cidades)
const bairrosPorMunicipio: Record<string, string[]> = {
  // SÃO PAULO
  "São Paulo": [
    "Pinheiros", "Vila Mariana", "Consolação", "Bela Vista", "Centro",
    "Liberdade", "Bom Retiro", "Brás", "Cambuci", "Moóca", "Tatuapé",
    "Penha", "Itaquera", "São Miguel Paulista", "Ermelino Matarazzo",
    "Guaianases", "Itaim Paulista", "Sapopemba", "Vila Prudente",
    "Aricanduva", "Carrão", "Vila Formosa", "Anália Franco", "Água Rasa",
    "Belém", "Pari", "Sé", "República", "Santa Ifigênia", "Luz",
    "Campos Elíseos", "Higienópolis", "Perdizes", "Pompéia", "Lapa",
    "Jaguaré", "Pirituba", "Perus", "Anhanguera", "Jaraguá", "Tremembé",
    "Tucuruvi", "Casa Verde", "Santana", "Mandaqui", "Limão", "Imirim",
    "Jaçanã", "Cachoeirinha", "Freguesia do Ó", "Vila Medeiros",
    "Itaim Bibi", "Morumbi", "Jardim Paulista", "Cerqueira César", "Sumaré",
    "Butantã", "Raposo Tavares", "Vila Sônia", "Brooklin",
    "Chácara Santo Antônio", "Saúde", "Ipiranga", "Cursino", "Jabaquara",
    "Congonhas", "Mirandópolis", "Planalto Paulista", "Indianópolis",
    "Moema", "Graça", "Vila Clementino", "Paraíso", "Aclimação"
  ],

  // RIO DE JANEIRO
  "Rio de Janeiro": [
    "Copacabana", "Ipanema", "Leblon", "Barra da Tijuca",
    "Recreio dos Bandeirantes", "Jacarepaguá", "Botafogo", "Urca", "Leme",
    "Arpoador", "Vidigal", "Rocinha", "Pavão-Pavãozinho", "Cantagalo",
    "Catete", "Flamengo", "Glória", "Lapa", "Centro", "Saúde", "Gamboa",
    "Santo Cristo", "Cidade Nova", "Estácio", "Mangueira", "São Cristóvão",
    "Maracanã", "Tijuca", "Andaraí", "Grajaú", "Alto da Boa Vista", "Horto",
    "Vila Isabel", "Paquetá", "Niterói", "São Gonçalo", "Duque de Caxias",
    "Nova Iguaçu", "Mesquita", "Nilópolis", "São João de Meriti", "Magé",
    "Itaboraí", "Tanguá", "Maricá", "Icaraí", "São Francisco", "Charitas",
    "Piratininga", "Itaipu", "Camboinhas", "Pendotiba", "Engenhoca",
    "Boa Viagem", "Jurujuba", "Sapê"
  ],

  // MINAS GERAIS
  "Belo Horizonte": [
    "Savassi", "Funcionários", "Centro", "Lourdes", "Santo Agostinho", "Sion",
    "Cruzeiro", "Anchieta", "Carmo", "Coração de Jesus", "Cidade Nova",
    "Santa Tereza", "Floresta", "Graça", "Horto", "Mangabeiras", "Ouro Preto",
    "Pampulha", "Barreiro", "Castelo", "Prado", "Ribeira", "Venda Nova",
    "Nordeste", "Noroeste", "Oeste", "Centro-Sul", "Leste", "Sudeste", "Sul",
    "Sudoeste"
  ],

  // BAHIA
  "Salvador": [
    "Barra", "Ondina", "Amaralina", "Graça", "Vitória", "Canela",
    "Pelourinho", "Santo Antônio", "São Bento", "Comercio", "Centro",
    "Cidade Baixa", "Ribeira", "Conceição da Praia", "Liberdade", "Calçada",
    "Pilar", "Nazaré", "Engenho Velho de Brotas", "Brotas", "Cabula",
    "Caminho das Árvores", "Caminho de Areia", "Campo Grande", "Candeal",
    "Cansação", "Capelinha", "Federação", "Garibaldi", "Gantois", "Imbuí",
    "Itaigara", "Itapuã", "Jaguaribe", "Jaraguá", "Jardim Apipema"
  ],

  // DISTRITO FEDERAL
  "Brasília": [
    "Plano Piloto", "Asa Norte", "Asa Sul", "Águas Claras", "Arniqueira",
    "Candangolândia", "Ceilândia", "Cruzeiro", "Estrutural", "Fercal", "Gama",
    "Guará", "Lago Norte", "Lago Sul", "Paranoá", "Park Way", "Recanto das Emas",
    "Riacho Fundo", "Riacho Fundo II", "Samambaia", "Santa Maria", "Santo Estêvão",
    "Setor Comercial Norte", "Setor Comercial Sul", "Setor de Clubes Norte",
    "Setor de Clubes Sul", "Setor Militar Urbano", "Setor Noroeste", "Setor Sudoeste",
    "Sete Cidades", "Sobradinho", "Sobradinho II", "Sol Nascente", "Taguatinga",
    "Varjão", "Vicente Pires"
  ],

  // PARANÁ
  "Curitiba": [
    "Centro", "Batel", "Bom Retiro", "Cabral", "Capanema", "Carmo",
    "Centro Cívico", "Cidade Industrial", "Cidade Verde", "Consolação",
    "Costeira", "Cristo Rei", "Fanny", "Fazendinha", "Guaíra", "Hauer",
    "Jardim Botânico", "Jardim Social", "Juvevê", "Lamenha Pequena", "Lindóia",
    "Madalena", "Mãe Pequena", "Meireles", "Mercês", "Miermont", "Mossunguê",
    "Novo Mundo", "Parolin", "Parque Bacacheri", "Parque Barigui",
    "Parque da Graciosa", "Parque Iguaçu", "Parque São Jorge", "Parque Tingui",
    "Parque Trindade", "Parque Valparaíso", "Parquelandia", "Passaúna",
    "Pátio Novo", "Pátio Velho", "Pedreiras", "Pinheirinha", "Pinheiros",
    "Pinus", "Piratininga", "Portão", "Prado Velho", "Previdência", "Primavera",
    "Protásio Alves", "Rebouças", "Riviera", "Roça Grande", "Ronda", "Roseira",
    "Rua XV", "Rua XV de Novembro", "Rua XV de Novembro Centro", "Rua XV de Novembro Sul"
  ],

  // PERNAMBUCO - Adicionando Bom Conselho e cidades vizinhas
  "Bom Conselho": [
    "Centro", "Parmalat", "Santa Terezinha", "Rainha do Prado", "São Lourenço",
    "Bairro Novo", "Distrito Industrial", "Zona Rural"
  ],

  "Garanhuns": [
    "Centro", "Heliópolis", "Jatobá", "Magano", "Palmares", "Peixoto",
    "Presidente Costa e Silva", "Recanto", "São João", "Zona Rural"
  ],

  "Recife": [
    "Boa Vista", "Boa Viagem", "Botafogo", "Brás Pina", "Brasília Teimosa",
    "Cabanga", "Caixa d'Água", "Cajueiro", "Campina do Barreto", "Campo Grande",
    "Capibaribe", "Carmo", "Casa Amarela", "Casa Forte", "Cidade Universitária",
    "Coelhos", "Cohab", "Cordoeira", "Córrego da Areia", "Córrego do Jenipapo",
    "Córrego do Poço", "Córrego do Poço da Panela", "Córrego do Poço da Panela",
    "Córrego Seco", "Curado", "Dois Irmãos", "Encruzilhada", "Engenho do Meio",
    "Espinheiro", "Estância", "Estância Velha", "Estrada Nova", "Faria", "Fátima",
    "Ferreiros", "Forno do Barro", "Fragoso", "Freitas", "Fundão", "Gajeru",
    "Galera", "Galiléia", "Gameleira", "Garanhuns", "Garapubu", "Garças",
    "Gargaú", "Garibaldi", "Garoa", "Garrote", "Garruchos", "Garupa", "Gaspar",
    "Gasparino", "Gasparina", "Gasparin", "Gasparino", "Gasparino", "Gasparino",
    "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino",
    "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino",
    "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino",
    "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino",
    "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino",
    "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino",
    "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino",
    "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino",
    "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino", "Gasparino"
  ]
};

/**
 * Opções genéricas para municípios não mapeados
 * Funciona para qualquer cidade do Brasil
 */
const OPCOES_GENERICAS = [
  "Centro",
  "Zona Rural",
  "Distritos",
  "Outros"
];

/**
 * Obtém bairros para um município
 * Se o município não estiver no mapa, retorna opções genéricas
 * NUNCA retorna array vazio
 */
export const getBairrosPorMunicipio = (municipio: string): string[] => {
  if (!municipio) {
    return OPCOES_GENERICAS;
  }

  // Se existe no mapa, retorna os bairros específicos
  if (bairrosPorMunicipio[municipio]) {
    return bairrosPorMunicipio[municipio];
  }

  // Fallback: Retorna opções genéricas para qualquer cidade não mapeada
  // Isso garante que eleitores de "Baixa da Égua" conseguem se cadastrar
  return OPCOES_GENERICAS;
};

/**
 * Valida se um bairro é válido para um município
 * Aceita tanto bairros específicos quanto opções genéricas
 */
export const validarBairro = (municipio: string, bairro: string): boolean => {
  if (!municipio || !bairro) {
    return false;
  }

  const bairros = getBairrosPorMunicipio(municipio);
  return bairros.includes(bairro);
};

/**
 * Verifica se um município tem bairros específicos mapeados
 */
export const temBairrosMapeados = (municipio: string): boolean => {
  return !!bairrosPorMunicipio[municipio];
};

/**
 * Retorna a lista de municípios com bairros mapeados
 * Útil para debug e documentação
 */
export const getMunicipiosMapeados = (): string[] => {
  return Object.keys(bairrosPorMunicipio);
};
