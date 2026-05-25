import '../models/highlight.dart';
import '../models/interaction.dart';
import 'api_client.dart';

class InteractionLogger {
  const InteractionLogger(this.apiClient);

  final ApiClient apiClient;

  Future<void> log({
    required String userId,
    required int episodeId,
    required Highlight highlight,
    required String actionType,
    required double watchTime,
  }) {
    final minuteBucket = DateTime.now().millisecondsSinceEpoch ~/ 60000;
    final key = '${userId}_${highlight.highlightId}_${actionType}_$minuteBucket';
    return apiClient.postInteraction(
      InteractionPayload(
        userId: userId,
        episodeId: episodeId,
        highlightId: highlight.highlightId,
        actionType: actionType,
        actionValue: actionType == 'click' ? highlight.buttonText : '',
        watchTime: watchTime,
        idempotencyKey: key,
      ),
    );
  }
}
