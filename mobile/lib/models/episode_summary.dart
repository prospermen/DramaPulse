class EpisodeSummary {
  const EpisodeSummary({
    required this.episodeId,
    required this.dramaId,
    required this.episodeNo,
    required this.title,
    required this.duration,
    required this.publishedHighlightCount,
  });

  final int episodeId;
  final int dramaId;
  final int episodeNo;
  final String title;
  final double duration;
  final int publishedHighlightCount;

  factory EpisodeSummary.fromJson(Map<String, dynamic> json) {
    return EpisodeSummary(
      episodeId: json['episode_id'] as int,
      dramaId: json['drama_id'] as int,
      episodeNo: json['episode_no'] as int,
      title: json['title'] as String,
      duration: (json['duration'] as num).toDouble(),
      publishedHighlightCount: json['published_highlight_count'] as int? ?? 0,
    );
  }
}
