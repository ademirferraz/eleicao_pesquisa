import 'package:flutter/material.dart';
import '../models/candidato.dart';
import '../models/eleitor.dart';

class CampanhaProvider with ChangeNotifier {
  // Dados de Configuração
  String _nivelAbrangencia = "Brasil";
  String _localAbrangencia = "Geral";
  String _senhaAdmin = "123";

  // Listas de Dados
  List<Candidato> _listaCandidatos = [];
  List<Eleitor> _baseEleitores = [];
  List<String> _cpfsVotaram = [];

  // Getters (Para as telas lerem os dados)
  String get local => _localAbrangencia;
  String get nivel => _nivelAbrangencia;
  String get senha => _senhaAdmin;
  List<Candidato> get candidatos => _listaCandidatos;
  List<String> get cpfsVotaram => _cpfsVotaram;

  // Métodos (Para as telas alterarem os dados)
  void configurarCampanha(String nivel, String local) {
    _nivelAbrangencia = nivel;
    _localAbrangencia = local;
    notifyListeners(); // Avisa o app para redesenhar!
  }

  void adicionarCandidato(Candidato c) {
    _listaCandidatos.add(c);
    notifyListeners();
  }

  void removerCandidato(int index) {
    _listaCandidatos.removeAt(index);
    notifyListeners();
  }

  void registrarVoto(Eleitor e, Candidato c) {
    c.totalVotos++;
    _baseEleitores.add(e);
    _cpfsVotaram.add(e.cpf);
    notifyListeners();
  }

  void atualizarSenha(String novaSenha) {
    _senhaAdmin = novaSenha;
    notifyListeners();
  }
}