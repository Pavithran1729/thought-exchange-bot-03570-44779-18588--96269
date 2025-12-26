import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAcademicProfiles, type AcademicProfile } from "@/hooks/useAcademicProfiles";
import { Save, Trash2, Star, User } from "lucide-react";

interface AcademicProfileSelectorProps {
  onProfileLoad: (profile: {
    authorName: string;
    studentId: string;
    institution: string;
    department: string;
    course: string;
    supervisorName: string;
  }) => void;
  currentValues: {
    authorName: string;
    studentId: string;
    institution: string;
    department: string;
    course: string;
    supervisorName: string;
  };
}

export const AcademicProfileSelector = ({ 
  onProfileLoad, 
  currentValues 
}: AcademicProfileSelectorProps) => {
  const { profiles, loading, saveProfile, setAsDefault, deleteProfile } = useAcademicProfiles();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [setAsDefaultNew, setSetAsDefaultNew] = useState(false);

  const handleProfileSelect = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      onProfileLoad({
        authorName: profile.author_name || "",
        studentId: profile.student_id || "",
        institution: profile.institution || "",
        department: profile.department || "",
        course: profile.course || "",
        supervisorName: profile.supervisor_name || "",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!newProfileName.trim()) return;
    
    await saveProfile({
      name: newProfileName,
      author_name: currentValues.authorName,
      student_id: currentValues.studentId,
      institution: currentValues.institution,
      department: currentValues.department,
      course: currentValues.course,
      supervisor_name: currentValues.supervisorName,
      is_default: setAsDefaultNew,
    });
    
    setNewProfileName("");
    setSetAsDefaultNew(false);
    setIsSaveDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={handleProfileSelect}>
        <SelectTrigger className="h-8 text-xs bg-input border-border flex-1">
          <SelectValue placeholder="Load saved profile..." />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="p-2 text-xs text-muted-foreground">Loading...</div>
          ) : profiles.length === 0 ? (
            <div className="p-2 text-xs text-muted-foreground">No saved profiles</div>
          ) : (
            profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{profile.name}</span>
                  {profile.is_default && (
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2" title="Save current as profile">
            <Save className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Academic Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Profile Name</Label>
              <Input
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="e.g., My University Profile"
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="setDefault"
                checked={setAsDefaultNew}
                onCheckedChange={(checked) => setSetAsDefaultNew(checked as boolean)}
              />
              <Label htmlFor="setDefault" className="text-xs cursor-pointer">
                Set as default profile
              </Label>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
              <p className="font-medium">Will save:</p>
              <p>Author: {currentValues.authorName || "Not set"}</p>
              <p>Institution: {currentValues.institution || "Not set"}</p>
              <p>Department: {currentValues.department || "Not set"}</p>
            </div>
            <Button 
              onClick={handleSaveProfile} 
              className="w-full"
              disabled={!newProfileName.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
