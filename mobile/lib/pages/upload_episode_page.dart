import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../models/auth.dart';
import '../services/api_client.dart';
import '../services/auth_session_service.dart';
import 'player_page.dart';

class UploadEpisodePage extends StatefulWidget {
  const UploadEpisodePage({super.key});

  @override
  State<UploadEpisodePage> createState() => _UploadEpisodePageState();
}

class _UploadEpisodePageState extends State<UploadEpisodePage> {
  final _apiClient = ApiClient();
  final _sessionService = AuthSessionService();
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _dramaTitleController = TextEditingController();
  final _dramaDescriptionController = TextEditingController();
  final _episodeNoController = TextEditingController(text: '1');
  final _episodeTitleController = TextEditingController();
  final _durationController = TextEditingController(text: '0');
  final _subtitleController = TextEditingController();

  AuthSession? _session;
  PlatformFile? _videoFile;
  PlatformFile? _subtitleFile;
  bool _loading = false;
  String? _message;

  @override
  void initState() {
    super.initState();
    _loadSession();
  }

  Future<void> _loadSession() async {
    final session = await _sessionService.load();
    if (mounted) {
      setState(() => _session = session);
    }
  }

  Future<void> _authenticate({required bool register}) async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text;
    if (username.isEmpty || password.length < 6) {
      setState(() => _message = '请输入用户名和至少 6 位密码');
      return;
    }
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      final session = register
          ? await _apiClient.register(username: username, password: password)
          : await _apiClient.login(username: username, password: password);
      await _sessionService.save(session);
      setState(() {
        _session = session;
        _message = register ? '注册并登录成功' : '登录成功';
      });
    } catch (error) {
      setState(() => _message = error.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _pickVideo() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['mp4'],
      withData: true,
    );
    if (result != null && result.files.isNotEmpty) {
      setState(() => _videoFile = result.files.single);
    }
  }

  Future<void> _pickSubtitle() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['srt', 'vtt', 'txt'],
      withData: true,
    );
    if (result != null && result.files.isNotEmpty) {
      setState(() => _subtitleFile = result.files.single);
    }
  }

  Future<void> _upload() async {
    final session = _session;
    if (session == null) {
      setState(() => _message = '请先登录');
      return;
    }
    if (!_formKey.currentState!.validate()) {
      return;
    }
    final videoFile = _videoFile;
    if (videoFile == null) {
      setState(() => _message = '请选择 MP4 视频文件');
      return;
    }
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      final result = await _apiClient.uploadEpisode(
        accessToken: session.accessToken,
        dramaTitle: _dramaTitleController.text.trim(),
        dramaDescription: _dramaDescriptionController.text.trim(),
        episodeNo: int.parse(_episodeNoController.text.trim()),
        episodeTitle: _episodeTitleController.text.trim(),
        duration: double.tryParse(_durationController.text.trim()) ?? 0,
        videoFile: videoFile,
        subtitleFile: _subtitleFile,
        subtitleContent: _subtitleController.text.trim(),
      );
      if (!mounted) {
        return;
      }
      setState(() => _message = '上传成功，剧集 #${result.episodeId} 已入库');
      final openPlayer = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('上传成功'),
          content: Text(result.hasSubtitle ? '剧集已入库，可去后台触发 AI 识别。' : '剧集已入库，但还没有字幕。'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('留在此页'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('打开播放页'),
            ),
          ],
        ),
      );
      if (mounted && openPlayer == true) {
        await Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => PlayerPage(episodeId: result.episodeId),
          ),
        );
      }
    } catch (error) {
      setState(() => _message = error.toString());
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _dramaTitleController.dispose();
    _dramaDescriptionController.dispose();
    _episodeNoController.dispose();
    _episodeTitleController.dispose();
    _durationController.dispose();
    _subtitleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF101614),
      appBar: AppBar(
        backgroundColor: const Color(0xFF101614),
        foregroundColor: Colors.white,
        title: const Text('上传剧集'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _UploadPanel(
              child: _session == null ? _authForm() : _SessionHeader(session: _session!, onLogout: _logout),
            ),
            const SizedBox(height: 16),
            _UploadPanel(
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _Field(controller: _dramaTitleController, label: '短剧标题', required: true),
                    _Field(controller: _dramaDescriptionController, label: '短剧简介', maxLines: 2),
                    _Field(controller: _episodeNoController, label: '集数', keyboardType: TextInputType.number, required: true),
                    _Field(controller: _episodeTitleController, label: '剧集标题', required: true),
                    _Field(controller: _durationController, label: '时长（秒）', keyboardType: TextInputType.number),
                    _FileButton(
                      label: _videoFile == null ? '选择 MP4 视频' : '视频：${_videoFile!.name}',
                      icon: Icons.video_file,
                      onPressed: _pickVideo,
                    ),
                    const SizedBox(height: 10),
                    _FileButton(
                      label: _subtitleFile == null ? '选择字幕文件（可选）' : '字幕：${_subtitleFile!.name}',
                      icon: Icons.subtitles,
                      onPressed: _pickSubtitle,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _subtitleController,
                      minLines: 4,
                      maxLines: 8,
                      style: const TextStyle(color: Colors.white),
                      decoration: _inputDecoration('字幕文本（可选）'),
                    ),
                    const SizedBox(height: 18),
                    FilledButton.icon(
                      onPressed: _loading ? null : _upload,
                      icon: _loading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.cloud_upload),
                      label: const Text('上传并入库'),
                    ),
                  ],
                ),
              ),
            ),
            if (_message != null) ...[
              const SizedBox(height: 14),
              Text(_message!, style: const TextStyle(color: Color(0xFFF2C14E))),
            ],
          ],
        ),
      ),
    );
  }

  Widget _authForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('上传账号', style: _panelTitleStyle),
        const SizedBox(height: 12),
        _Field(controller: _usernameController, label: '用户名', required: true),
        _Field(controller: _passwordController, label: '密码', obscureText: true, required: true),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: _loading ? null : () => _authenticate(register: false),
                child: const Text('登录'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton(
                onPressed: _loading ? null : () => _authenticate(register: true),
                child: const Text('注册'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _logout() async {
    await _sessionService.clear();
    setState(() {
      _session = null;
      _message = '已退出登录';
    });
  }
}

class _SessionHeader extends StatelessWidget {
  const _SessionHeader({required this.session, required this.onLogout});

  final AuthSession session;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.verified_user, color: Color(0xFFF2C14E)),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            '${session.username} · ${session.role}',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
          ),
        ),
        TextButton(onPressed: onLogout, child: const Text('退出')),
      ],
    );
  }
}

