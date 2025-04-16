import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../widgets/bottom_nav_bar.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  File? _image;
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _selectedPeriod;
  List<String> _detectedNames = [];
  Map<String, bool> _checkedNames = {};

  // Student IDs list from the React app
  final List<String> _allNames = [
    "231FA04002",
    "231FA04024",
    "231FA04030",
    "231FA04053",
    "231FA04085",
    "231FA04087",
    "231FA04088",
    "231FA04091",
    "231FA04094",
    "231FA04096",
    "231FA04097",
    "231FA04101",
    "231FA04109",
    "231FA04131",
    "231FA04144",
    "231FA04163",
    "231FA04164",
    "231FA04168",
    "231FA04169",
    "231FA04186",
    "231FA04192",
    "231FA04195",
    "231FA04222",
    "231FA04244",
    "231FA04245",
    "231FA04251",
    "231FA04252",
    "231FA04254",
    "231FA04257",
    "231FA04258",
    "231FA04266",
    "231FA04273",
    "231FA04329",
    "231FA04330",
    "231FA04331",
    "231FA04332",
    "231FA04335",
    "231FA04336",
    "231FA04341",
    "231FA04343",
    "231FA04360",
    "231FA04365",
    "231FA04374",
    "231FA04391",
    "231FA04408",
    "231FA04409",
    "231FA04607",
    "231FA04801",
    "231FA04F74",
    "231FA04F80",
    "231FA04F99",
    "231FA04G02",
    "231FA04G08",
    "231FA04G18",
    "231FA04G23",
    "231FA04625",
    "231FA04G31",
    "231FA04G37",
    "231FA04G40",
    "231FA04641",
    "231FA04645",
    "231FA04647",
    "231FA04G48",
    "231FA04G76",
    "241LA04001",
  ];

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? pickedFile = await _picker.pickImage(
      source: ImageSource.gallery,
    );

    if (pickedFile != null) {
      setState(() {
        _image = File(pickedFile.path);
        _detectedNames = [];
        _checkedNames = {};
      });
    }
  }

  Future<void> _uploadImage() async {
    if (_image == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an image first.')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Create multipart request
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('http://192.168.1.39:8000/uploadimage/'),
      );

      // Add file
      request.files.add(
        await http.MultipartFile.fromPath('file', _image!.path),
      );

      // Send request
      var response = await request.send();

      // Check if successful
      if (response.statusCode == 200) {
        // Convert to response
        var responseData = await response.stream.bytesToString();
        var data = jsonDecode(responseData);

        setState(() {
          _detectedNames = List<String>.from(data['detected_names']);

          // Auto-check detected names
          Map<String, bool> updatedCheckedNames = {};
          for (var name in _detectedNames) {
            updatedCheckedNames[name] = true;
          }
          _checkedNames = updatedCheckedNames;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to upload image. Try again.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _handleCheckboxChange(String name) {
    setState(() {
      _checkedNames[name] = !(_checkedNames[name] ?? false);
    });
  }

  Future<void> _submitAttendance() async {
    final selectedNames =
        _checkedNames.entries
            .where((entry) => entry.value)
            .map((entry) => entry.key)
            .toList();

    if (selectedNames.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No names selected for attendance.')),
      );
      return;
    }

    if (_selectedPeriod == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a period before submitting attendance.'),
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final response = await http.post(
        Uri.parse('http://192.168.1.39:8000/markattendance/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'names': selectedNames,
          'period': int.parse(_selectedPeriod!),
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(data['message'])));
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['detail'] ?? 'Failed to mark attendance');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Attendance submission failed: $e')),
      );
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Face Recognition Attendance'),
        backgroundColor: Colors.blue.shade700,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_month),
            onPressed: () => context.go('/attendance-by-date'),
            tooltip: 'Attendance by Date',
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.go('/attendance-by-name'),
            tooltip: 'Attendance by Name',
          ),
        ],
      ),
      bottomNavigationBar: const BottomNavBar(currentIndex: 0),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.blue.shade50, Colors.white],
          ),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Period Selection Card
              Card(
                elevation: 4.0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.schedule, color: Colors.blue.shade700),
                          const SizedBox(width: 8),
                          const Text(
                            'Select Period',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _selectedPeriod,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.grey.shade300),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: Colors.blue.shade700),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                        ),
                        hint: const Text('Select Period'),
                        items:
                            List.generate(8, (index) => index + 1)
                                .map(
                                  (period) => DropdownMenuItem(
                                    value: period.toString(),
                                    child: Text('Period $period'),
                                  ),
                                )
                                .toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedPeriod = value;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Image Upload Card
              Card(
                elevation: 4.0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.camera_alt, color: Colors.blue.shade700),
                          const SizedBox(width: 8),
                          const Text(
                            'Upload Image',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _pickImage,
                              icon: const Icon(Icons.photo_library),
                              label: const Text('Pick Image'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue.shade700,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 12,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _isLoading ? null : _uploadImage,
                              icon:
                                  _isLoading
                                      ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2,
                                        ),
                                      )
                                      : const Icon(Icons.cloud_upload),
                              label: Text(
                                _isLoading ? 'Uploading...' : 'Upload',
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue.shade700,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 12,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (_image != null) ...[
                        const SizedBox(height: 16),
                        const Text(
                          'Preview:',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Center(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.file(
                              _image!,
                              height: 250,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Attendance Selection Card
              Card(
                elevation: 4.0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.people, color: Colors.blue.shade700),
                          const SizedBox(width: 8),
                          const Text(
                            'Select Attendance',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8.0,
                        runSpacing: 8.0,
                        children:
                            _allNames.map((name) {
                              return Container(
                                width:
                                    MediaQuery.of(context).size.width / 3 - 20,
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: Colors.grey.shade300,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: CheckboxListTile(
                                  dense: true,
                                  title: Text(
                                    name,
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                  value: _checkedNames[name] ?? false,
                                  onChanged: (_) => _handleCheckboxChange(name),
                                  controlAffinity:
                                      ListTileControlAffinity.leading,
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                  ),
                                ),
                              );
                            }).toList(),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Submit Button
              Center(
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _submitAttendance,
                  icon:
                      _isSubmitting
                          ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                          : const Icon(Icons.check_circle),
                  label: Text(
                    _isSubmitting ? 'Submitting...' : 'Submit Attendance',
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade700,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
