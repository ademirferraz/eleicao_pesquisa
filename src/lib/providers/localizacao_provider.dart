import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../services/ibge_service.dart';

class LocalizacaoProvider with ChangeNotifier {
  // Caixas Hive
  late Box _configBox;
  late Box _bairrosBox;

  // Estado
  List<Map<String, String>> _estados = [];
  List<String> _cidades = [];
  List<String> _bairros = [];

  String? _estadoSelecionado;
  String? _cidadeSelecionada;
  String? _bairroSelecionado;

  bool _carregando = false;
  String? _erro;

  // Getters
  List<Map<String, String>> get estados => _estados;
  List<String> get cidades => _cidades;
  List<String> get bairros => _bairros;

  String? get estadoSelecionado => _estadoSelecionado;
  String? get cidadeSelecionada => _cidadeSelecionada;
  String? get bairroSelecionado => _bairroSelecionado;

  bool get carregando => _carregando;
  String? get erro => _erro;

  // Inicializar
  Future<void> inicializar() async {
    try {
      _configBox = Hive.box('configuracao_localizacao');
      _bairrosBox = Hive.box('bairros_localizacao');

      // Carregar dados salvos
      _estadoSelecionado = _configBox.get('estado_selecionado');
      _cidadeSelecionada = _configBox.get('cidade_selecionada');
      _bairroSelecionado = _configBox.get('bairro_selecionado');

      // Carregar bairros salvos
      _carregarBairrosSalvos();

      // Carregar estados
      await _carregarEstados();

      // Se houver estado selecionado, carregar cidades
      if (_estadoSelecionado != null) {
        await _carregarCidades(_estadoSelecionado!);
      }

      notifyListeners();
    } catch (e) {
      _erro = 'Erro ao inicializar: $e';
      debugPrint(_erro);
      notifyListeners();
    }
  }

  // Carregar Estados
  Future<void> _carregarEstados() async {
    try {
      _carregando = true;
      _erro = null;
      notifyListeners();

      _estados = await IbgeService.buscarEstados();

      _carregando = false;
      notifyListeners();
    } catch (e) {
      _erro = 'Erro ao carregar estados: $e';
      _carregando = false;
      debugPrint(_erro);
      notifyListeners();
    }
  }

  // Carregar Cidades
  Future<void> _carregarCidades(String uf) async {
    try {
      _carregando = true;
      _erro = null;
      _cidades = [];
      _bairros = [];
      notifyListeners();

      _cidades = await IbgeService.buscarCidades(uf);

      _carregando = false;
      notifyListeners();
    } catch (e) {
      _erro = 'Erro ao carregar cidades: $e';
      _carregando = false;
      debugPrint(_erro);
      notifyListeners();
    }
  }

  // Selecionar Estado
  Future<void> selecionarEstado(String estado) async {
    try {
      _estadoSelecionado = estado;
      _cidadeSelecionada = null;
      _bairroSelecionado = null;
      _bairros = [];

      // Salvar no Hive
      await _configBox.put('estado_selecionado', estado);
      await _configBox.delete('cidade_selecionada');
      await _configBox.delete('bairro_selecionado');

      // Carregar cidades do novo estado
      await _carregarCidades(estado);

      notifyListeners();
    } catch (e) {
      _erro = 'Erro ao selecionar estado: $e';
      debugPrint(_erro);
      notifyListeners();
    }
  }

  // Selecionar Cidade
  Future<void> selecionarCidade(String cidade) async {
    try {
      _cidadeSelecionada = cidade;
      _bairroSelecionado = null;

      // Salvar no Hive
      await _configBox.put('cidade_selecionada', cidade);
      await _configBox.delete('bairro_selecionado');

      // Carregar bairros da cidade
      _carregarBairrosSalvos();

      notifyListeners();
    } catch (e) {
      _erro = 'Erro ao selecionar cidade: $e';
      debugPrint(_erro);
      notifyListeners();
    }
  }

  // Selecionar Bairro
  Future<void> selecionarBairro(String bairro) async {
    try {
      _bairroSelecionado = bairro;

      // Salvar no Hive
      await _configBox.put('bairro_selecionado', bairro);

      notifyListeners();
    } catch (e) {
      _erro = 'Erro ao selecionar bairro: $e';
      debugPrint(_erro);
      notifyListeners();
    }
  }

  // Adicionar Bairro
  Future<void> adicionarBairro(String bairro) async {
    try {
      if (_cidadeSelecionada == null) {
        _erro = 'Selecione uma cidade primeiro';
        notifyListeners();
        return;
      }

      if (bairro.isEmpty) {
        _erro = 'Nome do bairro não pode estar vazio';
        notifyListeners();
        return;
      }

      // Chave única: estado_cidade
      final chave = '${_estadoSelecionado}_${_cidadeSelecionada}';

      // Obter bairros existentes
      List<String> bairrosExistentes = _bairrosBox.get(chave, defaultValue: []);

      // Verificar se já existe
      if (bairrosExistentes.contains(bairro)) {
        _erro = 'Este bairro já foi adicionado';
        notifyListeners();
        return;
      }

      // Adicionar novo bairro
      bairrosExistentes.add(bairro);
      await _bairrosBox.put(chave, bairrosExistentes);

      _carregarBairrosSalvos();
      notifyListeners();
    } catch (e) {
      _erro = 'Erro ao adicionar bairro: $e';
      debugPrint(_erro);
      notifyListeners();
    }
  }

  // Remover Bairro
  Future<void> removerBairro(String bairro) async {
    try {
      final chave = '${_estadoSelecionado}_${_cidadeSelecionada}';
      List<String> bairrosExistentes = _bairrosBox.get(chave, defaultValue: []);

      bairrosExistentes.remove(bairro);
      await _bairrosBox.put(chave, bairrosExistentes);

      _carregarBairrosSalvos();
      notifyListeners();
    } catch (e) {
      _erro = 'Erro ao remover bairro: $e';
      debugPrint(_erro);
      notifyListeners();
    }
  }

  // Carregar Bairros Salvos
  void _carregarBairrosSalvos() {
    try {
      if (_estadoSelecionado == null || _cidadeSelecionada == null) {
        _bairros = [];
        return;
      }

      final chave = '${_estadoSelecionado}_${_cidadeSelecionada}';
      _bairros = List<String>.from(_bairrosBox.get(chave, defaultValue: []));
    } catch (e) {
      _erro = 'Erro ao carregar bairros: $e';
      debugPrint(_erro);
    }
  }

  // Limpar Erro
  void limparErro() {
    _erro = null;
    notifyListeners();
  }

  // Resetar Tudo
  Future<void> resetarTudo() async {
    try {
      await _configBox.clear();
      await _bairrosBox.clear();

      _estadoSelecionado = null;
      _cidadeSelecionada = null;
      _bairroSelecionado = null;
      _bairros = [];
      _cidades = [];

      notifyListeners();
    } catch (e) {
      _erro = 'Erro ao resetar: $e';
      debugPrint(_erro);
      notifyListeners();
    }
  }

  // Getter para verificar se está configurado
  bool get temConfiguracao =>
      _estadoSelecionado != null && _cidadeSelecionada != null;

  // Getter para descrição da localização
  String get descricaoLocalizacao {
    if (!temConfiguracao) return 'Não configurado';
    return '$_cidadeSelecionada - $_estadoSelecionado';
  }
}
