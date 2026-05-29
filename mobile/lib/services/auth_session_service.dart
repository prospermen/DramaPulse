import 'package:shared_preferences/shared_preferences.dart';

import '../models/auth.dart';

class AuthSessionService {
  static const _tokenKey = 'upload_access_token';
  static const _userIdKey = 'upload_user_id';
  static const _usernameKey = 'upload_username';
  static const _roleKey = 'upload_role';

  Future<AuthSession?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final username = prefs.getString(_usernameKey);
    if (token == null || token.isEmpty || username == null) {
      return null;
    }
    return AuthSession(
      accessToken: token,
      userId: prefs.getInt(_userIdKey) ?? 0,
      username: username,
      role: prefs.getString(_roleKey) ?? 'uploader',
    );
  }

  Future<void> save(AuthSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, session.accessToken);
    await prefs.setInt(_userIdKey, session.userId);
    await prefs.setString(_usernameKey, session.username);
    await prefs.setString(_roleKey, session.role);
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userIdKey);
    await prefs.remove(_usernameKey);
    await prefs.remove(_roleKey);
  }
}
