class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.userId,
    required this.username,
    required this.role,
  });

  final String accessToken;
  final int userId;
  final String username;
  final String role;

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      accessToken: json['access_token'] as String,
      userId: json['user_id'] as int,
      username: json['username'] as String,
      role: json['role'] as String,
    );
  }
}

class UploadEpisodeResult {
  const UploadEpisodeResult({
    required this.dramaId,
    required this.episodeId,
    required this.videoUrl,
    required this.hasSubtitle,
  });

  final int dramaId;
  final int episodeId;
  final String videoUrl;
  final bool hasSubtitle;

  factory UploadEpisodeResult.fromJson(Map<String, dynamic> json) {
    return UploadEpisodeResult(
      dramaId: json['drama_id'] as int,
      episodeId: json['episode_id'] as int,
      videoUrl: json['video_url'] as String,
      hasSubtitle: json['has_subtitle'] as bool? ?? false,
    );
  }
}
