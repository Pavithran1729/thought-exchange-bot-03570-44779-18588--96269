import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Bot, FileText, GraduationCap, BookOpen, Download, FolderOpen, LogOut, Sparkles } from "lucide-react";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <BackgroundEffects />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold hidden sm:block">Academic Report Generator</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hidden sm:flex">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    My Reports
                  </Button>
                  <Button size="sm" onClick={() => navigate("/generator")}>
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Create Report</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => signOut()} className="hidden sm:flex">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-32 text-center">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI-Powered Academic Writing</span>
            </div>
            
            <h1 className="text-responsive-hero font-bold leading-tight tracking-tight">
              Generate Professional{" "}
              <span className="text-gradient">Academic Reports</span>{" "}
              in Minutes
            </h1>
            
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your ideas into comprehensive, publication-ready academic reports. 
              Perfect for students, researchers, and professionals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
              {user ? (
                <>
                  <Button size="lg" onClick={() => navigate("/generator")} className="w-full sm:w-auto h-12 px-8 text-base">
                    Start Creating <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto h-12 px-8 text-base">
                    <FolderOpen className="mr-2 h-5 w-5" />
                    My Reports
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                    <Link to="/auth">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                    <a href="#features">
                      Learn More
                    </a>
                  </Button>
                </>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground pt-4">
              No credit card required • Export to PDF & DOCX • Multiple citation styles
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-responsive-title font-bold mb-4">
              Everything You Need for <span className="text-gradient">Academic Writing</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional tools designed specifically for academic and research documents
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <Card className="premium-card border-border/50 group">
              <CardContent className="pt-6 sm:pt-8 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">AI-Powered Generation</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Advanced AI creates comprehensive content with proper structure, citations, and academic tone.
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card border-border/50 group">
              <CardContent className="pt-6 sm:pt-8 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Citation Management</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  APA, IEEE, Harvard, MLA, and Chicago citation styles with BibTeX import support.
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card border-border/50 group">
              <CardContent className="pt-6 sm:pt-8 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Professional Export</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Export to PDF and DOCX with proper formatting, cover pages, and table of contents.
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card border-border/50 group">
              <CardContent className="pt-6 sm:pt-8 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Multiple Report Types</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Thesis chapters, research papers, lab reports, case studies, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card border-border/50 group">
              <CardContent className="pt-6 sm:pt-8 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Smart Data Extraction</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Automatically extracts and organizes data, dates, URLs, and key information.
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card border-border/50 group">
              <CardContent className="pt-6 sm:pt-8 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Academic Templates</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Pre-configured templates for IEEE, ACM, thesis formats, and custom styles.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-responsive-title font-bold text-center mb-12 sm:mb-16">
              Create Reports in <span className="text-gradient">3 Simple Steps</span>
            </h2>
            
            <div className="space-y-8 sm:space-y-12">
              {[
                {
                  step: 1,
                  title: "Enter Your Details",
                  description: "Provide your report title, academic details, and any reference documents. Save your profile for quick reuse."
                },
                {
                  step: 2,
                  title: "AI Generates Content",
                  description: "Our AI creates a comprehensive report with proper academic structure, citations, and professional formatting."
                },
                {
                  step: 3,
                  title: "Review & Export",
                  description: "Edit your report, add figures and tables, then export to PDF or DOCX ready for submission."
                }
              ].map((item) => (
                <div key={item.step} className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary">
                    {item.step}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold">{item.title}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8 premium-card p-8 sm:p-12 border-primary/20">
            <h2 className="text-responsive-title font-bold">
              Ready to Create Your First Report?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg">
              Join students and researchers worldwide using AI to streamline academic writing
            </p>
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link to={user ? "/generator" : "/auth"}>
                Start Generating Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center text-muted-foreground border-t border-border/50">
          <p className="text-sm">© 2025 Academic Report Generator. AI-Powered Academic Writing Assistant.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
