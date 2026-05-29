import 'highlight.dart';

class Episode {
  const Episode({
    required this.episodeId,
    required this.title,
    required this.videoUrl,
    required this.duration,
    required this.highlights,
  });

  final int episodeId;
  final String title;
  final String videoUrl;
  final double duration;
  final List<Highlight> highlights;

  factory Episode.fromJson(Map<String, dynamic> json) {
    return Episode(
      episodeId: json['episode_id'] as int,
      title: json['title'] as String,
      videoUrl: json['video_url'] as String,
      duration: (json['duration'] as num).toDouble(),
      highlights: ((json['highlights'] as List<dynamic>? ?? <dynamic>[])
              .cast<Map<String, dynamic>>())
          .map(Highlight.fromJson)
          .toList(),
    );
  }
}
