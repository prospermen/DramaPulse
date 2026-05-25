import 'package:flutter/material.dart';

class EffectLayer extends StatefulWidget {
  const EffectLayer({super.key, required this.effectKey});

  final int effectKey;

  @override
  State<EffectLayer> createState() => _EffectLayerState();
}

class _EffectLayerState extends State<EffectLayer> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 720));
    _scale = CurvedAnimation(parent: _controller, curve: Curves.easeOutBack);
  }

  @override
  void didUpdateWidget(covariant EffectLayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.effectKey != widget.effectKey) {
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.effectKey == 0) {
      return const SizedBox.shrink();
    }
    return IgnorePointer(
      child: Center(
        child: ScaleTransition(
          scale: _scale,
          child: FadeTransition(
            opacity: ReverseAnimation(_controller),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF2C14E),
                borderRadius: BorderRadius.circular(8),
                boxShadow: const [BoxShadow(color: Color(0x55000000), blurRadius: 24)],
              ),
              child: const Text(
                '+1',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF10201E)),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
