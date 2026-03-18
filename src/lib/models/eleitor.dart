import 'package:hive/hive.dart';

part 'eleitor.g.dart';

@HiveType(typeId: 2)
class Eleitor extends HiveObject {
  @HiveField(0)
  String nome;

  @HiveField(1)
  String cpf;

  @HiveField(2)
  String regiao;

  @HiveField(3)
  String mensagem;

  @HiveField(4)
  String? candidatoNome;

  @HiveField(5)
  DateTime? nascimento;

  Eleitor({
    required this.nome,
    required this.cpf,
    required this.regiao,
    required this.mensagem,
    this.candidatoNome,
    this.nascimento,
  });
}
