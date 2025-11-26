import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Trash2, Loader2, Calendar, User, Building2, GraduationCap, Hash } from 'lucide-react';
import { format } from 'date-fns';

export default function SubmissionsViewer() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: submissions = [], isLoading } = trpc.admin.submissions.getAll.useQuery();
  const { data: universities = [] } = trpc.admin.universities.getAll.useQuery();
  const { data: specializations = [] } = trpc.admin.specializations.getAll.useQuery();

  const deleteMutation = trpc.admin.submissions.delete.useMutation({
    onSuccess: () => {
      utils.admin.submissions.getAll.invalidate();
      utils.admin.getStatistics.invalidate();
      toast.success('Submission deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedSubmissionId(null);
    },
    onError: (error) => {
      toast.error('Failed to delete submission: ' + error.message);
    },
  });

  const handleDeleteClick = (id: number) => {
    setSelectedSubmissionId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedSubmissionId) return;
    deleteMutation.mutate({ id: selectedSubmissionId });
  };

  const getUniversityName = (universityId: number) => {
    const university = universities.find(u => u.id === universityId);
    return university?.name || 'Unknown';
  };

  const getSpecializationName = (specializationId: number) => {
    const specialization = specializations.find(s => s.id === specializationId);
    return specialization?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Submissions Viewer</h3>
          <p className="text-sm text-gray-600">View and manage all student submissions</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Total: {submissions.length}
        </Badge>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">No submissions found</p>
          <p className="text-sm text-gray-500 mt-1">Submissions will appear here once students start submitting assignments</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Student Name</TableHead>
                  <TableHead className="font-semibold">University</TableHead>
                  <TableHead className="font-semibold">Specialization</TableHead>
                  <TableHead className="font-semibold">Group</TableHead>
                  <TableHead className="font-semibold">Submitted At</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{submission.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{getUniversityName(submission.universityId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{getSpecializationName(submission.specializationId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <Badge variant="secondary" className="text-xs">
                          {submission.groupNumber}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(submission.id)}
                        className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the submission record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSubmissionId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
