import 'dart:typed_data';
import 'package:hive/hive.dart';

part 'candidato.g.dart';

@HiveType(typeId: 1)
class Candidato extends HiveObject {
  @HiveField(0)
  String nome;

  @HiveField(1)
  String partido;

  @HiveField(2)
  String numero;

  @HiveField(3)
  Uint8List? fotoBytes;

  @HiveField(4)
  int totalVotos;

  Candidato({
    required this.nome,
    required this.partido,
    required this.numero,
    this.fotoBytes,
    this.totalVotos = 0,
  });
}
