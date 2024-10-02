'use client'

import React, { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { Button } from '@/components/ui/button'
import { Bold, Highlighter, Palette } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function NotebookEditor() {
  const [content, setContent] = useState('<p>Start writing here...</p>')
  const [isFocused, setIsFocused] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)
  const [color, setColor] = useState('#000000')

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    onSelectionUpdate: ({ editor }) => {
      const { from } = editor.state.selection
      let dom = editor.view.domAtPos(from).node
      
      if (dom.nodeType === 3) {
        dom = dom.parentElement
      }

      const lineNumber = dom?.closest('p')?.offsetTop || 0
      setCurrentLine(lineNumber)
    },
  })

  // Set bold text
  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run()
  }

  // Toggle highlight on text
  const toggleHighlight = () => {
    editor?.chain().focus().toggleHighlight().run()
  }

  // Set text color
  const setTextColor = useCallback((color) => { // Removed type annotation
    editor?.chain().focus().setColor(color).run()
  }, [editor])
  // Handle clicking on a line to set cursor position
  const handleLineClick = (event) => {
    if (editor) {
      const lineHeight = 32 // This should match the line height in your CSS
      const clickedLine = Math.floor((event.nativeEvent.offsetY - 40) / lineHeight) // 40px offset for the toolbar
      const targetPos = editor.view.posAtCoords({ left: event.clientX, top: event.clientY })
      
      if (targetPos) {
        editor.commands.setTextSelection(targetPos.pos)
        editor.commands.focus()
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto my-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden relative">
        {/* Toolbar with color picker and formatting buttons */}
        <div className="flex justify-start p-2 border-b">
          <Button onClick={toggleBold} variant="outline" size="icon" className="mr-2">
            <Bold className="h-4 w-4" />
          </Button>
          <Button onClick={toggleHighlight} variant="outline" size="icon" className="mr-2">
            <Highlighter className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Palette className="h-4 w-4" style={{ color: color }} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <HexColorPicker color={color} onChange={(newColor) => {
                setColor(newColor)
                setTextColor(newColor) // Set text color when color is picked
              }} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Notebook lines and click-to-focus behavior */}
        <div
          className="absolute left-0 w-full"
          style={{
            top: `${currentLine + 40}px`,
            height: '32px',
            backgroundColor: 'rgba(255, 229, 100, 0.3)',
            zIndex: -1,
          }}
        />
        <div 
          onClick={handleLineClick} // Click-to-set cursor position
          className="relative"
          style={{
            cursor: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z\'/%3E%3Cpath d=\'m15 5 4 4\'/%3E%3C/svg%3E") 0 24, auto', // Custom cursor icon for "pen"
          }}
        >
          <EditorContent
            editor={editor}
            className={`min-h-[500px] p-6 pl-8 outline-none transition-all duration-300 ease-in-out ${
              isFocused ? 'bg-yellow-50' : ''
            }`}
            style={{
              backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)`,
              backgroundSize: '100% 32px',
              lineHeight: '32px',
              paddingTop: '4px',
              fontFamily: 'Courier, monospace',
              caretColor: '#2563eb',
              caretWidth: '2px',
            }}
          />
        </div>
      </div>
      <style jsx global>{`
        .ProseMirror p {
          margin: 0;
        }
        .ProseMirror {
          caret-color: #2563eb;
        }
        .ProseMirror:focus {
          outline: none;
          box-shadow: none;
        }
        .ProseMirror::selection {
          background: rgba(255, 229, 100, 0.3);
        }
        .ProseMirror p::before {
          content: attr(data-line);
          display: inline-block;
          width: 2em;
          margin-left: -2em;
          text-align: right;
          margin-right: 1em;
          color: #9ca3af;
          user-select: none;
        }
      `}</style>
    </div>
  )
}