class _UploadPanel extends StatelessWidget {
  const _UploadPanel({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFF13201D),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF2E4740)),
      ),
      child: Padding(padding: const EdgeInsets.all(16), child: child),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({
    required this.controller,
    required this.label,
    this.required = false,
    this.keyboardType,
    this.maxLines = 1,
    this.obscureText = false,
  });

  final TextEditingController controller;
  final String label;
  final bool required;
  final TextInputType? keyboardType;
  final int maxLines;
  final bool obscureText;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        maxLines: maxLines,
        obscureText: obscureText,
        style: const TextStyle(color: Colors.white),
        decoration: _inputDecoration(label),
        validator: required
            ? (value) => value == null || value.trim().isEmpty ? '必填' : null
            : null,
      ),
    );
  }
}

class _FileButton extends StatelessWidget {
  const _FileButton({
    required this.label,
    required this.icon,
    required this.onPressed,
  });

  final String label;
  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon),
      label: Text(label, overflow: TextOverflow.ellipsis),
    );
  }
}

InputDecoration _inputDecoration(String label) {
  return InputDecoration(
    labelText: label,
    labelStyle: const TextStyle(color: Color(0xFFBFD0CA)),
    enabledBorder: const OutlineInputBorder(
      borderSide: BorderSide(color: Color(0xFF2E4740)),
    ),
    focusedBorder: const OutlineInputBorder(
      borderSide: BorderSide(color: Color(0xFFF2C14E)),
    ),
  );
}

const _panelTitleStyle = TextStyle(
  color: Colors.white,
  fontSize: 18,
  fontWeight: FontWeight.w800,
);
