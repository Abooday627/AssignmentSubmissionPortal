import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

interface UniversityForm {
  name: string;
  telegramBotToken: string;
  telegramChatId: string;
}

export default function UniversitiesManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UniversityForm>({
    name: '',
    telegramBotToken: '',
    telegramChatId: '',
  });

  const utils = trpc.useUtils();
  const { data: universities = [], isLoading } = trpc.admin.universities.getAll.useQuery();
  const createMutation = trpc.admin.universities.create.useMutation({
    onSuccess: () => {
      utils.admin.universities.getAll.invalidate();
      utils.admin.getStatistics.invalidate();
      toast.success('University created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create university: ' + error.message);
    },
  });

  const updateMutation = trpc.admin.universities.update.useMutation({
    onSuccess: () => {
      utils.admin.universities.getAll.invalidate();
      toast.success('University updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update university: ' + error.message);
    },
  });

  const deleteMutation = trpc.admin.universities.delete.useMutation({
    onSuccess: () => {
      utils.admin.universities.getAll.invalidate();
      utils.admin.getStatistics.invalidate();
      toast.success('University deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedUniversityId(null);
    },
    onError: (error) => {
      toast.error('Failed to delete university: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      telegramBotToken: '',
      telegramChatId: '',
    });
    setSelectedUniversityId(null);
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.telegramBotToken.trim() || !formData.telegramChatId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (university: any) => {
    setSelectedUniversityId(university.id);
    setFormData({
      name: university.name,
      telegramBotToken: university.telegramBotToken,
      telegramChatId: university.telegramChatId,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedUniversityId) return;
    if (!formData.name.trim() || !formData.telegramBotToken.trim() || !formData.telegramChatId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    updateMutation.mutate({
      id: selectedUniversityId,
      ...formData,
    });
  };

  const handleDeleteClick = (id: number) => {
    setSelectedUniversityId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedUniversityId) return;
    deleteMutation.mutate({ id: selectedUniversityId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Universities Management</h3>
          <p className="text-sm text-gray-600">Add, edit, or remove universities</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add University
        </Button>
      </div>

      {universities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No universities found</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First University
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Telegram Bot Token</TableHead>
                <TableHead className="font-semibold">Telegram Chat ID</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {universities.map((university) => (
                <TableRow key={university.id}>
                  <TableCell className="font-medium">{university.id}</TableCell>
                  <TableCell>{university.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {university.telegramBotToken.substring(0, 20)}...
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {university.telegramChatId}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(university)}
                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(university.id)}
                        className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New University</DialogTitle>
            <DialogDescription>
              Create a new university with Telegram integration settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">University Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Harvard University"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="botToken">Telegram Bot Token *</Label>
              <Input
                id="botToken"
                placeholder="e.g., 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                value={formData.telegramBotToken}
                onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatId">Telegram Chat ID *</Label>
              <Input
                id="chatId"
                placeholder="e.g., -1001234567890"
                value={formData.telegramChatId}
                onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit University</DialogTitle>
            <DialogDescription>
              Update university information and Telegram settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">University Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-botToken">Telegram Bot Token *</Label>
              <Input
                id="edit-botToken"
                value={formData.telegramBotToken}
                onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-chatId">Telegram Chat ID *</Label>
              <Input
                id="edit-chatId"
                value={formData.telegramChatId}
                onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the university and all its associated specializations.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUniversityId(null)}>Cancel</AlertDialogCancel>
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
