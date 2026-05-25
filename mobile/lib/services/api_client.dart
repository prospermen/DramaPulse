import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/drama.dart';
import '../models/episode.dart';
import '../models/episode_summary.dart';
import '../models/interaction.dart';

class ApiClient {
  ApiClient({String? baseUrl}) : baseUrl = baseUrl ?? AppConfig.baseUrl;

  final String baseUrl;

  Future<List<DramaSummary>> fetchDramas() async {
    final uri = Uri.parse('$baseUrl/api/player/dramas');
    final response = await http.get(uri);
    if (response.statusCode >= 400) {
      throw Exception('短剧列表请求失败：${response.statusCode}');
    }
    final body =
        jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
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
    final body =
        jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
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
    final body =
        jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
    return Episode.fromJson(body['data'] as Map<String, dynamic>);
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
