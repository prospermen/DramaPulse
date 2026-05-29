class DramaSummary {
  const DramaSummary({
    required this.dramaId,
    required this.title,
    required this.description,
    required this.coverUrl,
  });

  final int dramaId;
  final String title;
  final String description;
  final String coverUrl;

  factory DramaSummary.fromJson(Map<String, dynamic> json) {
    return DramaSummary(
      dramaId: json['drama_id'] as int,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      coverUrl: json['cover_url'] as String? ?? '',
    );
  }
}
