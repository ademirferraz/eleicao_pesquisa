// lib/screens/tela_admin.dart
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import '../providers/eleicao_provider.dart';
import '../models/candidato.dart';

class TelaAdmin extends StatefulWidget {
  const TelaAdmin({super.key});
  @override
  State<TelaAdmin> createState() => _TelaAdminState();
}

class _TelaAdminState extends State<TelaAdmin> {
  final _novaSenhaCtrl = TextEditingController();

  Future<void> _adicionarCandidato(BuildContext context, EleicaoProvider provider) async {
    const int maxCandidatos = 6;
    if (provider.candidatos.length >= maxCandidatos) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Máximo de 6 candidatos atingido.")),
      );
      return;
    }
    
    final nomeCtrl = TextEditingController();
    final partidoCtrl = TextEditingController();
    final numeroCtrl = TextEditingController();
    Uint8List? foto;

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text("Novo Candidato"),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: nomeCtrl, decoration: const InputDecoration(labelText: "Nome")),
                TextField(controller: partidoCtrl, decoration: const InputDecoration(labelText: "Partido")),
                TextField(controller: numeroCtrl, decoration: const InputDecoration(labelText: "Número"), keyboardType: TextInputType.number),
                const SizedBox(height: 16),
                if (foto != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: CircleAvatar(radius: 40, backgroundImage: MemoryImage(foto!)),
                  ),
                ElevatedButton.icon(
                  icon: const Icon(Icons.photo),
                  label: const Text("Escolher Foto"),
                  onPressed: () async {
                    FilePickerResult? r = await FilePicker.platform.pickFiles(type: FileType.image, withData: true);
                    if (r != null) {
                      setDialogState(() => foto = r.files.first.bytes);
                    }
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancelar")),
            TextButton(
              onPressed: () {
                if (nomeCtrl.text.isNotEmpty && numeroCtrl.text.isNotEmpty) {
                  provider.adicionarCandidato(Candidato(
                    nome: nomeCtrl.text,
                    partido: partidoCtrl.text,
                    numero: numeroCtrl.text,
                    fotoBytes: foto,
                  ));
                  Navigator.pop(ctx);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Nome e número obrigatórios")));
                }
              },
              child: const Text("Adicionar"),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Painel Admin")),
      body: Consumer<EleicaoProvider>(
        builder: (context, provider, child) {
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const Text("SEGURANÇA", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _novaSenhaCtrl,
                      decoration: const InputDecoration(labelText: "Nova Senha"),
                      obscureText: true,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.save),
                    onPressed: () {
                      if (_novaSenhaCtrl.text.isNotEmpty) {
                        provider.atualizarSenha(_novaSenhaCtrl.text);
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Senha alterada!")));
                        _novaSenhaCtrl.clear();
                      }
                    },
                  ),
                ],
              ),
              const Divider(height: 40),
              const Text("CANDIDATOS", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              if (provider.candidatos.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Text("Nenhum candidato cadastrado.", textAlign: TextAlign.center),
                ),
              ...provider.candidatos.map(
                (c) => ListTile(
                  leading: c.fotoBytes != null ? CircleAvatar(backgroundImage: MemoryImage(c.fotoBytes!)) : const CircleAvatar(child: Icon(Icons.person)),
                  title: Text(c.nome),
                  subtitle: Text("${c.totalVotos} votos • Numero: ${c.numero}"),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () => provider.removerCandidato(c),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              ElevatedButton.icon(
                icon: const Icon(Icons.person_add),
                label: const Text("Novo Candidato"),
                onPressed: () => _adicionarCandidato(context, provider),
              ),
              const Divider(height: 40),
              const Text("MENSAGENS DOS ELEITORES", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              if (provider.eleitores.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Text("Nenhuma mensagem recebida.", textAlign: TextAlign.center),
                ),
              ...provider.eleitores.map(
                (e) => Card(
                  child: ListTile(
                    title: Text("${e.nome} (${e.regiao})"),
                    subtitle: Text("Votou em: ${e.candidatoNome ?? 'N/A'}\n${e.mensagem}"),
                    isThreeLine: true,
                  ),
                ),
              ),
              const Divider(height: 40),
              const Text("ESTATÍSTICAS POR REGIÃO", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ..._buildEstatisticas(provider),
              const SizedBox(height: 30),
              OutlinedButton.icon(
                icon: const Icon(Icons.refresh, color: Colors.orange),
                label: const Text("Resetar Tudo", style: TextStyle(color: Colors.orange)),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text("Confirmar Reset"),
                      content: const Text("Deseja deletar TODOS os candidatos e votos? Esta ação é irreversível."),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancelar")),
                        TextButton(
                          onPressed: () {
                            provider.resetarTudo();
                            Navigator.pop(ctx);
                          },
                          child: const Text("Confirmar", style: TextStyle(color: Colors.red)),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }

  List<Widget> _buildEstatisticas(EleicaoProvider provider) {
    final stats = provider.estatisticaPorRegiao();
    if (stats.isEmpty) return [const Padding(padding: EdgeInsets.only(top: 8), child: Text("Sem dados por região ainda."))];
    return stats.entries.map((e) {
      final reg = e.key;
      final map = e.value;
      return Card(
        margin: const EdgeInsets.symmetric(vertical: 4),
        child: ListTile(
          title: Text(reg, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Text(map.entries.map((kv) => "${kv.key}: ${kv.value}").join(" • ")),
        ),
      );
    }).toList();
  }
}
