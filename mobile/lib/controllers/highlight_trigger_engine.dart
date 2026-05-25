import '../models/highlight.dart';

class HighlightTriggerEngine {
  HighlightTriggerEngine({this.minIntervalSeconds = 10});

  final double minIntervalSeconds;
  final Set<int> _triggeredIds = <int>{};
  double _lastTriggerTime = -9999;

  Highlight? pick(double currentTime, List<Highlight> highlights) {
    if (currentTime - _lastTriggerTime < minIntervalSeconds) {
      return null;
    }
    final candidates = highlights
        .where(
          (highlight) =>
              currentTime >= highlight.startTime &&
              currentTime <= highlight.endTime &&
              !_triggeredIds.contains(highlight.highlightId),
        )
        .toList()
      ..sort((a, b) {
        final score = b.triggerScore.compareTo(a.triggerScore);
        if (score != 0) return score;
        return a.startTime.compareTo(b.startTime);
      });
    if (candidates.isEmpty) {
      return null;
    }
    final selected = candidates.first;
    _triggeredIds.add(selected.highlightId);
    _lastTriggerTime = currentTime;
    return selected;
  }

  void reset() {
    _triggeredIds.clear();
    _lastTriggerTime = -9999;
  }
}
