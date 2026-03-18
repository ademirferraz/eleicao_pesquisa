// lib/screens/tela_cadastro.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/eleicao_provider.dart';
import '../providers/localizacao_provider.dart';
import '../utils/cpf_input_formatter.dart';
import '../utils/cpf_validator.dart';
import '../models/eleitor.dart';
import '../models/candidato.dart';
import 'tela_resultado_final.dart';

class TelaCadastro extends StatefulWidget {
  const TelaCadastro({super.key});
  @override
  State<TelaCadastro> createState() => _TelaCadastroState();
}

class _TelaCadastroState extends State<TelaCadastro> {
  final _formKey = GlobalKey<FormState>();
  final _nome = TextEditingController();
  final _cpf = TextEditingController();
  final _msg = TextEditingController();
  DateTime? _nascimento;
  Candidato? _voto;
  String? _bairroSelecionado;

  Future<void> _pickNascimento(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 30),
      firstDate: DateTime(1900),
      lastDate: now,
    );
    if (picked != null) setState(() => _nascimento = picked);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Identificação")),
      body: Consumer2<EleicaoProvider, LocalizacaoProvider>(
        builder: (context, eleicaoProvider, localizacaoProvider, child) {
          // DEBUG: Verifique o valor no console do VS Code / Terminal
          print("DEBUG: Candidatos encontrados: ${eleicaoProvider.candidatos.length}");

          // 1. Verificar se localização está configurada
          if (!localizacaoProvider.temConfiguracao) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.warning_amber_rounded, size: 64, color: Colors.orange),
                  const SizedBox(height: 16),
                  const Text(
                    'Localização não configurada',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Voltar'),
                  ),
                ],
              ),
            );
          }

          // 2. Formulário Principal
          return Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Card com localização
                Card(
                  color: Colors.blue.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Localização', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        Text(
                          localizacaoProvider.descricaoLocalizacao,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Campos de Texto
                TextFormField(
                  controller: _nome,
                  decoration: const InputDecoration(labelText: "Nome Completo"),
                  maxLength: 100,
                  validator: (v) => v!.isEmpty ? "Obrigatório" : null,
                ),
                TextFormField(
                  controller: _cpf,
                  decoration: const InputDecoration(labelText: "CPF (Válido)"),
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    CpfInputFormatter(),
                  ],
                  validator: (v) {
                    if (!CpfValidator.isValid(v!)) return "CPF Inválido!";
                    if (eleicaoProvider.jaVotou(v)) return "Eleitor já registrado!";
                    return null;
                  },
                ),

                // Data de Nascimento
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text("Data de Nascimento"),
                  subtitle: Text(_nascimento != null 
                    ? "${_nascimento!.day}/${_nascimento!.month}/${_nascimento!.year}" 
                    : "Selecione a data"),
                  trailing: IconButton(
                    icon: const Icon(Icons.calendar_today),
                    onPressed: () => _pickNascimento(context),
                  ),
                ),

                // Bairros
                const SizedBox(height: 12),
                const Text('Bairro/Localidade', style: TextStyle(fontWeight: FontWeight.bold)),
                if (localizacaoProvider.bairros.isEmpty)
                  const Text('Nenhum bairro cadastrado', style: TextStyle(color: Colors.orange))
                else
                  DropdownButton<String>(
                    isExpanded: true,
                    hint: const Text('Selecione um bairro'),
                    value: _bairroSelecionado,
                    items: localizacaoProvider.bairros
                        .map((b) => DropdownMenuItem(value: b, child: Text(b)))
                        .toList(),
                    onChanged: (b) => setState(() => _bairroSelecionado = b),
                  ),

                const SizedBox(height: 20),

                // Lista de Candidatos
                const Text("Escolha o Candidato:", style: TextStyle(fontWeight: FontWeight.bold)),
                if (eleicaoProvider.candidatos.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text("Nenhum candidato cadastrado.", style: TextStyle(color: Colors.red)),
                  ),
                
                // Mapeamento da lista de candidatos
                ...eleicaoProvider.candidatos.map((c) => RadioListTile<Candidato>(
                  title: Text(c.nome),
                  subtitle: Text("${c.partido} • ${c.numero}"),
                  secondary: c.fotoBytes != null
                      ? CircleAvatar(backgroundImage: MemoryImage(c.fotoBytes!))
                      : null,
                  value: c,
                  groupValue: _voto,
                  onChanged: (val) => setState(() => _voto = val),
                )),

                const SizedBox(height: 20),
                TextFormField(
                  controller: _msg,
                  decoration: const InputDecoration(labelText: "Mensagem", border: OutlineInputBorder()),
                  maxLines: 2,
                ),
                const SizedBox(height: 30),

                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green, minimumSize: const Size(double.infinity, 50)),
                  onPressed: () async {
                    if (_formKey.currentState!.validate() && _voto != null && _nascimento != null && _bairroSelecionado != null) {
                      await eleicaoProvider.registrarVoto(
                        nome: _nome.text,
                        cpf: _cpf.text,
                        regiao: _bairroSelecionado!,
                        mensagem: _msg.text,
                        candidato: _voto!,
                        nascimento: _nascimento,
                      );
                      if (context.mounted) {
                        Navigator.pushReplacement(context, MaterialPageRoute(builder: (c) => const TelaResultadoFinal()));
                      }
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Preencha todos os campos e selecione o candidato!")));
                    }
                  },
                  child: const Text("CONFIRMAR VOTO"),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _nome.dispose();
    _cpf.dispose();
    _msg.dispose();
    super.dispose();
  }
}