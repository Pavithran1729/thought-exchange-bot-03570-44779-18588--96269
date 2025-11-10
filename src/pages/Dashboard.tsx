import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";
import { ArrowLeft, FileText, Trash2, Eye, Download, Plus, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { getReports, deleteReport, loading } = useReports();
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const data = await getReports();
    if (data) {
      setReports(data);
    }
  };

  const handleDelete = async (id: string) => {
    setReportToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (reportToDelete) {
      const success = await deleteReport(reportToDelete);
      if (success) {
        setReports(reports.filter(r => r.id !== reportToDelete));
        toast({
          title: "Report deleted",
          description: "The report has been removed successfully.",
        });
      }
    }
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />
      
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-border/50 glass-morphism">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">My Reports</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => navigate("/generator")}>
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center pb-4">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <CardTitle>No Reports Yet</CardTitle>
                <CardDescription>
                  Create your first report to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <Button onClick={() => navigate("/generator")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 mt-2">{report.title}</CardTitle>
                    <CardDescription>
                      Created {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {report.content.substring(0, 150)}...
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate("/generator", { state: { report } })}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
