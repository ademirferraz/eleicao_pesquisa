import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationUtils {
  static final FlutterLocalNotificationsPlugin plugin =
      FlutterLocalNotificationsPlugin();

  // Inicialização
  static Future<void> initialize() async {
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const InitializationSettings settings =
        InitializationSettings(android: androidSettings);

    await plugin.initialize(
      initializationSettings: settings,
    );
  }

  // Mostrar notificação simples
  static Future<void> showNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'default_channel_id',
      'Default Channel',
      channelDescription: 'Canal padrão para notificações',
      importance: Importance.max,
      priority: Priority.high,
    );

    const NotificationDetails details =
        NotificationDetails(android: androidDetails);

    await plugin.show(
      id,
      title,
      body,
      notificationDetails: details,
    );
  }
}
