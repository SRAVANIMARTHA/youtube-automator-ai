import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  Clock,
  Video,
  Calendar,
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Automation {
  id: string;
  name: string;
  topic: string;
  video_type: 'short' | 'long';
  duration_seconds: number;
  publish_time: string;
  timezone: string;
  status: 'active' | 'paused' | 'failed';
  next_run_at: string | null;
  last_run_at: string | null;
  videos_generated: number;
  created_at: string;
}

interface Log {
  id: string;
  step: string;
  status: 'started' | 'completed' | 'failed';
  message: string | null;
  created_at: string;
}

interface VideoRecord {
  id: string;
  title: string | null;
  generation_status: 'pending' | 'generating' | 'completed' | 'failed';
  upload_status: 'pending' | 'uploading' | 'uploaded' | 'scheduled' | 'published' | 'failed';
  youtube_video_id: string | null;
  error_message: string | null;
  created_at: string;
}

const statusConfig = {
  active: { color: 'bg-success', label: 'Active' },
  paused: { color: 'bg-warning', label: 'Paused' },
  failed: { color: 'bg-destructive', label: 'Failed' },
};

const logStatusIcons = {
  started: Clock,
  completed: CheckCircle2,
  failed: XCircle,
};

export default function AutomationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAutomationData();
    }
  }, [id]);

  const fetchAutomationData = async () => {
    try {
      // Fetch automation
      const { data: automationData, error: automationError } = await supabase
        .from('automations')
        .select('*')
        .eq('id', id)
        .single();

      if (automationError) throw automationError;
      setAutomation(automationData as Automation);

      // Fetch logs
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .eq('automation_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (logsError) throw logsError;
      setLogs((logsData || []) as Log[]);

      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('automation_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (videosError) throw videosError;
      setVideos((videosData || []) as VideoRecord[]);
    } catch (error) {
      console.error('Error fetching automation:', error);
      toast.error('Failed to load automation details');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!automation) return;
    
    const newStatus = automation.status === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('automations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setAutomation({ ...automation, status: newStatus as 'active' | 'paused' });
      toast.success(`Automation ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch (error) {
      toast.error('Failed to update automation');
    }
  };

  const deleteAutomation = async () => {
    try {
      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Automation deleted');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete automation');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!automation) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Automation not found</h2>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = statusConfig[automation.status];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">{automation.name}</h1>
            <p className="text-muted-foreground mt-1">{automation.topic}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={toggleStatus}
              disabled={automation.status === 'failed'}
            >
              {automation.status === 'active' ? (
                <><Pause className="h-4 w-4 mr-2" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Activate</>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Automation</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this automation and all associated videos and logs.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAutomation} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Videos Generated</p>
                  <p className="text-2xl font-bold">{automation.videos_generated}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}>
                  {automation.status === 'active' ? (
                    <Play className="h-5 w-5 text-success-foreground" />
                  ) : automation.status === 'paused' ? (
                    <Pause className="h-5 w-5 text-warning-foreground" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold">{status.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Publish Time</p>
                  <p className="text-lg font-semibold">{automation.publish_time}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="text-lg font-semibold">{automation.timezone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Video Type</p>
                <Badge variant="outline" className="mt-1 uppercase">
                  {automation.video_type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{automation.duration_seconds} seconds</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Run</p>
                <p className="font-medium">
                  {automation.next_run_at
                    ? formatDistanceToNow(new Date(automation.next_run_at), { addSuffix: true })
                    : 'Not scheduled'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Run</p>
                <p className="font-medium">
                  {automation.last_run_at
                    ? format(new Date(automation.last_run_at), 'PPp')
                    : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Videos */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
            <CardDescription>Latest generated videos for this automation</CardDescription>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No videos generated yet</p>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                        <Video className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{video.title || 'Untitled'}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(video.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{video.generation_status}</Badge>
                      <Badge variant="outline">{video.upload_status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>Recent activity for this automation</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const StatusIcon = logStatusIcons[log.status];
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                    >
                      <StatusIcon
                        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          log.status === 'completed'
                            ? 'text-success'
                            : log.status === 'failed'
                            ? 'text-destructive'
                            : 'text-warning'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{log.step}</p>
                        {log.message && (
                          <p className="text-sm text-muted-foreground">{log.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(log.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
