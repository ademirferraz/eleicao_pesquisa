// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'candidato.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class CandidatoAdapter extends TypeAdapter<Candidato> {
  @override
  final int typeId = 1;

  @override
  Candidato read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Candidato(
      nome: fields[0] as String,
      partido: fields[1] as String,
      numero: fields[2] as String,
      fotoBytes: fields[3] as Uint8List?,
      totalVotos: fields[4] as int,
    );
  }

  @override
  void write(BinaryWriter writer, Candidato obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.nome)
      ..writeByte(1)
      ..write(obj.partido)
      ..writeByte(2)
      ..write(obj.numero)
      ..writeByte(3)
      ..write(obj.fotoBytes)
      ..writeByte(4)
      ..write(obj.totalVotos);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CandidatoAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
