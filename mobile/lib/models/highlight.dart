class Highlight {
  const Highlight({
    required this.highlightId,
    required this.startTime,
    required this.endTime,
    required this.highlightType,
    required this.emotion,
    required this.intensity,
    required this.triggerScore,
    required this.buttonText,
    required this.effect,
  });

  final int highlightId;
  final double startTime;
  final double endTime;
  final String highlightType;
  final String emotion;
  final double intensity;
  final double triggerScore;
  final String buttonText;
  final String effect;

  factory Highlight.fromJson(Map<String, dynamic> json) {
    return Highlight(
      highlightId: json['highlight_id'] as int,
      startTime: (json['start_time'] as num).toDouble(),
      endTime: (json['end_time'] as num).toDouble(),
      highlightType: json['highlight_type'] as String,
      emotion: json['emotion'] as String? ?? '',
      intensity: (json['intensity'] as num).toDouble(),
      triggerScore: (json['trigger_score'] as num).toDouble(),
      buttonText: json['button_text'] as String,
      effect: json['effect'] as String,
    );
  }
}
