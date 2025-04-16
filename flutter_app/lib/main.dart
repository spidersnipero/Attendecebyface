import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/attendance_by_date_screen.dart';
import 'screens/attendance_by_name_screen.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    final GoRouter _router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(path: '/', builder: (context, state) => const LoginScreen()),
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const DashboardScreen(),
        ),
        GoRoute(
          path: '/attendance-by-date',
          builder: (context, state) => const AttendanceByDateScreen(),
        ),
        GoRoute(
          path: '/attendance-by-name',
          builder: (context, state) => const AttendanceByNameScreen(),
        ),
      ],
    );

    return MaterialApp.router(
      title: 'Student Attendance',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        brightness: Brightness.light,
        useMaterial3: true,
      ),
      routerConfig: _router,
    );
  }
}
