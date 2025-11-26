import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { Building2, GraduationCap, FileText, BarChart3, Loader2 } from 'lucide-react';
import UniversitiesManager from '@/components/admin/UniversitiesManager';
import SpecializationsManager from '@/components/admin/SpecializationsManager';
import SubmissionsViewer from '@/components/admin/SubmissionsViewer';

export default function AdminDashboard() {
  // تم تعطيل الحماية بناءً على طلب المستخدم
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStatistics.useQuery(undefined, {
    enabled: true, // تم تفعيل الاستعلام دائماً
  });

  // Check if user is admin
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // تم تعطيل التحقق من صلاحية Admin
  // if (!user || user.role !== 'admin') {
  //   // Redirect to custom admin login page
  //   window.location.href = '/admin/login';
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage universities, specializations, and submissions</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Logged in as</p>
              {/* التعديل هنا: فحص وجود user قبل الوصول إلى خصائصه */}
              <p className="font-semibold text-gray-900">
                {user ? (user.name || user.email || 'Admin') : 'Guest/Not Logged In'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Universities</CardTitle>
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              ) : (
                <div className="text-3xl font-bold text-gray-900">{stats?.totalUniversities || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Specializations</CardTitle>
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              ) : (
                <div className="text-3xl font-bold text-gray-900">{stats?.totalSpecializations || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              ) : (
                <div className="text-3xl font-bold text-gray-900">{stats?.totalSubmissions || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Recent (7 days)</CardTitle>
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
              ) : (
                <div className="text-3xl font-bold text-gray-900">{stats?.recentSubmissions || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card className="shadow-xl border-0">
          <Tabs defaultValue="universities" className="w-full">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
              <TabsList className="grid w-full grid-cols-3 bg-white">
                <TabsTrigger value="universities" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
                  <Building2 className="w-4 h-4 mr-2" />
                  Universities
                </TabsTrigger>
                <TabsTrigger value="specializations" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Specializations
                </TabsTrigger>
                <TabsTrigger value="submissions" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900">
                  <FileText className="w-4 h-4 mr-2" />
                  Submissions
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="universities" className="mt-0">
                <UniversitiesManager />
              </TabsContent>

              <TabsContent value="specializations" className="mt-0">
                <SpecializationsManager />
              </TabsContent>

              <TabsContent value="submissions" className="mt-0">
                <SubmissionsViewer />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}