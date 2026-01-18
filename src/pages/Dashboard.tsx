import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Plus,
  Play,
  Pause,
  AlertCircle,
  Clock,
  Video,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Automation {
  id: string;
  name: string;
  topic: string;
  video_type: 'short' | 'long';
  status: 'active' | 'paused' | 'failed';
  next_run_at: string | null;
  videos_generated: number;
  created_at: string;
}

const statusConfig = {
  active: { color: 'bg-success', label: 'Active', icon: Play },
  paused: { color: 'bg-warning', label: 'Paused', icon: Pause },
  failed: { color: 'bg-destructive', label: 'Failed', icon: AlertCircle },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAutomations: 0,
    activeAutomations: 0,
    totalVideos: 0,
    scheduledToday: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAutomations();
    }
  }, [user]);

  const fetchAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []) as Automation[];
      setAutomations(typedData);
      
      // Calculate stats
      const activeCount = typedData.filter(a => a.status === 'active').length;
      const totalVideos = typedData.reduce((sum, a) => sum + a.videos_generated, 0);
      const today = new Date().toDateString();
      const scheduledToday = typedData.filter(a => 
        a.next_run_at && new Date(a.next_run_at).toDateString() === today
      ).length;

      setStats({
        totalAutomations: typedData.length,
        activeAutomations: activeCount,
        totalVideos,
        scheduledToday,
      });
    } catch (error) {
      console.error('Error fetching automations:', error);
      toast.error('Failed to load automations');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutomationStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('automations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setAutomations(prev => 
        prev.map(a => a.id === id ? { ...a, status: newStatus as 'active' | 'paused' } : a)
      );
      
      toast.success(`Automation ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch (error) {
      toast.error('Failed to update automation');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your YouTube automations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Automations', value: stats.totalAutomations, icon: Calendar, color: 'text-primary' },
            { label: 'Active', value: stats.activeAutomations, icon: Play, color: 'text-success' },
            { label: 'Videos Generated', value: stats.totalVideos, icon: Video, color: 'text-accent' },
            { label: 'Scheduled Today', value: stats.scheduledToday, icon: Clock, color: 'text-warning' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Automations List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Automations</h2>
            <Button variant="gradient" asChild>
              <Link to="/dashboard/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : automations.length === 0 ? (
            <Card className="glass">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Create your first automation to start generating YouTube videos automatically.
                </p>
                <Button variant="gradient" asChild>
                  <Link to="/dashboard/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Automation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {automations.map((automation, index) => {
                const status = statusConfig[automation.status];
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={automation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass hover:bg-card/80 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                              <Video className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{automation.name}</h3>
                              <p className="text-sm text-muted-foreground">{automation.topic}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 flex-wrap">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{automation.videos_generated}</p>
                              <p className="text-xs text-muted-foreground">Videos</p>
                            </div>

                            <div className="text-center">
                              <Badge variant="outline" className="uppercase text-xs">
                                {automation.video_type}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${status.color}`} />
                              <span className="text-sm">{status.label}</span>
                            </div>

                            {automation.next_run_at && (
                              <div className="text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 inline mr-1" />
                                {formatDistanceToNow(new Date(automation.next_run_at), { addSuffix: true })}
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleAutomationStatus(automation.id, automation.status)}
                                disabled={automation.status === 'failed'}
                              >
                                {automation.status === 'active' ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/dashboard/automation/${automation.id}`}>
                                  Details
                                  <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
