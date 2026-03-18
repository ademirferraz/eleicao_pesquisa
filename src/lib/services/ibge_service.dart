import 'dart:convert';
import 'package:http/http.dart' as http;

class IbgeService {
  /// Busca a lista de estados (UFs) do Brasil
  static Future<List<Map<String, String>>> buscarEstados() async {
    final url = Uri.parse("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
    
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        List<dynamic> dados = json.decode(response.body);
        return dados.map((e) => {
          "sigla": e['sigla'].toString(),
          "nome": e['nome'].toString(),
        }).toList();
      }
    } catch (e) {
      debugPrint("Erro ao buscar estados: $e");
    }
    return [];
  }

  /// Busca as cidades de um estado específico (ex: PE)
  static Future<List<String>> buscarCidades(String uf) async {
    final url = Uri.parse("https://servicodados.ibge.gov.br/api/v1/localidades/estados/$uf/municipios?orderBy=nome");
    
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        List<dynamic> dados = json.decode(response.body);
        return dados.map((m) => m['nome'].toString()).toList();
      }
    } catch (e) {
      debugPrint("Erro ao buscar cidades: $e");
    }
    return [];
  }
}