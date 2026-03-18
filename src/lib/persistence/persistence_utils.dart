import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/candidato.dart';
import '../models/eleitor.dart';

class PersistenceUtils {
  static const String boxCandidatos = 'candidatos_box';
  static const String boxEleitores = 'eleitores_box';
  static const String prefsKeyAdminSenha = 'admin_senha';

  static Future<void> init() async {
    await Hive.initFlutter();
    if (!Hive.isAdapterRegistered(1)) Hive.registerAdapter(CandidatoAdapter());
    if (!Hive.isAdapterRegistered(2)) Hive.registerAdapter(EleitorAdapter());
    await Hive.openBox<Candidato>(boxCandidatos);
    await Hive.openBox<Eleitor>(boxEleitores);
  }

  // Candidatos
  static Box<Candidato> _candidatosBox() => Hive.box<Candidato>(boxCandidatos);
  static List<Candidato> loadCandidatos() => _candidatosBox().values.toList();
  static Future<void> addCandidato(Candidato c) async => await _candidatosBox().add(c);
  static Future<void> removeCandidatoAt(int index) async => await _candidatosBox().deleteAt(index);
  static Future<void> clearCandidatos() async => await _candidatosBox().clear();

  // Eleitores
  static Box<Eleitor> _eleitoresBox() => Hive.box<Eleitor>(boxEleitores);
  static List<Eleitor> loadEleitores() => _eleitoresBox().values.toList();
  static Future<void> addEleitor(Eleitor e) async => await _eleitoresBox().add(e);
  static Future<void> clearEleitores() async => await _eleitoresBox().clear();

  // SharedPreferences
  static Future<void> setAdminSenha(String senha) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(prefsKeyAdminSenha, senha);
  }

  static Future<String?> getAdminSenha() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(prefsKeyAdminSenha);
  }
}
