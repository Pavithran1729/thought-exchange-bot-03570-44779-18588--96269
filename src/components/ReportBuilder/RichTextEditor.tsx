import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Code,
  Minus,
} from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const markdownToHtml = (markdown: string): string => {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  return html;
};

const htmlToMarkdown = (html: string): string => {
  let markdown = html;
  
  // Headers
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n');
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n');
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n');
  
  // Bold
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  
  // Italic
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
  
  // Code blocks
  markdown = markdown.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '```\n$1\n```\n\n');
  
  // Inline code
  markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');
  
  // Lists
  markdown = markdown.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
    return content.replace(/<li>(.*?)<\/li>/g, '* $1\n');
  });
  markdown = markdown.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, content) => {
    let counter = 1;
    return content.replace(/<li>(.*?)<\/li>/g, () => `${counter++}. $1\n`);
  });
  
  // Blockquotes
  markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n\n');
  
  // Paragraphs
  markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
  
  // Clean up extra newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  return markdown.trim();
};

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: markdownToHtml(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[500px] p-4',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== htmlToMarkdown(editor.getHTML())) {
      editor.commands.setContent(markdownToHtml(content));
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/30">
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('code') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="h-8 w-8 p-0"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="h-8 w-8 p-0"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="h-8 w-8 p-0"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
