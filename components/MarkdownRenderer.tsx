
import React from 'react';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
    if (!content) return null;

    // Simple parser for Bold (**text**) and Italic (_text_) and Lists (- item)
    // Note: This is a basic implementation. For production with complex markdown, use a library.

    const parseLine = (line: string, index: number) => {
        // Check for list item
        if (line.trim().startsWith('- ')) {
            const content = line.trim().substring(2);
            return (
                <li key={index} className="list-disc ml-4 mb-1">
                    {parseInline(content)}
                </li>
            );
        }

        // Regular paragraph
        return (
            <p key={index} className="mb-1 last:mb-0 min-h-[1.5em]">
                {parseInline(line) || <br />}
            </p>
        );
    };

    const parseInline = (text: string) => {
        // Split by bold markers first
        const parts = text.split(/(\*\*.*?\*\*)/g);

        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                // Bold content, now check for italics inside
                const content = part.slice(2, -2);
                return <strong key={i}>{parseItalic(content)}</strong>;
            }
            return <React.Fragment key={i}>{parseItalic(part)}</React.Fragment>;
        });
    };

    const parseItalic = (text: string) => {
        const parts = text.split(/(_.*?_)/g);
        return parts.map((part, i) => {
            if (part.startsWith('_') && part.endsWith('_')) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    // Split content by newlines to handle blocks
    const lines = content.split('\n');

    // Group list items
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    lines.forEach((line, i) => {
        if (line.trim().startsWith('- ')) {
            currentList.push(parseLine(line, i));
        } else {
            if (currentList.length > 0) {
                elements.push(<ul key={`list-${i}`} className="mb-2">{currentList}</ul>);
                currentList = [];
            }
            elements.push(parseLine(line, i));
        }
    });

    if (currentList.length > 0) {
        elements.push(<ul key={`list-end`} className="mb-2">{currentList}</ul>);
    }

    return <div className={className}>{elements}</div>;
};

export default MarkdownRenderer;
