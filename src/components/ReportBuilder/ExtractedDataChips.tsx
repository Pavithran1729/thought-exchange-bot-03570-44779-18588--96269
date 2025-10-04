import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, DollarSign, Link as LinkIcon, Clock, Percent, Hash, Globe } from "lucide-react";
import type { ExtractedData } from "@/utils/regexProcessor";

interface ExtractedDataChipsProps {
  data: ExtractedData[];
}

const iconMap: Record<string, any> = {
  Email: Mail,
  Phone: Phone,
  Date: Calendar,
  Currency: DollarSign,
  URL: LinkIcon,
  Time: Clock,
  Percentage: Percent,
  Hashtag: Hash,
  "IP Address": Globe,
};

export const ExtractedDataChips = ({ data }: ExtractedDataChipsProps) => {
  if (data.length === 0) return null;

  // Group by type
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, ExtractedData[]>);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Hash className="h-5 w-5 text-primary" />
        Extracted Data
      </h3>
      
      <div className="space-y-4">
        {Object.entries(groupedData).map(([type, items]) => {
          const Icon = iconMap[type] || Hash;
          return (
            <div key={type} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {type} ({items.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-default"
                  >
                    {item.value}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 mt-4">
        💡 <strong>Smart Extraction:</strong> This data was automatically identified and extracted from your content using advanced regex patterns.
      </div>
    </div>
  );
};
