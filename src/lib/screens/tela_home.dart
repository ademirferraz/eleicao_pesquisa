// lib/screens/tela_home.dart (ATUALIZADO)
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/eleicao_provider.dart';
import '../providers/localizacao_provider.dart';
import 'tela_cadastro.dart';
import 'tela_admin.dart';
import 'tela_configuracao_localizacao.dart';

class TelaHome extends StatefulWidget {
  const TelaHome({super.key});
  @override
  State<TelaHome> createState() => _TelaHomeState();
}

class _TelaHomeState extends State<TelaHome> {
  void _loginAdmin(BuildContext context) {
    final p = TextEditingController();
    final eleicaoProvider = Provider.of<EleicaoProvider>(context, listen: false);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Acesso Admin"),
        content: TextField(
          controller: p,
          obscureText: true,
          decoration: const InputDecoration(labelText: "Senha"),
        ),
        actions: [
          TextButton(
            onPressed: () {
              if (p.text == eleicaoProvider.senhaAdmin) {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (c) => const TelaAdmin()),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Senha incorreta!")),
                );
              }
            },
            child: const Text("Entrar"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(colors: [Colors.green, Colors.blue]),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.how_to_vote, size: 80, color: Colors.white),
            const Text(
              "SISTEMA DE PESQUISA",
              style: TextStyle(
                fontSize: 24,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 40),

            // Botão: Iniciar Pesquisa
            ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (c) => const TelaCadastro()),
              ),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(200, 50),
                backgroundColor: Colors.white,
                foregroundColor: Colors.green,
              ),
              child: const Text(
                "INICIAR PESQUISA",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),

            const SizedBox(height: 20),

            // Botão: Configuração de Localização (Admin)
            Consumer<LocalizacaoProvider>(
              builder: (context, localizacaoProvider, _) {
                return ElevatedButton.icon(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (c) => const TelaConfiguracaoLocalizacao(),
                    ),
                  ),
                  icon: const Icon(Icons.location_on),
                  label: const Text("Configurar Localização"),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(200, 50),
                    backgroundColor: Colors.amber,
                    foregroundColor: Colors.black,
                  ),
                );
              },
            ),

            const SizedBox(height: 20),

            // Botão: Admin
            TextButton(
              onPressed: () => _loginAdmin(context),
              child: const Text(
                "Painel Admin",
                style: TextStyle(color: Colors.white70, fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
