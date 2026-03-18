import 'package:flutter/foundation.dart' show kIsWeb;

class PermissionUtils {
  static Future<bool> solicitarPermissoesBasicas() async {
    if (kIsWeb) return true;
    return true;
  }
}
