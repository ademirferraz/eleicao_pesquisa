import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'providers/eleicao_provider.dart';
import 'providers/localizacao_provider.dart';
import 'screens/tela_home.dart';

void main() async {
  // 1. Garante que os plugins do sistema funcionem
  WidgetsFlutterBinding.ensureInitialized();

  // 2. Inicializa o Hive (banco de dados local)
  await Hive.initFlutter();

  // 3. Abre as "caixas" (tabelas) do Hive
  await Hive.openBox('candidatos');
  await Hive.openBox('votos');
  await Hive.openBox('configuracao_localizacao'); // Nova caixa para localização
  await Hive.openBox('bairros_localizacao'); // Nova caixa para bairros

  runApp(
    MultiProvider(
      providers: [
        // Provider para gerenciar eleição
        ChangeNotifierProvider(
          create: (_) => EleicaoProvider(),
        ),
        // Provider para gerenciar localização (Estado/Cidade/Bairros)
        ChangeNotifierProvider(
          create: (_) => LocalizacaoProvider()..inicializar(),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pesquisa Eleitoral 2026',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.green,
        useMaterial3: true,
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.green.shade700,
          centerTitle: true,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green.shade700,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(
              horizontal: 24,
              vertical: 12,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
      ),
      home: const TelaHome(),
    );
  }
}
