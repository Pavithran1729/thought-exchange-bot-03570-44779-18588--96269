import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, FileText, Sparkles, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export type GenerationStage = 'idle' | 'preparing' | 'generating' | 'processing' | 'complete';

interface GenerationProgressProps {
  stage: GenerationStage;
  onCancel?: () => void;
}

const stages = [
  { id: 'preparing', label: 'Preparing request', icon: Settings },
  { id: 'generating', label: 'Generating content', icon: Sparkles },
  { id: 'processing', label: 'Processing results', icon: FileText },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

const getStageIndex = (stage: GenerationStage): number => {
  const index = stages.findIndex(s => s.id === stage);
  return index >= 0 ? index : 0;
};

const getProgressValue = (stage: GenerationStage): number => {
  switch (stage) {
    case 'preparing': return 15;
    case 'generating': return 50;
    case 'processing': return 85;
    case 'complete': return 100;
    default: return 0;
  }
};

const getEstimatedTime = (stage: GenerationStage): string => {
  switch (stage) {
    case 'preparing': return '~45 seconds remaining';
    case 'generating': return '~30 seconds remaining';
    case 'processing': return '~10 seconds remaining';
    case 'complete': return 'Done!';
    default: return '';
  }
};

export function GenerationProgress({ stage, onCancel }: GenerationProgressProps) {
  if (stage === 'idle') return null;

  const currentStageIndex = getStageIndex(stage);
  const progressValue = getProgressValue(stage);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border rounded-xl p-8 shadow-2xl max-w-md w-full mx-4"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-6 w-6 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground">
              Generating Report...
            </h3>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progressValue} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {getEstimatedTime(stage)}
            </p>
          </div>

          {/* Stages List */}
          <div className="space-y-3 mb-6">
            {stages.map((stageItem, index) => {
              const Icon = stageItem.icon;
              const isActive = stageItem.id === stage;
              const isComplete = index < currentStageIndex;
              const isPending = index > currentStageIndex;

              return (
                <motion.div
                  key={stageItem.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                    isComplete 
                      ? 'bg-primary text-primary-foreground' 
                      : isActive 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isActive ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Icon className="h-3 w-3" />
                      </motion.div>
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    isComplete 
                      ? 'text-foreground' 
                      : isActive 
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground'
                  }`}>
                    {stageItem.label}
                  </span>
                  {isActive && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-auto"
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Cancel Button */}
          {stage !== 'complete' && onCancel && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onCancel}
            >
              Cancel Generation
            </Button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
