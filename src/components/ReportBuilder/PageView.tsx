import { useState, useRef, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageViewProps {
  title: string;
  content: string;
  className?: string;
}

// A4 dimensions in pixels at 96 DPI (210mm × 297mm)
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 3.78; // 96 DPI
const A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX;
const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX;
const MARGIN_PX = 25 * MM_TO_PX; // 25mm margins

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

export const PageView = ({ title, content, className }: PageViewProps) => {
  const [zoom, setZoom] = useState(75);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate pages from content
  const contentHeight = A4_HEIGHT_PX - 2 * MARGIN_PX - 60; // Account for header/footer

  // Parse content into pages
  const pages = useMemo(() => {
    if (!content) return [{ title, content: "" }];
    
    // Split content by major sections for page estimation
    const sections = content.split(/(?=^#{1,2}\s)/m);
    const pages: { pageNumber: number; content: string }[] = [];
    let currentPageContent = "";
    let pageNumber = 1;
    
    // Rough estimation: ~3000 chars per page
    const charsPerPage = 2500;
    
    sections.forEach((section) => {
      if ((currentPageContent + section).length > charsPerPage && currentPageContent) {
        pages.push({ pageNumber, content: currentPageContent });
        pageNumber++;
        currentPageContent = section;
      } else {
        currentPageContent += section;
      }
    });
    
    if (currentPageContent) {
      pages.push({ pageNumber, content: currentPageContent });
    }
    
    return pages.length > 0 ? pages : [{ pageNumber: 1, content: content }];
  }, [content, title]);

  useEffect(() => {
    setTotalPages(pages.length);
  }, [pages]);

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const scale = zoom / 100;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border rounded-t-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom === ZOOM_LEVELS[0]}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[4rem] text-center">
            {zoom}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[6rem] text-center">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page container with scroll */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/30 p-6"
      >
        <div className="flex flex-col items-center gap-6">
          {pages.map((page, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
              style={{
                width: A4_WIDTH_PX * scale,
                height: A4_HEIGHT_PX * scale,
              }}
            >
              {/* Page shadow */}
              <div
                className="absolute inset-0 bg-black/20 rounded-sm"
                style={{ transform: "translate(4px, 4px)" }}
              />
              
              {/* Page */}
              <div
                className="absolute inset-0 bg-white rounded-sm shadow-lg overflow-hidden"
                style={{
                  padding: `${MARGIN_PX * scale}px`,
                }}
              >
                {/* Header */}
                <div
                  className="absolute top-0 left-0 right-0 flex justify-end items-center text-xs text-gray-500 italic"
                  style={{
                    padding: `${12 * scale}px ${MARGIN_PX * scale}px`,
                  }}
                >
                  {title && title.length > 50 ? title.substring(0, 47) + "..." : title}
                </div>

                {/* Content area */}
                <div
                  ref={index === 0 ? contentRef : undefined}
                  className="h-full overflow-hidden prose prose-sm max-w-none"
                  style={{
                    paddingTop: `${20 * scale}px`,
                    paddingBottom: `${30 * scale}px`,
                    fontSize: `${11 * scale}px`,
                    lineHeight: 1.6,
                  }}
                >
                  {/* Title only on first page */}
                  {index === 0 && title && (
                    <h1
                      className="font-bold text-black mb-4 text-center"
                      style={{
                        fontSize: `${18 * scale}px`,
                        marginBottom: `${16 * scale}px`,
                      }}
                    >
                      {title}
                    </h1>
                  )}
                  
                  <ReactMarkdown
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      h1: ({ ...props }) => (
                        <h1
                          className="font-bold text-black border-b border-gray-300 pb-1 mt-4 mb-2"
                          style={{ fontSize: `${14 * scale}px` }}
                          {...props}
                        />
                      ),
                      h2: ({ ...props }) => (
                        <h2
                          className="font-bold text-black mt-3 mb-2"
                          style={{ fontSize: `${12 * scale}px` }}
                          {...props}
                        />
                      ),
                      h3: ({ ...props }) => (
                        <h3
                          className="font-semibold text-black mt-2 mb-1"
                          style={{ fontSize: `${11 * scale}px` }}
                          {...props}
                        />
                      ),
                      p: ({ ...props }) => (
                        <p
                          className="text-black mb-2 text-justify"
                          style={{
                            fontSize: `${11 * scale}px`,
                            textIndent: `${20 * scale}px`,
                          }}
                          {...props}
                        />
                      ),
                      strong: ({ ...props }) => (
                        <strong className="font-bold" {...props} />
                      ),
                      em: ({ ...props }) => (
                        <em className="italic" {...props} />
                      ),
                      ul: ({ ...props }) => (
                        <ul
                          className="list-disc ml-4 my-2 text-black"
                          style={{ fontSize: `${11 * scale}px` }}
                          {...props}
                        />
                      ),
                      ol: ({ ...props }) => (
                        <ol
                          className="list-decimal ml-4 my-2 text-black"
                          style={{ fontSize: `${11 * scale}px` }}
                          {...props}
                        />
                      ),
                      table: ({ ...props }) => (
                        <div className="overflow-x-auto my-2">
                          <table
                            className="min-w-full border-collapse border border-gray-400"
                            style={{ fontSize: `${10 * scale}px` }}
                            {...props}
                          />
                        </div>
                      ),
                      th: ({ ...props }) => (
                        <th
                          className="border border-gray-400 px-2 py-1 bg-gray-100 font-bold text-left"
                          {...props}
                        />
                      ),
                      td: ({ ...props }) => (
                        <td
                          className="border border-gray-400 px-2 py-1"
                          {...props}
                        />
                      ),
                      code: ({ inline, ...props }: any) =>
                        inline ? (
                          <code
                            className="bg-gray-100 px-1 rounded font-mono"
                            style={{ fontSize: `${10 * scale}px` }}
                            {...props}
                          />
                        ) : (
                          <code
                            className="block bg-gray-100 p-2 rounded font-mono overflow-x-auto my-2"
                            style={{ fontSize: `${9 * scale}px` }}
                            {...props}
                          />
                        ),
                    }}
                  >
                    {page.content}
                  </ReactMarkdown>
                </div>

                {/* Footer with page number */}
                <div
                  className="absolute bottom-0 left-0 right-0 flex justify-center items-center text-xs text-gray-600"
                  style={{
                    padding: `${12 * scale}px`,
                  }}
                >
                  {page.pageNumber}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
