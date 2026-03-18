// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'eleitor.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class EleitorAdapter extends TypeAdapter<Eleitor> {
  @override
  final int typeId = 2;

  @override
  Eleitor read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Eleitor(
      nome: fields[0] as String,
      cpf: fields[1] as String,
      regiao: fields[2] as String,
      mensagem: fields[3] as String,
      candidatoNome: fields[4] as String?,
      nascimento: fields[5] as DateTime?,
    );
  }

  @override
  void write(BinaryWriter writer, Eleitor obj) {
    writer
      ..writeByte(6)
      ..writeByte(0)
      ..write(obj.nome)
      ..writeByte(1)
      ..write(obj.cpf)
      ..writeByte(2)
      ..write(obj.regiao)
      ..writeByte(3)
      ..write(obj.mensagem)
      ..writeByte(4)
      ..write(obj.candidatoNome)
      ..writeByte(5)
      ..write(obj.nascimento);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is EleitorAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
