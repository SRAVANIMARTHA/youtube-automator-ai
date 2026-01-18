import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Sparkles, Video, Clock, Globe, ArrowLeft, ArrowRight } from 'lucide-react';

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

const videoTypes = [
  { value: 'short', label: 'YouTube Shorts', description: 'Vertical videos under 60 seconds' },
  { value: 'long', label: 'Long Form', description: 'Standard YouTube videos 3-10+ minutes' },
];

export default function CreateAutomation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    videoType: 'short' as 'short' | 'long',
    duration: 60,
    publishTime: '12:00',
    timezone: 'UTC',
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsLoading(true);

    try {
      // Calculate next run time
      const now = new Date();
      const [hours, minutes] = formData.publishTime.split(':').map(Number);
      const nextRun = new Date(now);
      nextRun.setHours(hours, minutes, 0, 0);
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }

      const { error } = await supabase.from('automations').insert({
        user_id: user.id,
        name: formData.name,
        topic: formData.topic,
        video_type: formData.videoType,
        duration_seconds: formData.duration,
        publish_time: formData.publishTime,
        timezone: formData.timezone,
        next_run_at: nextRun.toISOString(),
        status: 'active',
      });

      if (error) throw error;

      toast.success('Automation created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating automation:', error);
      toast.error('Failed to create automation');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.name.trim() && formData.topic.trim();
    if (step === 2) return formData.videoType && formData.duration > 0;
    return true;
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Create Automation</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new automated video generation pipeline
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  s === step
                    ? 'gradient-primary text-primary-foreground'
                    : s < step
                    ? 'bg-success text-success-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-0.5 ml-2 ${
                    s < step ? 'bg-success' : 'bg-secondary'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Content Details
                </CardTitle>
                <CardDescription>
                  Define what your automation will create
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Automation Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Daily Tech Tips"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Niche</Label>
                  <Textarea
                    id="topic"
                    placeholder="e.g., Tech tutorials, productivity tips, and software reviews for developers"
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about your niche to generate better content
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Video Settings
                </CardTitle>
                <CardDescription>
                  Configure video type and duration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Video Type</Label>
                  <div className="grid gap-3">
                    {videoTypes.map((type) => (
                      <div
                        key={type.value}
                        onClick={() => handleInputChange('videoType', type.value)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.videoType === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Target Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={formData.videoType === 'short' ? 15 : 180}
                    max={formData.videoType === 'short' ? 60 : 1800}
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.videoType === 'short'
                      ? 'Shorts must be under 60 seconds'
                      : 'Long form videos are typically 3-30 minutes'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Schedule
                </CardTitle>
                <CardDescription>
                  Set when videos should be published
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="publishTime">Daily Publish Time</Label>
                  <Input
                    id="publishTime"
                    type="time"
                    value={formData.publishTime}
                    onChange={(e) => handleInputChange('publishTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => handleInputChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <Globe className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 rounded-xl bg-secondary/50 space-y-2">
                  <h4 className="font-semibold">Summary</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Topic:</strong> {formData.topic}</p>
                    <p><strong>Type:</strong> {formData.videoType === 'short' ? 'YouTube Shorts' : 'Long Form'}</p>
                    <p><strong>Duration:</strong> {formData.duration} seconds</p>
                    <p><strong>Schedule:</strong> Daily at {formData.publishTime} ({formData.timezone})</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {step < 3 ? (
            <Button
              variant="gradient"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Automation
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
