import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/auth.dart';
import '../models/drama.dart';
import '../models/episode.dart';
import '../models/episode_summary.dart';
import '../models/interaction.dart';

class ApiClient {
  ApiClient({String? baseUrl}) : baseUrl = baseUrl ?? AppConfig.baseUrl;

  final String baseUrl;

  Map<String, dynamic> _decodeBody(http.Response response) {
    return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
  }

  String _errorMessage(http.Response response, String fallback) {
    try {
      final body = _decodeBody(response);
      final detail = body['detail'];
      if (detail is String && detail.isNotEmpty) {
        return detail;
      }
      final message = body['message'];
      if (message is String && message.isNotEmpty) {
        return message;
      }
    } catch (_) {
      // Keep the fallback when the server returns non-JSON.
    }
    return '$fallback：${response.statusCode}';
  }

  Future<List<DramaSummary>> fetchDramas() async {
    final uri = Uri.parse('$baseUrl/api/player/dramas');
    final response = await http.get(uri);
    if (response.statusCode >= 400) {
      throw Exception('短剧列表请求失败：${response.statusCode}');
    }
    final body = _decodeBody(response);
    return ((body['data'] as List<dynamic>? ?? <dynamic>[])
            .cast<Map<String, dynamic>>())
        .map(DramaSummary.fromJson)
        .toList();
  }

  Future<List<EpisodeSummary>> fetchEpisodes(int dramaId) async {
    final uri = Uri.parse('$baseUrl/api/player/dramas/$dramaId/episodes');
    final response = await http.get(uri);
    if (response.statusCode >= 400) {
      throw Exception('剧集列表请求失败：${response.statusCode}');
    }
    final body = _decodeBody(response);
    return ((body['data'] as List<dynamic>? ?? <dynamic>[])
            .cast<Map<String, dynamic>>())
        .map(EpisodeSummary.fromJson)
        .toList();
  }

  Future<Episode> fetchPlayerEpisode(int episodeId) async {
    final uri = Uri.parse('$baseUrl/api/player/episodes/$episodeId');
    final response = await http.get(uri);
    if (response.statusCode >= 400) {
      throw Exception('播放数据请求失败：${response.statusCode}');
    }
    final body = _decodeBody(response);
    return Episode.fromJson(body['data'] as Map<String, dynamic>);
  }

  Future<AuthSession> register({
    required String username,
    required String password,
  }) async {
    final uri = Uri.parse('$baseUrl/api/auth/register');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    if (response.statusCode >= 400) {
      throw Exception(_errorMessage(response, '注册失败'));
    }
    final body = _decodeBody(response);
    return AuthSession.fromJson(body['data'] as Map<String, dynamic>);
  }

  Future<AuthSession> login({
    required String username,
    required String password,
  }) async {
    final uri = Uri.parse('$baseUrl/api/auth/login');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    if (response.statusCode >= 400) {
      throw Exception(_errorMessage(response, '登录失败'));
    }
    final body = _decodeBody(response);
    return AuthSession.fromJson(body['data'] as Map<String, dynamic>);
  }

  Future<UploadEpisodeResult> uploadEpisode({
    required String accessToken,
    int? dramaId,
    required String dramaTitle,
    required String dramaDescription,
    required int episodeNo,
    required String episodeTitle,
    required double duration,
    required PlatformFile videoFile,
    PlatformFile? subtitleFile,
    required String subtitleContent,
  }) async {
    final uri = Uri.parse('$baseUrl/api/uploads/episodes');
    final request = http.MultipartRequest('POST', uri)
      ..headers['Authorization'] = 'Bearer $accessToken'
      ..fields['episode_no'] = episodeNo.toString()
      ..fields['episode_title'] = episodeTitle
      ..fields['duration'] = duration.toString()
      ..fields['drama_description'] = dramaDescription
      ..fields['subtitle_content'] = subtitleContent;
    if (dramaId != null) {
      request.fields['drama_id'] = dramaId.toString();
    } else {
      request.fields['drama_title'] = dramaTitle;
    }
    request.files.add(await _multipartFile('video_file', videoFile));
    if (subtitleFile != null) {
      request.files.add(await _multipartFile('subtitle_file', subtitleFile));
    }
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    if (response.statusCode >= 400) {
      throw Exception(_errorMessage(response, '上传失败'));
    }
    final body = _decodeBody(response);
    return UploadEpisodeResult.fromJson(body['data'] as Map<String, dynamic>);
  }

  Future<http.MultipartFile> _multipartFile(
    String field,
    PlatformFile file,
  ) async {
    if (file.path != null) {
      return http.MultipartFile.fromPath(field, file.path!, filename: file.name);
    }
    final bytes = file.bytes;
    if (bytes == null) {
      throw Exception('无法读取文件：${file.name}');
    }
    return http.MultipartFile.fromBytes(field, bytes, filename: file.name);
  }

  Future<void> postInteraction(InteractionPayload payload) async {
    final uri = Uri.parse('$baseUrl/api/interactions');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload.toJson()),
    );
    if (response.statusCode >= 400) {
      throw Exception('互动回传失败：${response.statusCode}');
    }
  }
}
