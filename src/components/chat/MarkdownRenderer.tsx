'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { CitationBadge } from './CitationBadge'
import { PeptidePill, PEPTIDE_REGEX } from './PeptidePill'
import type { Source } from '@/types'

interface MarkdownRendererProps {
  content: string
  sources?: Source[]
  onAddToStack?: (peptideId: string) => void
  onLearnMore?: (message: string) => void
  /** When true, skip interactive elements like peptide pills to prevent flickering */
  isStreaming?: boolean
}

export function MarkdownRenderer({ content, sources = [], onAddToStack, onLearnMore, isStreaming = false }: MarkdownRendererProps) {
  // Replace citation markers [1], [2], etc. with interactive badges
  const processedContent = content.replace(
    /\[(\d+)\]/g,
    (match, num) => `<citation data-index="${num}">${match}</citation>`
  )

  // Process text to add peptide pills (skip during streaming to prevent flickering)
  const processPeptides = (text: string): React.ReactNode[] => {
    // During streaming, just return plain text to avoid pill flickering
    if (isStreaming) {
      return [text]
    }

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    // Reset regex state
    PEPTIDE_REGEX.lastIndex = 0

    while ((match = PEPTIDE_REGEX.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      // Add the peptide pill
      parts.push(
        <PeptidePill
          key={`peptide-${match.index}`}
          name={match[0]}
          onAddToStack={onAddToStack}
          onLearnMore={onLearnMore}
        />
      )
      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts.length > 0 ? parts : [text]
  }

  return (
    <div className="prose prose-slate dark:prose-invert prose-sm max-w-none break-words overflow-hidden
      prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
      prose-h2:text-lg prose-h2:mt-5 prose-h2:mb-3 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 dark:prose-h2:border-slate-700
      prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-blue-600 dark:prose-h3:text-blue-400
      prose-p:my-2 prose-p:leading-relaxed
      prose-li:my-0.5 prose-li:marker:text-blue-500
      prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-semibold
      prose-hr:my-4 prose-hr:border-slate-300 dark:prose-hr:border-slate-600
      [&>*:first-child]:mt-0
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom code block rendering
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match

            if (isInline) {
              return (
                <code
                  className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-700"
                  {...props}
                >
                  {children}
                </code>
              )
            }

            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="rounded-lg !bg-slate-900 !text-sm"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },

          // Custom link rendering (open in new tab)
          a({ node, children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
                {...props}
              >
                {children}
              </a>
            )
          },

          // Custom paragraph to handle citation badges and peptide pills
          p({ node, children, ...props }) {
            // Process text for citations and peptides
            const processChildren = (child: React.ReactNode, parentIndex: number = 0): React.ReactNode => {
              if (typeof child === 'string') {
                // First split by citation pattern
                const citationParts = child.split(/(\[\d+\])/)
                return citationParts.map((part, index) => {
                  const citationMatch = part.match(/\[(\d+)\]/)
                  if (citationMatch) {
                    const sourceIndex = parseInt(citationMatch[1]) - 1
                    const source = sources[sourceIndex]
                    return (
                      <CitationBadge
                        key={`citation-${parentIndex}-${index}`}
                        index={parseInt(citationMatch[1])}
                        source={source}
                      />
                    )
                  }
                  // Now process for peptide names
                  return processPeptides(part).map((peptidePart, pIndex) => {
                    if (typeof peptidePart === 'string') {
                      return <span key={`text-${parentIndex}-${index}-${pIndex}`}>{peptidePart}</span>
                    }
                    return peptidePart
                  })
                })
              }
              return child
            }

            const processedChildren = Array.isArray(children)
              ? children.map((child, idx) => processChildren(child, idx))
              : processChildren(children)

            return <p {...props}>{processedChildren}</p>
          },

          // Style tables professionally
          table({ node, children, ...props }) {
            return (
              <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props}>
                  {children}
                </table>
              </div>
            )
          },

          thead({ node, children, ...props }) {
            return (
              <thead className="bg-slate-50 dark:bg-slate-800" {...props}>
                {children}
              </thead>
            )
          },

          th({ node, children, ...props }) {
            return (
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider" {...props}>
                {children}
              </th>
            )
          },

          td({ node, children, ...props }) {
            return (
              <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300" {...props}>
                {children}
              </td>
            )
          },

          tr({ node, children, ...props }) {
            return (
              <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0" {...props}>
                {children}
              </tr>
            )
          },

          // Custom h2 rendering with peptide pill support
          h2({ node, children, ...props }) {
            // Process text for peptides in headings
            const processHeadingChildren = (child: React.ReactNode, idx: number = 0): React.ReactNode => {
              if (typeof child === 'string') {
                return processPeptides(child).map((part, pIndex) => {
                  if (typeof part === 'string') {
                    return <span key={`h2-text-${idx}-${pIndex}`}>{part}</span>
                  }
                  return part
                })
              }
              return child
            }

            const processedChildren = Array.isArray(children)
              ? children.map((child, idx) => processHeadingChildren(child, idx))
              : processHeadingChildren(children)

            return (
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700" {...props}>
                {processedChildren}
              </h2>
            )
          },

          // Custom h3 rendering with emoji support and peptide pills
          h3({ node, children, ...props }) {
            // Process text for peptides in headings
            const processHeadingChildren = (child: React.ReactNode, idx: number = 0): React.ReactNode => {
              if (typeof child === 'string') {
                return processPeptides(child).map((part, pIndex) => {
                  if (typeof part === 'string') {
                    return <span key={`h3-text-${idx}-${pIndex}`}>{part}</span>
                  }
                  return part
                })
              }
              return child
            }

            const processedChildren = Array.isArray(children)
              ? children.map((child, idx) => processHeadingChildren(child, idx))
              : processHeadingChildren(children)

            return (
              <h3 className="flex items-center gap-2 text-base font-semibold text-blue-600 dark:text-blue-400 mt-5 mb-2" {...props}>
                {processedChildren}
              </h3>
            )
          },

          // Style blockquotes as research findings
          blockquote({ node, children, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 pl-4 pr-3 py-2 my-3 rounded-r-lg text-slate-700 dark:text-slate-300 italic"
                {...props}
              >
                {children}
              </blockquote>
            )
          },

          // Style lists
          ul({ node, children, ...props }) {
            return (
              <ul className="my-2 space-y-1" {...props}>
                {children}
              </ul>
            )
          },

          ol({ node, children, ...props }) {
            return (
              <ol className="my-2 space-y-1" {...props}>
                {children}
              </ol>
            )
          },

          li({ node, children, ...props }) {
            // Process text for peptides in list items
            const processLiChildren = (child: React.ReactNode, idx: number = 0): React.ReactNode => {
              if (typeof child === 'string') {
                return processPeptides(child).map((part, pIndex) => {
                  if (typeof part === 'string') {
                    return <span key={`li-text-${idx}-${pIndex}`}>{part}</span>
                  }
                  return part
                })
              }
              return child
            }

            const processedChildren = Array.isArray(children)
              ? children.map((child, idx) => processLiChildren(child, idx))
              : processLiChildren(children)

            return (
              <li className="text-slate-700 dark:text-slate-300" {...props}>
                {processedChildren}
              </li>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
