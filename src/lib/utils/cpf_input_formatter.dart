// lib/utils/cpf_input_formatter.dart
import 'package:flutter/services.dart';

class CpfInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    var text = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (text.length > 11) text = text.substring(0, 11);
    final buffer = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      if (i == 3 || i == 6) buffer.write('.');
      else if (i == 9) buffer.write('-');
      buffer.write(text[i]);
    }
    return newValue.copyWith(
      text: buffer.toString(),
      selection: TextSelection.collapsed(offset: buffer.length),
    );
  }
}
