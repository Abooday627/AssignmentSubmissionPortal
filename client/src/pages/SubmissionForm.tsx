import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Storage helper function - uploads files to S3 via backend API
const storagePut = async (key: string, data: ArrayBuffer, contentType: string) => {
  // This will be implemented via API call to the backend
  // For now, we'll use a placeholder
  console.log(`Placeholder: Uploading file ${key} with type ${contentType}`);
  return { url: 'https://example.com/file-' + key.split('/').pop() };
};

interface UploadedFile {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  localFile?: File;
}

export default function SubmissionForm() {
  const [studentName, setStudentName] = useState('');
  const [universityId, setUniversityId] = useState<number | null>(null);
  const [specializationId, setSpecializationId] = useState<number | null>(null);
  const [groupNumber, setGroupNumber] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch universities
  // تم تغيير المسار إلى المسار العام حيث أن هذا النموذج مخصص لغير الإدارة
  const { data: universities = [], isLoading: universitiesLoading } = trpc.submission.getUniversities.useQuery(); 

  // Fetch specializations when university is selected
  // تم استخدام الاستعلام الذي يحضر التخصصات بناءً على الجامعة المختارة 
  const { data: specializations = [], isLoading: specializationsLoading } = trpc.submission.getSpecializations.useQuery({ 
      universityId: universityId || 0, // تمرير 0 إذا لم يتم اختيار جامعة
    }, 
    {
      enabled: universityId !== null && universityId > 0, // تفعيل الاستعلام فقط عند اختيار جامعة
    }
  );

  // التخصصات المتاحة هي التخصصات التي تم جلبها بناءً على المعرف (universityId)
  const availableSpecializations = specializations;

  // Submit mutation
  const submitMutation = trpc.submission.submit.useMutation();

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      try {
        // Upload to S3 (Placeholder implementation)
        const fileKey = `submissions/${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
        const { url } = await storagePut(fileKey, await file.arrayBuffer(), file.type);

        newFiles.push({
          fileName: file.name,
          fileUrl: url,
          fileSize: file.size,
          mimeType: file.type,
          localFile: file,
        });
      } catch (error) {
        console.error('File upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!studentName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!universityId) {
      toast.error('Please select a university');
      return;
    }

    if (!specializationId) {
      toast.error('Please select a specialization');
      return;
    }

    if (!groupNumber.trim()) {
      toast.error('Please enter your group number');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitMutation.mutateAsync({
        studentName: studentName.trim(),
        universityId,
        specializationId,
        groupNumber: groupNumber.trim(),
        files: uploadedFiles.map(f => ({
            fileName: f.fileName,
            fileUrl: f.fileUrl,
            fileSize: f.fileSize,
            mimeType: f.mimeType,
        })),
      });

      if (result.success) {
        setSubmitSuccess(true);
        toast.success('Assignment submitted successfully! Your files have been sent to the university.');
        
        // Reset form
        setTimeout(() => {
          setStudentName('');
          setUniversityId(null);
          setSpecializationId(null);
          setGroupNumber('');
          setUploadedFiles([]);
          setSubmitSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-emerald-200 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Successful!</h2>
            <p className="text-gray-600 mb-4">Your assignment has been submitted and forwarded to your university.</p>
            <p className="text-sm text-gray-500">Redirecting to form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Assignment Submission Portal
          </h1>
          <p className="text-gray-600">Submit your assignments easily and securely</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle>Submit Your Assignment</CardTitle>
            <CardDescription>Fill in your information and upload your files</CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Student Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* University Selection */}
              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm font-semibold text-gray-700">
                  University *
                </Label>
                <Select value={universityId?.toString() || ''} onValueChange={(val) => {
                  setUniversityId(parseInt(val));
                  setSpecializationId(null);
                }}>
                  <SelectTrigger id="university" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder={universitiesLoading ? 'Loading universities...' : 'Select your university'} />
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

              {/* Specialization Selection */}
              {universityId && (
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-sm font-semibold text-gray-700">
                    Specialization *
                  </Label>
                  <Select 
                    value={specializationId?.toString() || ''} 
                    onValueChange={(val) => setSpecializationId(parseInt(val))}
                    disabled={specializationsLoading || availableSpecializations.length === 0}
                  >
                    <SelectTrigger id="specialization" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder={specializationsLoading ? 'Loading specializations...' : 'Select your specialization'} />
                    </SelectTrigger>
                  <SelectContent>
                    {availableSpecializations.map((spec) => (
                        <SelectItem key={spec.id} value={spec.id.toString()}>
                          {spec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Group Number */}
              <div className="space-y-2">
                <Label htmlFor="group" className="text-sm font-semibold text-gray-700">
                  Group Number *
                </Label>
                <Input
                  id="group"
                  type="text"
                  placeholder="Enter your group number"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* File Upload Area */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Upload Files *
                </Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Drag and drop your files here or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supports all file formats (PDF, DOC, DOCX, images, etc.)
                  </p>
                  
                  {/* الكود المصحح لضمان عمل النقر */}
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      handleFileSelect(e.target.files);
                      e.target.value = ''; // مسح القيمة لتمكين تحميل نفس الملف مرة أخرى
                    }}
                    className="sr-only" 
                    id="file-input"
                  />
                  
                  <label htmlFor="file-input" className="cursor-pointer inline-flex">
                    {/* استخدام pointer-events-none لضمان أن النقر يتم معالجته بواسطة الـ LABEL */}
                    <Button type="button" variant="outline" className="pointer-events-none">
                      Choose Files 
                    </Button>
                  </label>
                  
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Uploaded Files ({uploadedFiles.length})
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {(file.fileSize / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !studentName || !universityId || !specializationId || !groupNumber || uploadedFiles.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Assignment'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Your assignment will be securely submitted to your university's system.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}