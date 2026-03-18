import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/candidato.dart';
import '../models/eleitor.dart';

class EleicaoProvider with ChangeNotifier {
  static const String boxCandidatos = 'candidatos_box';
  static const String boxEleitores = 'eleitores_box';
  static const String boxConfig = 'config_box';

  List<Candidato> _candidatos = [];
  List<Eleitor> _eleitores = [];
  String _senhaAdmin = "123";
  final Set<String> _cpfsVotaram = {};

  List<Candidato> get candidatos => _candidatos;
  List<Eleitor> get eleitores => _eleitores;
  String get senhaAdmin => _senhaAdmin;
  int get totalVotos => _cpfsVotaram.length;

  Future<void> inicializar() async {
    final cBox = await Hive.openBox<Candidato>(boxCandidatos);
    final eBox = await Hive.openBox<Eleitor>(boxEleitores);
    final configBox = await Hive.openBox(boxConfig);

    _candidatos = cBox.values.toList();
    _eleitores = eBox.values.toList();
    _senhaAdmin = configBox.get('senha_admin', defaultValue: "123");

    for (var eleitor in _eleitores) {
      _cpfsVotaram.add(eleitor.cpf);
    }
    notifyListeners();
  }

  Future<void> adicionarCandidato(Candidato c) async {
    final box = Hive.box<Candidato>(boxCandidatos);
    await box.add(c);
    _candidatos = box.values.toList();
    notifyListeners();
  }

  Future<void> removerCandidato(Candidato c) async {
    await c.delete();
    _candidatos = Hive.box<Candidato>(boxCandidatos).values.toList();
    notifyListeners();
  }

  Future<void> registrarVoto({
    required String nome,
    required String cpf,
    required String regiao,
    required String mensagem,
    required Candidato candidato,
    DateTime? nascimento,
  }) async {
    final eleitor = Eleitor(
      nome: nome,
      cpf: cpf,
      regiao: regiao,
      mensagem: mensagem,
      candidatoNome: candidato.nome,
      nascimento: nascimento,
    );

    final eBox = Hive.box<Eleitor>(boxEleitores);
    await eBox.add(eleitor);
    _eleitores.add(eleitor);
    _cpfsVotaram.add(cpf);

    candidato.totalVotos++;
    await candidato.save();

    notifyListeners();
  }

  bool jaVotou(String cpf) => _cpfsVotaram.contains(cpf);

  Future<void> atualizarSenha(String novaSenha) async {
    _senhaAdmin = novaSenha;
    final box = Hive.box(boxConfig);
    await box.put('senha_admin', novaSenha);
    notifyListeners();
  }

  Future<void> resetarTudo() async {
    await Hive.box<Candidato>(boxCandidatos).clear();
    await Hive.box<Eleitor>(boxEleitores).clear();
    _candidatos.clear();
    _eleitores.clear();
    _cpfsVotaram.clear();
    notifyListeners();
  }

  Map<String, Map<String, int>> estatisticaPorRegiao() {
    final Map<String, Map<String, int>> map = {};
    for (var eleitor in _eleitores) {
      final reg = eleitor.regiao;
      map.putIfAbsent(reg, () => {});
      final cand = eleitor.candidatoNome ?? 'Sem voto';
      map[reg]!.update(cand, (v) => v + 1, ifAbsent: () => 1);
    }
    return map;
  }
}
