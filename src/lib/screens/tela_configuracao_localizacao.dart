// lib/screens/tela_configuracao_localizacao.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/localizacao_provider.dart';

class TelaConfiguracaoLocalizacao extends StatefulWidget {
  const TelaConfiguracaoLocalizacao({super.key});

  @override
  State<TelaConfiguracaoLocalizacao> createState() =>
      _TelaConfiguracaoLocalizacaoState();
}

class _TelaConfiguracaoLocalizacaoState
    extends State<TelaConfiguracaoLocalizacao> {
  final _bairroCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Carregar estados quando a tela abrir
    Future.microtask(() {
      final provider =
          Provider.of<LocalizacaoProvider>(context, listen: false);
      if (provider.estados.isEmpty) {
        provider._carregarEstados();
      }
    });
  }

  void _mostrarErro(String mensagem) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensagem),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _mostrarSucesso(String mensagem) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensagem),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuração de Localização'),
        centerTitle: true,
      ),
      body: Consumer<LocalizacaoProvider>(
        builder: (context, provider, child) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Mostrar erro se houver
                if (provider.erro != null)
                  Card(
                    color: Colors.red.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          const Icon(Icons.error, color: Colors.red),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              provider.erro!,
                              style: const TextStyle(color: Colors.red),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.red),
                            onPressed: provider.limparErro,
                          ),
                        ],
                      ),
                    ),
                  ),
                if (provider.erro != null) const SizedBox(height: 16),

                // Mostrar configuração atual
                if (provider.temConfiguracao)
                  Card(
                    color: Colors.green.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '✓ Configuração Atual',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.green,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            provider.descricaoLocalizacao,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (provider.bairros.isNotEmpty)
                            Text(
                              '${provider.bairros.length} bairro(s) cadastrado(s)',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                if (provider.temConfiguracao) const SizedBox(height: 20),

                // Seção: Seleção de Estado
                const Text(
                  'PASSO 1: Selecione o Estado',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue,
                  ),
                ),
                const SizedBox(height: 12),
                if (provider.carregando && provider.estados.isEmpty)
                  const Center(child: CircularProgressIndicator())
                else
                  DropdownButton<String>(
                    isExpanded: true,
                    hint: const Text('Escolha um estado'),
                    value: provider.estadoSelecionado,
                    items: provider.estados
                        .map((e) => DropdownMenuItem(
                              value: e['sigla'],
                              child: Text('${e['nome']} (${e['sigla']})'),
                            ))
                        .toList(),
                    onChanged: (sigla) {
                      if (sigla != null) {
                        provider.selecionarEstado(sigla);
                      }
                    },
                  ),
                const SizedBox(height: 20),

                // Seção: Seleção de Cidade
                if (provider.estadoSelecionado != null) ...[
                  const Text(
                    'PASSO 2: Selecione a Cidade',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (provider.carregando && provider.cidades.isEmpty)
                    const Center(child: CircularProgressIndicator())
                  else if (provider.cidades.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: Text(
                        'Nenhuma cidade encontrada',
                        style: TextStyle(color: Colors.grey),
                      ),
                    )
                  else
                    DropdownButton<String>(
                      isExpanded: true,
                      hint: const Text('Escolha uma cidade'),
                      value: provider.cidadeSelecionada,
                      items: provider.cidades
                          .map((c) => DropdownMenuItem(
                                value: c,
                                child: Text(c),
                              ))
                          .toList(),
                      onChanged: (cidade) {
                        if (cidade != null) {
                          provider.selecionarCidade(cidade);
                        }
                      },
                    ),
                  const SizedBox(height: 20),
                ],

                // Seção: Adicionar Bairros
                if (provider.cidadeSelecionada != null) ...[
                  const Divider(),
                  const SizedBox(height: 16),
                  const Text(
                    'PASSO 3: Adicione os Bairros/Localidades',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _bairroCtrl,
                          decoration: InputDecoration(
                            hintText: 'Nome do bairro ou localidade',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        onPressed: () async {
                          if (_bairroCtrl.text.isEmpty) {
                            _mostrarErro('Digite o nome do bairro');
                            return;
                          }

                          await provider.adicionarBairro(_bairroCtrl.text);

                          if (provider.erro != null) {
                            _mostrarErro(provider.erro!);
                          } else {
                            _mostrarSucesso('Bairro adicionado!');
                            _bairroCtrl.clear();
                          }
                        },
                        icon: const Icon(Icons.add),
                        label: const Text('Adicionar'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Lista de Bairros
                  const Text(
                    'Bairros Cadastrados',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (provider.bairros.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: Text(
                        'Nenhum bairro adicionado ainda',
                        style: TextStyle(color: Colors.grey),
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: provider.bairros.length,
                      itemBuilder: (context, index) {
                        final bairro = provider.bairros[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          child: ListTile(
                            leading: const Icon(Icons.location_on,
                                color: Colors.blue),
                            title: Text(bairro),
                            trailing: IconButton(
                              icon:
                                  const Icon(Icons.delete, color: Colors.red),
                              onPressed: () async {
                                await provider.removerBairro(bairro);
                                _mostrarSucesso('Bairro removido!');
                              },
                            ),
                          ),
                        );
                      },
                    ),
                ],

                const SizedBox(height: 30),

                // Botão Resetar
                OutlinedButton.icon(
                  icon: const Icon(Icons.refresh, color: Colors.orange),
                  label: const Text('Resetar Tudo',
                      style: TextStyle(color: Colors.orange)),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Confirmar Reset'),
                        content: const Text(
                            'Deseja limpar TODA a configuração de localização? Esta ação é irreversível.'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: const Text('Cancelar'),
                          ),
                          TextButton(
                            onPressed: () {
                              provider.resetarTudo();
                              Navigator.pop(ctx);
                              _mostrarSucesso('Configuração resetada!');
                            },
                            child: const Text('Confirmar',
                                style: TextStyle(color: Colors.red)),
                          ),
                        ],
                      ),
                    );
                  },
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
    _bairroCtrl.dispose();
    super.dispose();
  }
}
