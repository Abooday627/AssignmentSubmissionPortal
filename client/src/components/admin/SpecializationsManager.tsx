import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

interface SpecializationForm {
  universityId: number | null;
  name: string;
}

export default function SpecializationsManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSpecializationId, setSelectedSpecializationId] = useState<number | null>(null);
  const [formData, setFormData] = useState<SpecializationForm>({
    universityId: null,
    name: '',
  });

  const utils = trpc.useUtils();
  const { data: universities = [] } = trpc.admin.universities.getAll.useQuery();
  const { data: specializations = [], isLoading } = trpc.admin.specializations.getAll.useQuery();

  const createMutation = trpc.admin.specializations.create.useMutation({
    onSuccess: () => {
      utils.admin.specializations.getAll.invalidate();
      utils.admin.getStatistics.invalidate();
      toast.success('Specialization created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create specialization: ' + error.message);
    },
  });

  const updateMutation = trpc.admin.specializations.update.useMutation({
    onSuccess: () => {
      utils.admin.specializations.getAll.invalidate();
      toast.success('Specialization updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update specialization: ' + error.message);
    },
  });

  const deleteMutation = trpc.admin.specializations.delete.useMutation({
    onSuccess: () => {
      utils.admin.specializations.getAll.invalidate();
      utils.admin.getStatistics.invalidate();
      toast.success('Specialization deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedSpecializationId(null);
    },
    onError: (error) => {
      toast.error('Failed to delete specialization: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      universityId: null,
      name: '',
    });
    setSelectedSpecializationId(null);
  };

  const handleCreate = () => {
    if (!formData.universityId || !formData.name.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    createMutation.mutate({
      universityId: formData.universityId,
      name: formData.name,
    });
  };

  const handleEdit = (specialization: any) => {
    setSelectedSpecializationId(specialization.id);
    setFormData({
      universityId: specialization.universityId,
      name: specialization.name,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedSpecializationId) return;
    if (!formData.universityId || !formData.name.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    updateMutation.mutate({
      id: selectedSpecializationId,
      universityId: formData.universityId,
      name: formData.name,
    });
  };

  const handleDeleteClick = (id: number) => {
    setSelectedSpecializationId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedSpecializationId) return;
    deleteMutation.mutate({ id: selectedSpecializationId });
  };

  const getUniversityName = (universityId: number) => {
    const university = universities.find(u => u.id === universityId);
    return university?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Specializations Management</h3>
          <p className="text-sm text-gray-600">Add, edit, or remove specializations for universities</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Specialization
        </Button>
      </div>

      {universities.length === 0 ? (
        <div className="text-center py-12 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300">
          <p className="text-yellow-800 mb-2 font-medium">⚠️ No Universities Found</p>
          <p className="text-yellow-700 text-sm">Please add universities first before creating specializations</p>
        </div>
      ) : specializations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No specializations found</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Specialization
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Specialization Name</TableHead>
                <TableHead className="font-semibold">University</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specializations.map((specialization) => (
                <TableRow key={specialization.id}>
                  <TableCell className="font-medium">{specialization.id}</TableCell>
                  <TableCell>{specialization.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {getUniversityName(specialization.universityId)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(specialization)}
                        className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(specialization.id)}
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
            <DialogTitle>Add New Specialization</DialogTitle>
            <DialogDescription>
              Create a new specialization for a university
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="university">University *</Label>
              <Select
                value={formData.universityId?.toString() || ''}
                onValueChange={(val) => setFormData({ ...formData, universityId: parseInt(val) })}
              >
                <SelectTrigger id="university">
                  <SelectValue placeholder="Select a university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id.toString()}>
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Specialization Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Computer Science"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <DialogTitle>Edit Specialization</DialogTitle>
            <DialogDescription>
              Update specialization information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-university">University *</Label>
              <Select
                value={formData.universityId?.toString() || ''}
                onValueChange={(val) => setFormData({ ...formData, universityId: parseInt(val) })}
              >
                <SelectTrigger id="edit-university">
                  <SelectValue placeholder="Select a university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id.toString()}>
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Specialization Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              This will permanently delete the specialization. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSpecializationId(null)}>Cancel</AlertDialogCancel>
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
