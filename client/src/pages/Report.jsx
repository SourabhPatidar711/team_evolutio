import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Upload, 
  Camera, 
  MapPin, 
  FileText, 
  AlertTriangle,
  Info,
  CheckCircle,
  RefreshCw,
  ImageIcon,
  Trash2,
  RotateCw,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analyzeReportImage } from '@/lib/aiUtils';

export default function Report() {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    reportType: 'debris',
    disasterId: 'none'
  });
  
  // Fetch active disasters for assignment
  const { data: activeDisasters = [], isLoading: disastersLoading } = useQuery({
    queryKey: ['/api/disasters/active'],
  });
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset analysis when a new image is uploaded
    setImageAnalysis(null);
    
    // Create file preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setImage(file);
    };
    reader.readAsDataURL(file);
  };
  
  // Remove the uploaded image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Analyze the image with AI
  const handleAnalyzeImage = async () => {
    if (!imagePreview) return;
    
    setAnalyzing(true);
    
    try {
      // Strip data URI prefix (e.g., "data:image/jpeg;base64,")
      const base64Image = imagePreview.split(',')[1];
      const analysis = await analyzeReportImage(base64Image);
      
      setImageAnalysis(analysis);
      
      // Auto-fill form fields with analysis results
      if (analysis) {
        setFormData(prev => ({
          ...prev,
          title: analysis.title || prev.title,
          description: analysis.description || prev.description,
          location: analysis.location || prev.location,
          reportType: analysis.disasterType || prev.reportType
        }));
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    
    // Prepare form data with image if available
    const submitData = {
      ...formData,
      image: imagePreview ? imagePreview.split(',')[1] : null
    };
    
    try {
      // Submit report
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit report');
      }
      
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        location: '',
        latitude: '',
        longitude: '',
        reportType: 'debris',
        disasterId: 'none'
      });
      setImage(null);
      setImagePreview(null);
      setImageAnalysis(null);
      
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Report type options
  const reportTypes = [
    { value: 'debris', label: 'Debris/Blockage' },
    { value: 'damage', label: 'Structural Damage' },
    { value: 'fire', label: 'Fire' },
    { value: 'flood', label: 'Flooding' },
    { value: 'people', label: 'People in Need' },
    { value: 'utility', label: 'Utility Damage' },
    { value: 'other', label: 'Other' }
  ];
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Submit Disaster Report</h1>
        <p className="text-gray-500 mt-2">
          Report incidents, damage, or people in need of assistance
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload & Analysis Card */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Image Upload & AI Analysis</CardTitle>
            <CardDescription>
              Upload an image of the incident to automatically analyze and extract details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Preview Area */}
            <div 
              className={`
                border-2 border-dashed rounded-lg p-4 text-center
                ${imagePreview ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}
                transition-all duration-200
              `}
            >
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative aspect-video overflow-hidden rounded-md">
                    <img 
                      src={imagePreview} 
                      alt="Report preview" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <RotateCw className="h-4 w-4 mr-1" /> Change
                    </Button>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="py-8 flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    Drag and drop an image, or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports: JPG, PNG, WEBP (Max 5MB)
                  </p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            
            {/* AI Analysis Controls */}
            <div className="flex justify-center">
              <Button 
                type="button"
                onClick={handleAnalyzeImage}
                disabled={!imagePreview || analyzing}
                className="w-full md:w-auto"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" /> 
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>
            
            {/* AI Analysis Results */}
            {imageAnalysis && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md text-blue-700">AI Analysis Results</CardTitle>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                      {(imageAnalysis.confidence * 100).toFixed(0)}% Confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Detected Incident:</p>
                    <p className="text-sm text-blue-600">{imageAnalysis.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Description:</p>
                    <p className="text-sm text-blue-600">{imageAnalysis.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Type:</p>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                        {imageAnalysis.disasterType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Severity:</p>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${imageAnalysis.severity === 'high' ? 'bg-red-100 text-red-800 border-red-300' : 
                            imageAnalysis.severity === 'moderate' ? 'bg-orange-100 text-orange-800 border-orange-300' : 
                            'bg-yellow-100 text-yellow-800 border-yellow-300'}
                        `}
                      >
                        {imageAnalysis.severity}
                      </Badge>
                    </div>
                  </div>
                  
                  {imageAnalysis.location && (
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Detected Location:</p>
                      <p className="text-sm text-blue-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> {imageAnalysis.location}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-blue-500 italic mt-2">
                    * AI analysis results have been used to pre-fill the report form
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
        
        {/* Report Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>
              Provide information about what you're reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Brief description of what you're reporting"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select 
                  value={formData.reportType} 
                  onValueChange={(value) => handleSelectChange('reportType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type of report" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Provide details about the situation, what happened, current conditions, etc."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  placeholder="Address or landmark description"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (optional)</Label>
                  <Input 
                    id="latitude" 
                    name="latitude" 
                    placeholder="e.g. 34.0522"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    type="number"
                    step="any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (optional)</Label>
                  <Input 
                    id="longitude" 
                    name="longitude" 
                    placeholder="e.g. -118.2437"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    type="number"
                    step="any"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="disasterId">Related Disaster (optional)</Label>
                <Select 
                  value={formData.disasterId} 
                  onValueChange={(value) => handleSelectChange('disasterId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select related disaster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None/Not Sure</SelectItem>
                    {activeDisasters.map(disaster => (
                      <SelectItem key={disaster.id} value={disaster.id.toString()}>
                        {disaster.name} - {disaster.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" /> 
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Report Guidelines Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Reporting Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-full h-min">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Accurate Information</h4>
                  <p className="text-sm text-gray-600">
                    Provide accurate and detailed information about the situation. This helps responders prioritize and prepare.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-amber-100 text-amber-700 p-2 rounded-full h-min">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Photo Evidence</h4>
                  <p className="text-sm text-gray-600">
                    Images help verify reports and assess the situation. Include clear photos when possible, but stay safe.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-green-100 text-green-700 p-2 rounded-full h-min">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Precise Location</h4>
                  <p className="text-sm text-gray-600">
                    Be as specific as possible about the location. Use addresses, landmarks, or coordinates if available.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-red-100 text-red-700 p-2 rounded-full h-min">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Emergency Situations</h4>
                  <p className="text-sm text-gray-600">
                    For immediate life-threatening emergencies, call emergency services first before submitting a report.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="w-full">
              View Tips for Better Reports
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}