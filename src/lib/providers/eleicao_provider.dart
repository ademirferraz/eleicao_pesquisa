import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/candidato.dart';
import '../models/eleitor.dart';

class EleicaoProvider with ChangeNotifier {
  late Box _candidatosBox;
  late Box _votosBox;

  List<Candidato> _listaCandidatos = [];
  List<Eleitor> _baseEleitores = [];
  List<String> _cpfsVotaram = [];

  String _senhaAdmin = "123";

  // Getters
  List<Candidato> get candidatos => _listaCandidatos;
  List<Eleitor> get eleitores => _baseEleitores;
  List<String> get cpfsVotaram => _cpfsVotaram;
  String get senhaAdmin => _senhaAdmin;

  // Inicializar
  Future<void> inicializar() async {
    try {
      _candidatosBox = Hive.box('candidatos');
      _votosBox = Hive.box('votos');

      // Carregar candidatos salvos
      _carregarCandidatos();

      // Carregar votos salvos
      _carregarVotos();

      notifyListeners();
    } catch (e) {
      debugPrint('Erro ao inicializar EleicaoProvider: $e');
    }
  }

  // Carregar candidatos do Hive
  void _carregarCandidatos() {
    try {
      _listaCandidatos = [];
      for (int i = 0; i < _candidatosBox.length; i++) {
        final candidato = _candidatosBox.getAt(i);
        if (candidato is Candidato) {
          _listaCandidatos.add(candidato);
        }
      }
    } catch (e) {
      debugPrint('Erro ao carregar candidatos: $e');
    }
  }

  // Carregar votos do Hive
  void _carregarVotos() {
    try {
      _baseEleitores = [];
      _cpfsVotaram = [];
      for (int i = 0; i < _votosBox.length; i++) {
        final eleitor = _votosBox.getAt(i);
        if (eleitor is Eleitor) {
          _baseEleitores.add(eleitor);
          _cpfsVotaram.add(eleitor.cpf);
        }
      }
    } catch (e) {
      debugPrint('Erro ao carregar votos: $e');
    }
  }

  // Adicionar candidato
  Future<void> adicionarCandidato(Candidato candidato) async {
    try {
      await _candidatosBox.add(candidato);
      _listaCandidatos.add(candidato);
      notifyListeners();
    } catch (e) {
      debugPrint('Erro ao adicionar candidato: $e');
    }
  }

  // Remover candidato
  Future<void> removerCandidato(Candidato candidato) async {
    try {
      final index = _listaCandidatos.indexOf(candidato);
      if (index != -1) {
        await _candidatosBox.deleteAt(index);
        _listaCandidatos.removeAt(index);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erro ao remover candidato: $e');
    }
  }

  // Registrar voto
  Future<void> registrarVoto({
    required String nome,
    required String cpf,
    required String regiao,
    required String mensagem,
    required Candidato candidato,
    required DateTime? nascimento,
  }) async {
    try {
      // Criar eleitor
      final eleitor = Eleitor(
        nome: nome,
        cpf: cpf,
        regiao: regiao,
        mensagem: mensagem,
        candidatoNome: candidato.nome,
        nascimento: nascimento,
      );

      // Salvar no Hive
      await _votosBox.add(eleitor);

      // Atualizar lista local
      _baseEleitores.add(eleitor);
      _cpfsVotaram.add(cpf);

      // Incrementar votos do candidato
      candidato.totalVotos++;
      final indexCandidato = _listaCandidatos.indexOf(candidato);
      if (indexCandidato != -1) {
        await _candidatosBox.putAt(indexCandidato, candidato);
      }

      notifyListeners();
    } catch (e) {
      debugPrint('Erro ao registrar voto: $e');
    }
  }

  // Verificar se já votou
  bool jaVotou(String cpf) {
    return _cpfsVotaram.contains(cpf);
  }

  // Atualizar senha
  Future<void> atualizarSenha(String novaSenha) async {
    try {
      _senhaAdmin = novaSenha;
      notifyListeners();
    } catch (e) {
      debugPrint('Erro ao atualizar senha: $e');
    }
  }

  // Resetar tudo
  Future<void> resetarTudo() async {
    try {
      await _candidatosBox.clear();
      await _votosBox.clear();

      _listaCandidatos = [];
      _baseEleitores = [];
      _cpfsVotaram = [];

      notifyListeners();
    } catch (e) {
      debugPrint('Erro ao resetar: $e');
    }
  }

  // Estatísticas por região
  Map<String, Map<String, int>> estatisticaPorRegiao() {
    final stats = <String, Map<String, int>>{};

    for (final eleitor in _baseEleitores) {
      final regiao = eleitor.regiao;
      final candidato = eleitor.candidatoNome ?? 'Sem voto';

      if (!stats.containsKey(regiao)) {
        stats[regiao] = {};
      }

      stats[regiao]![candidato] = (stats[regiao]![candidato] ?? 0) + 1;
    }

    return stats;
  }

  // Obter votos por candidato
  Map<String, int> votosPorCandidato() {
    final votos = <String, int>{};

    for (final candidato in _listaCandidatos) {
      votos[candidato.nome] = candidato.totalVotos;
    }

    return votos;
  }

  // Total de votos
  int get totalVotos => _baseEleitores.length;
}
