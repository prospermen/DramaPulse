import 'package:shared_preferences/shared_preferences.dart';

class AnonymousUserService {
  static const _key = 'ignitenow_anonymous_user_id';

  Future<String> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getString(_key);
    if (existing != null && existing.isNotEmpty) {
      return existing;
    }
    final generated = 'anonymous_${DateTime.now().microsecondsSinceEpoch}';
    await prefs.setString(_key, generated);
    return generated;
  }
}
