import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Bot, FileText, Mail, Phone, Calendar, DollarSign, FolderOpen, LogOut } from "lucide-react";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />
      
      <div className="relative z-10">
        {/* Header */}
        {user && (
          <header className="border-b border-border/50 glass-morphism">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold">AI Report Generator</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  My Reports
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/generator")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>
        )}

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-block px-4 py-2 rounded-full glass-morphism border border-primary/20 mb-4">
              <span className="text-sm text-primary">✨ Powered by AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Transform Ideas into{" "}
              <span className="text-gradient">Professional Reports</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Generate comprehensive, beautifully formatted reports in seconds. 
              Just provide a title—our AI handles the rest.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {user ? (
                <>
                  <Button size="lg" onClick={() => navigate("/generator")} className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                    Start Creating <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-8 py-6">
                    <FolderOpen className="mr-2 h-5 w-5" />
                    My Reports
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                    <Link to="/auth">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                    <a href="#how-it-works">
                      See How It Works
                    </a>
                  </Button>
                </>
              )}
            </div>
            
            <div className="pt-8 text-sm text-muted-foreground">
              <p>No credit card required • Generate unlimited reports • Export to PDF, DOCX, PPTX</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="glass-morphism border-primary/20 hover:shadow-[0_0_30px_rgba(35,209,219,0.3)] transition-all duration-300">
              <CardContent className="pt-8 space-y-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Generate professional reports in under 30 seconds. No manual formatting required.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-primary/20 hover:shadow-[0_0_30px_rgba(35,209,219,0.3)] transition-all duration-300">
              <CardContent className="pt-8 space-y-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Advanced GPT models generate comprehensive content and stunning images automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-primary/20 hover:shadow-[0_0_30px_rgba(35,209,219,0.3)] transition-all duration-300">
              <CardContent className="pt-8 space-y-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Smart Processing</h3>
                <p className="text-muted-foreground">
                  Automatically extracts emails, phones, dates, URLs, and more from your content.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              How It <span className="text-gradient">Works</span>
            </h2>
            
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  1
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold">Enter Your Title</h3>
                  <p className="text-muted-foreground text-lg">
                    Simply provide a report title. Optionally add content or let AI create everything for you.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  2
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold">AI Generates Content</h3>
                  <p className="text-muted-foreground text-lg">
                    Watch in real-time as our AI creates a structured, professional report with sections, findings, and insights.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  3
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold">Export & Share</h3>
                  <p className="text-muted-foreground text-lg">
                    One-click export to PDF, DOCX, or PPTX. Your report is ready to share with stakeholders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Extraction Showcase */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
              Auto-Extract <span className="text-gradient">Everything</span>
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-12">
              Our smart regex processor automatically identifies and extracts key data patterns
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Mail, label: "Emails" },
                { icon: Phone, label: "Phone Numbers" },
                { icon: Calendar, label: "Dates & Times" },
                { icon: DollarSign, label: "Currency" },
              ].map((item) => (
                <div key={item.label} className="glass-morphism p-6 rounded-xl border border-primary/20 text-center space-y-3 hover:border-primary/40 transition-colors">
                  <item.icon className="h-8 w-8 text-primary mx-auto" />
                  <p className="font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8 glass-morphism border border-primary/20 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Create Your First Report?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of professionals using AI to streamline their workflow
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
              <Link to="/auth">
                Start Generating Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 text-center text-muted-foreground border-t border-border/50">
          <p>© 2025 AI Report Generator. Powered by GPT & Advanced Regex Processing.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
