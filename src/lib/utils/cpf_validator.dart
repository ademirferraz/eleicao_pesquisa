// lib/utils/cpf_validator.dart
class CpfValidator {
  static bool isValid(String cpf) {
    cpf = cpf.replaceAll(RegExp(r'\D'), '');
    if (cpf.length != 11) return false;
    if (RegExp(r'^(\d)\1*$').hasMatch(cpf)) return false;

    List<int> numbers = cpf.split('').map((d) => int.parse(d)).toList();
    for (int t = 9; t < 11; t++) {
      int d = 0;
      for (int i = 0; i < t; i++) d += numbers[i] * ((t + 1) - i);
      d = ((10 * d) % 11) % 10;
      if (numbers[t] != d) return false;
    }
    return true;
  }
}
