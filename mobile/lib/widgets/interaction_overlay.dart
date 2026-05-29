import 'package:flutter/material.dart';

import '../models/highlight.dart';

class InteractionOverlay extends StatelessWidget {
  const InteractionOverlay({
    super.key,
    required this.highlight,
    required this.onTap,
  });

  final Highlight highlight;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 20,
      right: 20,
      bottom: 34,
      child: Material(
        color: Colors.transparent,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: const Color(0xEE10201E),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFF2C14E), width: 1.2),
            boxShadow: const [BoxShadow(color: Color(0x55000000), blurRadius: 24, offset: Offset(0, 10))],
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        highlight.emotion,
                        style: const TextStyle(color: Color(0xFFF2C14E), fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${highlight.highlightType} 高光已触发',
                        style: const TextStyle(color: Colors.white, fontSize: 15),
                      ),
                    ],
                  ),
                ),
                FilledButton(onPressed: onTap, child: Text(highlight.buttonText)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
