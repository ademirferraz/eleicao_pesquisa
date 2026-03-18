import '../models/eleitor.dart';

class GeradorMensagens {
  /// Esta função gera a mensagem estratégica baseada no perfil do eleitor e data atual.
  static String obterMensagemAutomatica(Eleitor eleitor, String nivel, String local) {
    // 1. Pega a data de hoje
    DateTime hoje = DateTime.now();
    String diaMesHoje = "${hoje.day.toString().padLeft(2, '0')}/${hoje.month.toString().padLeft(2, '0')}";
    
    // 2. Extrai dia/mês do nascimento do eleitor (Assume formato DD/MM/AAAA)
    String diaMesNascimento = "";
    if (eleitor.dataNascimento.length >= 5) {
      diaMesNascimento = eleitor.dataNascimento.substring(0, 5);
    }

    // --- LOGICA DE DISPARO ---

    // GATILHO 1: ANIVERSÁRIO (Conexão Pessoal)
    if (diaMesHoje == diaMesNascimento) {
      return "Parabéns, ${eleitor.nome.split(' ')[0]}! Hoje o dia é seu, mas o presente que queremos é um futuro melhor para $local. O [Candidato] te deseja muita saúde!";
    }

    // GATILHO 2: FERIADOS MUNICIPAIS (Exemplo: Bom Conselho)
    // Aqui você pode expandir para outros municípios usando a API do IBGE futuramente
    if (local.contains("Bom Conselho") && diaMesHoje == "03/08") {
      return "Feliz Aniversário, Bom Conselho! Orgulho de fazer parte desta terra junto com você, ${eleitor.nome.split(' ')[0]}.";
    }

    // GATILHO 3: DATAS NACIONAIS
    if (diaMesHoje == "07/09") {
      return "Dia da Independência! Momento de refletirmos sobre a liberdade que queremos para nossa cidade.";
    }
    
    if (diaMesHoje == "25/12") {
      return "O [Candidato] deseja a você e sua família em ${eleitor.regiao} um Natal de paz e união.";
    }

    // MENSAGEM PADRÃO (Caso não seja data especial)
    return "Obrigado por registrar sua opinião. Juntos somos mais fortes por $local!";
  }
}